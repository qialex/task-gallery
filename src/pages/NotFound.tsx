import { Link, Stack, Typography } from "@mui/material";
import { Link as ReactRouterLink } from 'react-router-dom';

const NotFound = () => {
  const urlReferrer = document.referrer
 
  return (
    <Stack padding={20} justifyContent={'center'} alignItems={'center'}>
      <Stack>
        <Typography variant="h5">
          Not Found
        </Typography>
      </Stack>
      <Stack justifyContent={'center'} alignItems={'center'} sx={{mt: 4}}>
        <Typography variant="body1">
          Some useful links: 
        </Typography>
        <Link 
          sx={{mt: 1}}
          component={ReactRouterLink} 
          to={'/'}
        >
          Gallery page
        </Link>  
      </Stack>
      {urlReferrer ? 
        <Stack justifyContent={'center'} alignItems={'center'} sx={{mt: 4}}>
          <Typography variant="body1">
            Previous page: 
          </Typography>
          <Link 
            sx={{mt: 1}}
            component={ReactRouterLink} 
            to={urlReferrer}
          >
            {urlReferrer}
          </Link>  
        </Stack>
      : '' }
    </Stack>
  );
};

export default NotFound;
