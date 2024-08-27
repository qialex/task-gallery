import { Link, Stack, Typography } from "@mui/material";
import { Link as ReactRouterLink } from 'react-router-dom';

const NotFound = () => {
  const urlReferrer = document.referrer
  const searchParams = new URLSearchParams(window.location.search)
  const urlHost = new URL (window.location.origin)
  searchParams.set('page', '1')
  urlHost.search = searchParams.toString()
 
  return (
    <Stack padding={20} justifyContent={'center'} alignItems={'center'}>
      <Stack>
        <Typography variant="h5">
          Not Found
        </Typography>
      </Stack>
      <Stack justifyContent={'center'} alignItems={'center'} sx={{mt: 4}}>
        <Typography variant="body1">
          First page: 
        </Typography>
        <Link 
          sx={{mt: 1}}
          component={ReactRouterLink} 
          to={urlHost.href}
        >
          {urlHost.href}
        </Link>  
      </Stack>
      {urlReferrer && urlReferrer !== urlHost.href ? 
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
