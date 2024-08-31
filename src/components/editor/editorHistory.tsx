import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Chip, Divider, IconButton, List, ListItemButton, ListItemText, Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';

import { EditorChangeType } from '../../constants';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloseIcon from '@mui/icons-material/Close';
import { BlurProps, EditorAction, GreyscaleProps, ResizeProps } from '../../types';
import { getImageEditorById, DeleteLastEditorHistoryItem, ShangeEditorHistoryActive } from '../../slices/imageEditorSlice';

export default function EditorHistory(props: {id: number, onClose: () => void}) {
  const dispatch = useAppDispatch();
  const { id } = props;
  // editor item
  const getImageEditorByIdMemo = React.useMemo(() => getImageEditorById(id), [id])
  const editorImage = useAppSelector(getImageEditorByIdMemo)
  // history props
  const editorActions = (editorImage?.editorActions || [])

  const image  = editorImage?.image;
  
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
              <ListItemText primary={<Typography style={{  fontWeight: 'bold' }}>Original image</Typography>} />
            </ListItemButton>

            {editorActions.map((editorAction, i) => {
              const textParts = editorHistoryGetDescription(editorAction)
              return (
                <ListItemButton 
                  onClick={() => handleHistoryItemClick(image?.id, i)}
                  key={image?.id.toString() + i.toString()}
                  selected={editorAction.active}
                >
                  <ListItemText primary={<>
                    {textParts.key}
                    <Chip sx={{ml: 1}} label={textParts.value} />
                  </>}  />
                  
                  <IconButton 
                    onClick={handleDeleteClick}
                    edge="end" 
                    aria-label={isToDelete ? 'Delete' : 'Confirm delete'}
                    sx={{visibility: i === editorActions.length - 1 ? 'visible' : 'hidden', ml: 1}}
                  >
                    {isToDelete ? <DeleteForeverIcon /> : <CloseIcon /> }
                  </IconButton>
                </ListItemButton>
              )
            })}
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

const editorHistoryGetDescription = (editorAction: EditorAction) => {
  const textParts = {key: '', value: ''}

  switch(editorAction.type) {
    case EditorChangeType.greyscale:
      const greyscaleProps = editorAction.props as GreyscaleProps
      textParts.key = 'Greyscale'
      textParts.value = `${greyscaleProps.isGreyscale ? 'Yes' : 'No'}`
      break;
    case EditorChangeType.blur:
      const blurProps = editorAction.props as BlurProps
      textParts.key = 'Blur'
      textParts.value = `${blurProps.blur.toString()}`
      break;
    case EditorChangeType.resize:
      const resizeProps = editorAction.props as ResizeProps
      textParts.key = 'Resize'
      textParts.value = `${resizeProps.wAbs.toString()}x${resizeProps.hAbs.toString()}`
      break;
  }

  return textParts
}