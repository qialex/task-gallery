import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Checkbox, Divider, FormControl, FormControlLabel, FormGroup, InputAdornment, Stack, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { parseNumValue } from '../../utils';
import { ResizeProps } from '../../types';
import { EDITOR_SIZE_MAX_PERCENT, EDITOR_SIZE_MAX_PX, EDITOR_SIZE_MIN_PERCENT, EDITOR_SIZE_MIN_PX, EditorChangeType, resizePropsInitial } from '../../constants';
import { addEditorChange, getEditorItemsById } from '../../slices/imageSlice';
import { showNotificationNoChanges } from '../../slices/notificationSlice';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

export default function EditorResize(props: {id: number, onClose: () => void}) {
  const dispatch = useAppDispatch();
  const { id } = props;
  // editor item
  const getEditorItemsByIdMemo = React.useMemo(() => getEditorItemsById(id), [id])
  const editorItem = useAppSelector(getEditorItemsByIdMemo)
  // history props
  const currentSize = editorItem?.size || {width: 0, height: 0}

  const maxPercent = {
    w: Math.floor(( EDITOR_SIZE_MAX_PX / (editorItem?.size.width  || 0) ) * 100), 
    h: Math.floor(( EDITOR_SIZE_MAX_PX / (editorItem?.size?.height || 0) ) * 100),
  }

  const [form, setForm] = React.useState<ResizeProps>(
    {...resizePropsInitial, w: (currentSize.width || 0).toString(), h: (currentSize.height || 0).toString(), wAbs: (currentSize.width || 0), hAbs: (currentSize.height || 0),}
  )

  const beforeSetForm = (newValues: ResizeProps): void => {
    newValues.wAbs = form.isPercentage ? Math.round((currentSize.width  || 0) * parseInt(newValues.w) / 100) || currentSize.width  : parseInt(newValues.w);
    newValues.hAbs = form.isPercentage ? Math.round((currentSize.height || 0) * parseInt(newValues.h) / 100) || currentSize.height : parseInt(newValues.h);

    setForm(newValues)
  }

  const handleCheckboxChange = (key: keyof ResizeProps): void => {
    const newValues = {...form, [key]: !form[key]}
    if (key === 'isPercentage') {
      newValues.w = Math.round( !form[key] ? parseInt(newValues.w) / (currentSize.width  || 0) * 100 : (currentSize.width  || 0) * parseInt(newValues.w) / 100).toString()
      newValues.h = Math.round( !form[key] ? parseInt(newValues.h) / (currentSize.height || 0) * 100 : (currentSize.height || 0) * parseInt(newValues.h) / 100).toString()
    }

    beforeSetForm(newValues)
  }

  const handleArrowsClickChange = (key: keyof ResizeProps, n: number): void => {
    calculateFinalValue(key, (parseInt(form[key] as string) + n).toString())
  }

  const calculateFinalValue = (key: keyof ResizeProps, newValue: string): void => {
    const newValues = {...form, [key]: newValue};
    const firstKey = key === 'w' ? 'w' : 'h';
    const secondKey = key === 'w' ? 'h' : 'w';

    if (newValue) {
      const newValueNorm = Math.max(Math.min(parseInt(newValue), form.isPercentage ? Math.min(EDITOR_SIZE_MAX_PERCENT, maxPercent[firstKey]) : EDITOR_SIZE_MAX_PX), form.isPercentage ? EDITOR_SIZE_MIN_PERCENT : EDITOR_SIZE_MIN_PX)
      newValues[firstKey] = newValueNorm.toString()
      if (form.isAspect) {
        if (form.isPercentage) {
          const step1 = parseInt(form[secondKey]) + newValueNorm - parseInt(form[key].toString());
          const step2 = step1 ? Math.max(Math.min(step1, Math.min(EDITOR_SIZE_MAX_PERCENT, maxPercent[secondKey])), EDITOR_SIZE_MIN_PERCENT) : newValueNorm || ''
          newValues[secondKey] = step2.toString()
        } else {
          const aspectRatio = currentSize.width && currentSize.height ? (key === 'w' ? currentSize.width / currentSize.height : currentSize.height / currentSize.width) : 1
          const step1 = Math.round(parseInt(form[secondKey]) + (newValueNorm - parseInt(form[key].toString())) / aspectRatio)
          const step2 = step1 ? Math.max(Math.min(step1, EDITOR_SIZE_MAX_PX), EDITOR_SIZE_MIN_PX) : newValueNorm || ''
          newValues[secondKey] = step2.toString()
        }
      }
    } else if (form.isAspect) {
      newValues[secondKey] = newValue
    }
    beforeSetForm(newValues)
  }

  // handle user change
  const handleInputChange = (key: keyof ResizeProps, newValue: string): void => {
    calculateFinalValue(key, (parseNumValue(newValue) || '').toString())
  }

  // handle blur as submit
  const handleBlur = (key: keyof ResizeProps): void => {
    if (!form[key]) {
      calculateFinalValue(key, (form.isPercentage ? '100' : (currentSize[key === 'w' ? 'width' : 'height'] || 0)).toString())
    }
  }

  // close 
  const handleCancel = () => {
    props.onClose()
  }

  // handle submit
  const handleSubmit = () => {
    if (editorItem && editorItem?.image) {
      if (form.wAbs === editorItem.size.width && form.hAbs === editorItem.size.height) {
        dispatch(showNotificationNoChanges());
        return
      }
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
        <Stack direction={'row'} justifyContent={'space-between'}>
          <Typography gutterBottom variant="h5" component="div">
            Resize
          </Typography>
          <Typography variant="caption" gutterBottom sx={{ display: 'block', mt: 1 }}>
            Max size: {EDITOR_SIZE_MAX_PX}px
          </Typography>
        </Stack>
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
              onKeyUp={(e) => handleInputChange('w', (e?.target as HTMLInputElement)?.value || '')}
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
              onKeyUp={(e) => handleInputChange('h', (e?.target as HTMLInputElement)?.value || '')}
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
      <Stack sx={{ width: '100%', mt: 3 }}>
        <Typography gutterBottom variant="h6" component="div">
          Result
        </Typography>
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography sx={{width: '40%'}} variant='body1'>Width (px)</Typography>
          <Typography sx={{width: '25%'}} variant='body1'>{currentSize.width}</Typography>
          <ArrowRightAltIcon sx={{width: '10%'}} />
          <Typography sx={{justifyContent: 'end', display: 'flex', width: '25%'}} variant='body1'>{form.wAbs}</Typography>
        </Stack>
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography sx={{width: '40%'}} variant='body1'>Height (px)</Typography>
          <Typography sx={{width: '25%'}} variant='body1'>{currentSize.height}</Typography>
          <ArrowRightAltIcon sx={{width: '10%'}} />
          <Typography sx={{justifyContent: 'end', display: 'flex', width: '25%'}} variant='body1'>{form.hAbs}</Typography>
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