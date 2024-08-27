import Grid from "@mui/material/Grid";
import { AppBar, Button, Container, IconButton, Toolbar } from "@mui/material";
import LimitSelect from "../pagination/LimitSelect";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store";
import { setPagination } from "../../slices/imageSlice";
import { PaginationChangeType } from "../../constants";
import PageInput from "../pagination/pageInput";
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function NavPagination () {
  const dispatch = useAppDispatch();
  const isFirstPage = useAppSelector((state: RootState) => state.images.pagination.page === 1);

  // handle chaning the items per page
  const handlePageClick = (type: PaginationChangeType) => {
    dispatch(setPagination({pageChangeType: type}));
  }

  return (
    <AppBar position="fixed" color="inherit" sx={{ top: 'auto', bottom: 0 }} >
      <Container maxWidth={'md'}>
        <Toolbar disableGutters sx={{minHeight: '68px'}}>
          <Grid container justifyContent="space-between" sx={{minHeight: '68px', paddingTop: '14px'}}>
            <Grid item>
              <Button 
                sx={{display: {xs: 'none', md: 'flex'}}}
                onClick={() => handlePageClick(PaginationChangeType.firstPage)}
                disabled={isFirstPage}
                startIcon={<KeyboardDoubleArrowLeftIcon />}
              >
                First Page
              </Button>
              <IconButton 
                onClick={() => handlePageClick(PaginationChangeType.firstPage)}
                color="primary"
                aria-label="First Page"
                sx={{display: {xs: 'block', md: 'none'}}}
              >
                <KeyboardDoubleArrowLeftIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <Button 
                sx={{display: {xs: 'none', md: 'flex'}}}
                onClick={() => handlePageClick(PaginationChangeType.previousPage)}
                disabled={isFirstPage}
                startIcon={<KeyboardArrowLeftIcon />}
              >
                Previous Page
              </Button>
              <IconButton 
                onClick={() => handlePageClick(PaginationChangeType.previousPage)}
                color="primary"
                aria-label="Previous Page"
                sx={{display: {xs: 'block', md: 'none'}}}
              >
                <KeyboardArrowLeftIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <PageInput />
            </Grid>
            <Grid item>
              <Button 
                sx={{display: {xs: 'none', md: 'flex'}}}
                onClick={() => handlePageClick(PaginationChangeType.nextPage)}
                endIcon={<KeyboardArrowRightIcon />}
              >
                Next Page
              </Button>
              <IconButton 
                onClick={() => handlePageClick(PaginationChangeType.nextPage)}
                color="primary"
                aria-label="Next Page"
                sx={{display: {xs: 'block', md: 'none'}}}
              >
                <KeyboardArrowRightIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <LimitSelect />
            </Grid>
          </Grid>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
