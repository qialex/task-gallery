import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Checkbox, Divider, FormControl, FormControlLabel, FormGroup, InputAdornment, Stack, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { RootState } from '../../store';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { parseNumValue } from '../../utils';
import { ResizeProps } from '../../types';
import { EDITOR_SIZE_MAX_PERCENT, EDITOR_SIZE_MAX_PX, EDITOR_SIZE_MIN_PERCENT, EDITOR_SIZE_MIN_PX, EditorChangeType, resizePropsInitial } from '../../constants';
import { addEditorChange } from '../../slices/imageSlice';

export default function EditorResize(props: {id: number, onClose: () => void}) {
  const dispatch = useAppDispatch();
  const { id } = props;
  const editorItem = useAppSelector((state: RootState) => state.images.editorItems.find(item => item?.image?.id === id));
  const historyProps = (editorItem?.editorActions || []).filter(h => h.type === EditorChangeType.resize).reverse()[0]?.props as ResizeProps

  const image  = editorItem?.image;
  const [form, setForm] = React.useState<ResizeProps>(
    historyProps ? 
    {...historyProps} :
    {...resizePropsInitial, w: (image?.width || 0).toString(), h: (image?.height || 0).toString()}
  )

  const handleCheckboxChange = (key: keyof ResizeProps): void => {
    const newValues = {...form, [key]: !form[key]}
    if (key === 'isPercentage') {
      newValues.w = Math.round( !form[key] ? parseInt(form.w) / (image?.width  || 0) * 100 : (image?.width  || 0) * parseInt(form.w) / 100).toString()
      newValues.h = Math.round( !form[key] ? parseInt(form.h) / (image?.height || 0) * 100 : (image?.height || 0) * parseInt(form.h) / 100).toString()
    }
    setForm(newValues)
  }

  const handleArrowsClickChange = (key: keyof ResizeProps, n: number): void => {
    calculateFinalValue(key, (parseInt(form[key] as string) + n).toString())
  }

  const calculateFinalValue = (key: keyof ResizeProps, newValue: string): void => {
    const newValues = {...form, [key]: newValue};
    const firstKey = key === 'w' ? 'w' : 'h';
    const secondKey = key === 'w' ? 'h' : 'w';

    if (newValue) {
      const newValueNorm = Math.max(Math.min(parseInt(newValue), form.isPercentage ? EDITOR_SIZE_MAX_PERCENT : EDITOR_SIZE_MAX_PX), form.isPercentage ? EDITOR_SIZE_MIN_PERCENT : EDITOR_SIZE_MIN_PX)
      newValues[firstKey] = newValueNorm.toString()
      if (form.isAspect) {
        if (form.isPercentage) {
          const step1 = parseInt(form[secondKey]) + newValueNorm - parseInt(form[key].toString());
          const step2 = step1 ? Math.max(Math.min(step1, EDITOR_SIZE_MAX_PERCENT), EDITOR_SIZE_MIN_PERCENT) : newValueNorm || ''
          newValues[secondKey] = step2.toString()
        } else {
          const aspectRatio = image?.width && image.height ? (key === 'w' ? image.width / image.height : image.height / image.width) : 1
          const step1 = Math.round(parseInt(form[secondKey]) + (newValueNorm - parseInt(form[key].toString())) / aspectRatio)
          const step2 = step1 ? Math.max(Math.min(step1, EDITOR_SIZE_MAX_PX), EDITOR_SIZE_MIN_PX) : newValueNorm || ''
          newValues[secondKey] = step2.toString()
        }
      }
    } else if (form.isAspect) {
      newValues[secondKey] = newValue
    }

    setForm(newValues)
  }

  // handle user change
  const handleInputChange = (key: keyof ResizeProps, newValue: string): void => {
    calculateFinalValue(key, (parseNumValue(newValue) || '').toString())
  }

  // handle blur as submit
  const handleBlur = (key: keyof ResizeProps): void => {
    if (!form[key]) {
      calculateFinalValue(key, (form.isPercentage ? '100' : (image ? image[key === 'w' ? 'width' : 'height'] : 0)).toString())
    }
  }

  // close 
  const handleCancel = () => {
    props.onClose()
  }

  // handle submit
  const handleSubmit = () => {
    if (editorItem) {
      form.wAbs = form.isPercentage ? Math.round((image?.width  || 0) * parseInt(form.w) / 100) : parseInt(form.w);
      form.hAbs = form.isPercentage ? Math.round((image?.height || 0) * parseInt(form.h) / 100) : parseInt(form.h);
      
      dispatch(
        addEditorChange({
          editorItem: editorItem, 
          editorAction: {
            type: EditorChangeType.resize, 
            props: {...form},
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
          Resize
        </Typography>
        <Stack sx={{ width: '100%' }}>
          <Stack direction={'row'}>
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row >
                <FormControlLabel
                  checked={form.isPercentage}
                  onChange={() => {handleCheckboxChange('isPercentage')}}
                  control={<Checkbox />}
                  label="Use percentage"
                  labelPlacement="end"
                />
              </FormGroup>
            </FormControl>
          </Stack>  
        </Stack>
        <Stack sx={{ width: '100%' }}>
          <Stack direction={'row'}>
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row>
                <FormControlLabel
                  checked={form.isAspect}
                  onChange={() => {handleCheckboxChange('isAspect')}}
                  control={<Checkbox />}
                  label="Maintain aspect ratio"
                  labelPlacement="end"
                />
              </FormGroup>
            </FormControl>
          </Stack>  
        </Stack>
        <Stack sx={{ width: '100%', mt: 2}}>
          <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography variant='h6'>Width</Typography>
            <TextField 
              sx={{width: '160px'}}
              // size='small'
              value={form.w}
              onChange={(e) => handleInputChange('w', e?.target?.value || '')}
              onBlur={() => handleBlur('w')}
              // label="Width" 
              variant="outlined" 
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography>{form.isPercentage ? '%' : 'px'}</Typography>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack>
                      <KeyboardArrowUpIcon sx={{cursor: 'pointer'}} onClick={() => handleArrowsClickChange('w', 1)} />
                      <KeyboardArrowDownIcon sx={{cursor: 'pointer'}} onClick={() => handleArrowsClickChange('w', -1)} />
                    </Stack>
                  </InputAdornment>
                ),
              }}
              />
          </Stack>  
        </Stack>
        <Stack sx={{ width: '100%', mt: 3 }}>
          <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography variant='h6'>Height</Typography>
            <TextField 
              sx={{width: '160px'}}
              value={form.h}
              // size='small'
              onChange={(e) => handleInputChange('h', e?.target?.value || '')}
              onBlur={() => handleBlur('h')}
              // label="Height" 
              variant="outlined" 
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography>{form.isPercentage ? '%' : 'px'}</Typography>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack>
                      <KeyboardArrowUpIcon sx={{cursor: 'pointer'}} onClick={() => handleArrowsClickChange('h', 1)} />
                      <KeyboardArrowDownIcon sx={{cursor: 'pointer'}} onClick={() => handleArrowsClickChange('h', -1)} />
                    </Stack>
                  </InputAdornment>
                ),
              }}
              />
          </Stack>  
        </Stack>
      </Stack>
      <Divider sx={{mt: 4}} />
      <Stack direction={'row'} justifyContent={'end'} spacing={1} mt={3}>
        <Button variant='outlined' onClick={() => handleCancel()}>Cancel</Button>
        <Button variant='contained' onClick={() => handleSubmit()}>Save change</Button>
      </Stack>
    </Stack>
  );
}