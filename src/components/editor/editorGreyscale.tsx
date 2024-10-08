import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Checkbox, Divider, FormControl, FormControlLabel, FormGroup, Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { GreyscaleProps } from '../../types';
import { EditorChangeType } from '../../constants';
import { showNotificationNoChanges } from '../../slices/notificationSlice';
import { addEditorChange, getImageEditorById } from '../../slices/imageEditorSlice';

export default function EditorGreyscale(props: {id: number, onClose: () => void}) {
  const dispatch = useAppDispatch();
  const { id } = props;
  // editor item
  const getImageEditorByIdMemo = React.useMemo(() => getImageEditorById(id), [id])
  const editorImage = useAppSelector(getImageEditorByIdMemo)
  // history props
  // history props
  const historyProps = (editorImage?.editorActions || []).filter(h => h.type === EditorChangeType.greyscale).reverse()[0]?.props as GreyscaleProps
  const [grayscale, setGrayscale] = React.useState<boolean>(historyProps?.isGreyscale || false);


  const handleCheckboxChange = (): void => {
    setGrayscale(!grayscale)
  }

  const handleCancel = () => {
    props.onClose()
  }

  const handleSubmit = () => {
    if (editorImage) {
      if ((!historyProps?.isGreyscale && !grayscale) || (!!historyProps?.isGreyscale === grayscale)) {
        dispatch(showNotificationNoChanges());
        return 
      }
      dispatch(
        addEditorChange({
          editorItem: editorImage, 
          editorAction: {
            type: EditorChangeType.greyscale, 
            props: { isGreyscale: grayscale },
            url: '',
            active: true,
          },
        },),
      );
      props.onClose()
    }
  }

  return (
    <Stack p={2}>
      <Stack>
        <Typography gutterBottom variant="h5" component="div">
          Greyscale
        </Typography>
        <Stack mt={1}>
          <Stack direction={'row'}>
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row >
                <FormControlLabel
                  checked={grayscale}
                  onChange={handleCheckboxChange}
                  control={<Checkbox />}
                  label="Greyscale"
                  labelPlacement="end"
                />
              </FormGroup>
            </FormControl>
          </Stack>  
        </Stack>
      </Stack>
      <Divider sx={{mt: 2}} />
      <Stack direction={'row'} justifyContent={'end'} spacing={1} mt={3}>
        <Button variant='outlined' onClick={() => handleCancel()}>Cancel</Button>
        <Button variant='contained' onClick={() => handleSubmit()}>Save change</Button>
      </Stack>
    </Stack>
  );
}