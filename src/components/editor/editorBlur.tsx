import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Divider, Slider, Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { RootState } from '../../store';
import { BlurProps } from '../../types';
import { EditorChangeType } from '../../constants';
import { setEditorChange } from '../../slices/imageSlice';
import BlurLinearIcon from '@mui/icons-material/BlurLinear';

export default function EditorBlur(props: {id: number, onClose: () => void}) {
  const dispatch = useAppDispatch();
  const { id } = props;
  const editorItem = useAppSelector((state: RootState) => state.images.editorItems.find(item => item?.image?.id === id));
  const historyProps = (editorItem?.history || []).filter(h => h.type === EditorChangeType.blur).reverse()[0]?.props as BlurProps
  const [blur, setBlur] = React.useState<number>(historyProps?.blur || 0);

  const handleBlur = (e: Event) => {
    setBlur((e.target as any).value || 0)
  }

  const handleCancel = () => {
    props.onClose()
  }

  const handleSubmit = () => {
    if (editorItem) {
      dispatch(
        setEditorChange({
          editorItem: editorItem, 
          historyItem: {
            type: EditorChangeType.blur, 
            props: { blur },
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
          Blur
        </Typography>
        <Stack mt={2}>
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            <BlurLinearIcon />
            <Slider
              aria-label="Blur"
              marks={new Array(11).fill(0).map((_, i) => ({value: i, label: i.toString()}))}
              value={blur}
              onChange={handleBlur}
              step={1}
              min={0}
              max={10}
              sx={{width: '80%'}}
            />
          </Stack>  
        </Stack>
      </Stack>
      <Divider sx={{mt: 5}} />
      <Stack direction={'row'} justifyContent={'end'} spacing={1} mt={3}>
        <Button variant='outlined' onClick={() => handleCancel()}>Cancel</Button>
        <Button variant='contained' onClick={() => handleSubmit()}>Save change</Button>
      </Stack>
    </Stack>
  );
}