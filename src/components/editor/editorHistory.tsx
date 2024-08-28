import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Divider, IconButton, List, ListItemButton, ListItemText, Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { RootState } from '../../store';

import { editorChangeTypeTitles } from '../../constants';
import { DeleteLastEditorHistoryItem, ShangeEditorHistoryActive } from '../../slices/imageSlice';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloseIcon from '@mui/icons-material/Close';

export default function EditorHistory(props: {id: number, onClose: () => void}) {
  const dispatch = useAppDispatch();
  const { id } = props;
  const editorItem = useAppSelector((state: RootState) => state.images.editorItems.find(item => item?.image?.id === id));
  const editorActions = (editorItem?.editorActions || [])

  const image  = editorItem?.image;
  
  const [isToDelete, setIsToDelete] = React.useState<boolean>(false)

  const handleHistoryItemClick = (id: number|undefined, i: number) => {
    if (typeof id === 'number') {
      dispatch(ShangeEditorHistoryActive({id, index: i}))
    }
  }

  // close 
  const handleCancel = () => {
    props.onClose()
  }

  const handleDeleteClick = (e: React.MouseEvent<HTMLElement>) => {
    // stop propagation
    e.preventDefault()
    e.stopPropagation()

    // confirm delete
    if (!isToDelete) {
      setIsToDelete(true)
    } else if (typeof image?.id === 'number') {
      dispatch(DeleteLastEditorHistoryItem(image.id))
      setIsToDelete(false)
    }
  }

  return (
    <Stack p={2}>
      <Stack>
        <Typography gutterBottom variant="h5" component="div">
          History
        </Typography>
        <Stack sx={{ width: '100%' }}>
          <List component="nav" aria-label="main mailbox folders">
            {/* Initial image */}
            <ListItemButton 
              onClick={() => handleHistoryItemClick(image?.id, -1)}
              key={`${image?.id.toString()}_initial_state`}
              selected={true}
            >
              <ListItemText primary="Initial image" />
            </ListItemButton>

            {editorActions.map((editorAction, i) => 
              <ListItemButton 
                onClick={() => handleHistoryItemClick(image?.id, i)}
                key={image?.id.toString() + i.toString()}
                selected={editorAction.active}
              >
                <ListItemText primary={editorChangeTypeTitles[editorAction.type] } />
                {i === editorActions.length - 1 ?
                  <IconButton 
                    onClick={handleDeleteClick}
                    edge="end" 
                    aria-label={isToDelete ? 'Delete' : 'Confirm delete'}
                  >
                    {isToDelete ? <DeleteForeverIcon /> : <CloseIcon /> }
                  </IconButton>
                : '' }
              </ListItemButton>
            )}
          </List>
        </Stack>
      </Stack>
      <Divider sx={{mt: 4}} />
      <Stack direction={'row'} justifyContent={'end'} spacing={1} mt={3}>
        <Button variant='outlined' onClick={() => handleCancel()}>Close</Button>
      </Stack>
    </Stack>
  );
}