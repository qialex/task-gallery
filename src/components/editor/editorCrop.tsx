import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { InputAdornment, Stack, TextField } from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

export default function EditorCrop() {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Crop options
        </Typography>
        <Stack sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          <Stack direction={'row'}>
            <Typography>Width</Typography>
            <TextField 
              label="Outlined" 
              variant="outlined" 
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <UnfoldMoreIcon fontSize='large' />
                  </InputAdornment>
                ),
              }}
              />
          </Stack>  
        </Stack>
      </CardContent>
      <CardActions>
        <Button size="small">Cancel</Button>
        <Button size="small">Crop image</Button>
      </CardActions>
    </Card>
  );
}