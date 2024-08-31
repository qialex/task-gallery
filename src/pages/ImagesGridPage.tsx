import { useEffect, useMemo } from "react";
import { Button, Grid, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { GridIndex } from "../types";
import { ImageApiStatus } from "../constants";
import CachedIcon from '@mui/icons-material/Cached';
import NotFound from "./NotFound";
import { ImagesCard } from "../components/image/ImageCard";
import { selectImagesGrid } from "../slices/imagesGridSlice";
import { getImages } from "../slices/api/ApiSlice";


export default function ImagesGridPage () {
  const selectImagesGridMemo = useMemo(selectImagesGrid, [])
  const gridIndexes = useAppSelector(selectImagesGridMemo)

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getImages())
  }, [gridIndexes, dispatch]);

  const handleReloadClick = () => {
    dispatch(getImages())
  }

  return (
    <>
      {/* Errors on the page */}
      {gridIndexes.find((gridIndex: GridIndex) => gridIndex.apiStatus === ImageApiStatus.error) ? <>
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
      {(gridIndexes || []).length && gridIndexes.every((gridIndex: GridIndex) => gridIndex.apiStatus === ImageApiStatus.doensExist) ? <> 
        <NotFound />
      </> : ''}

      {/* Normal grid page */}
      <Grid container spacing={2}>
        {gridIndexes.map((gridIndex: GridIndex, i: number) => 
          {
            return <Grid item key={gridIndex.index.toString() + i.toString()} xs={12} sm={6} md={4} lg={3} xl={2}>
              {typeof gridIndex.imageId === 'number' ? <ImagesCard id={gridIndex.imageId} enableHeaderLinks={true} enableBottomActions={true} /> : ''}
            </Grid>;
          }
        )}
      </Grid>
    </>
  );
}
