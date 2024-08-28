import { useEffect, useMemo } from "react";
import { Button, Grid, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { getImages, selectGridPageData } from "../slices/imageSlice";
import { ImageStoreItem } from "../types";
import { ImageApiStatus, RequestPhase } from "../constants";
import CachedIcon from '@mui/icons-material/Cached';
import NotFound from "./NotFound";
import { ImagesCard } from "../components/image/ImageCard";
import PageLoading from "../components/loading";

export default function GridImagesPage () {
  const selectGridPageDataMemo = useMemo(() => selectGridPageData, [])
  const { items, status } = useAppSelector(selectGridPageDataMemo)
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getImages())
  }, [items, dispatch]);

  const handleReloadClick = () => {
    dispatch(getImages())
  }

  return (
    <>
      {/* Errors on the page */}
      {items.find(item => item.status === ImageApiStatus.error) ? <>
        <Stack alignItems={'center'} justifyContent={'center'} sx={{padding:10}}>        
          <Button 
            startIcon={<CachedIcon fontSize="large" />} 
            variant="contained" 
            size="large" 
            sx={{width: '20rem', height: '4rem'}}
            onClick={handleReloadClick}
          >
            Reload page
          </Button>
        </Stack>
      </> : ''}

      {/* Empty page */}
      {items.every(item => item.status === ImageApiStatus.doensExist) && status !== RequestPhase.loading ? <> 
        <NotFound />
      </> : ''}
      {/* Loading */}
      <PageLoading />

      {/* Normal grid page */}
      <Grid container spacing={2}>
        {items.map((item: ImageStoreItem, i: number) => 
          {
            return <Grid item key={(item.image?.id || '').toString() + i.toString()} xs={12} sm={6} md={4} lg={3} xl={2}>
              {ImageApiStatus.loaded === item.status ? <ImagesCard item={item} enableHeaderLinks={true} enableBottomActions={true} /> : ''}
            </Grid>;
          }
        )}
      </Grid>
    </>
  );
}
