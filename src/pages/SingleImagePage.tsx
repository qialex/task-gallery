import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getEditorItemsById, getImage, selectImagesApiStatusForMemo, selectPagination } from "../slices/imageSlice";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { Stack, Drawer, Grid, Card, CardContent, Avatar, Box, Typography, Link } from "@mui/material";
import { ImageItem, ImageStoreItem } from "../types";
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import EditorResize from "../components/editor/editorResize";
import NotFound from "./NotFound";
import PageLoading from "../components/loading";
import { RequestPhase } from "../constants";
import { Link as ReactRouterLink } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import ReplyIcon from '@mui/icons-material/Reply';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import EditorGreyscale from "../components/editor/editorGreyscale";
import EditorBlur from "../components/editor/editorBlur";
import { downloadURI } from "../utils";
import { ImagesCanvas } from "../components/image/ImageCanvas";
import FilterBAndWIcon from '@mui/icons-material/FilterBAndW';
import FilterTiltShiftIcon from '@mui/icons-material/FilterTiltShift';
import EditorHistory from "../components/editor/editorHistory";
import { ImagesCard } from "../components/image/ImageCard";

export default function SingleImagePage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  // api status
  const selectImagesApiStatusMemo = useMemo(() => selectImagesApiStatusForMemo(), [])
  const status = useAppSelector(selectImagesApiStatusMemo);
  // pagination
  const selectPaginationMemo = useMemo(() => selectPagination(), [])
  const pagination = useAppSelector(selectPaginationMemo)
  // editor item
  const getEditorItemsByIdMemo = useMemo(() => getEditorItemsById(parseInt(id || '')), [id])
  const editorItem = useAppSelector(getEditorItemsByIdMemo)

  const image = editorItem?.image as ImageItem
  const [isResizeForm, setIsResizeForm] = useState<boolean>(false)
  const [isGreyscalseForm, setIsGreyscalseForm] = useState<boolean>(false)
  const [isBlurForm, setIsBlurForm] = useState<boolean>(false)
  const [isHistoryForm, setIsHistoryForm] = useState<boolean>(false)

  useEffect(() => {
    if (id) {
      dispatch(getImage(parseInt(id)));
    }
  }, [id, dispatch]);

  const getBackUrl = (): string => {
    const urlHost = new URL (window.location.origin)    
    const searchParams = new URLSearchParams()
    searchParams.set('page', pagination.page.toString())
    searchParams.set('limit', pagination.limit.toString())
    urlHost.search = searchParams.toString()
    return urlHost.href
  }

  const backUrl = getBackUrl()

  const handleDrawerClose = () => {
    setIsGreyscalseForm(false)
    setIsResizeForm(false)
    setIsBlurForm(false)
    setIsHistoryForm(false)
  }

  const imgUrl = editorItem?.url || image?.url || ''

  return (
    <>
      {/* Resize form */}
      <Drawer 
        open={(isResizeForm || isGreyscalseForm || isBlurForm || isHistoryForm)} 
        onClose={handleDrawerClose}
      >
        <Stack sx={{width: {xs: '250px', md: '300px'}}}>
          {image && isResizeForm ? 
            <EditorResize id={image.id} onClose={() => setIsResizeForm(false) } />
          : ''}
          {image && isGreyscalseForm ? 
            <EditorGreyscale id={image.id} onClose={() => setIsGreyscalseForm(false) } />
          : ''}
          {image && isBlurForm ? 
            <EditorBlur id={image.id} onClose={() => setIsBlurForm(false) } />
          : ''}
          {image && isHistoryForm ? 
            <EditorHistory id={image.id} onClose={() => setIsHistoryForm(false) } />
          : ''}
        </Stack>
      </Drawer>              
      {/* <EditorCrop /> */}

      <Grid container>
        <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>

          
          <Stack sx={{mt: 2}}>
            {editorItem ? 
              <ImagesCard
                size={editorItem?.size}
                item={{...editorItem, index: 0} as ImageStoreItem}
                hideImage={true}
              />
            : ''}
          </Stack>


          <Stack sx={{mt: 2}}>
            <Card>
              <CardContent>
                <Grid component='div' container spacing={2}>
                  <Grid item xs={12}>
                    <Stack direction={'row'} alignItems={'center'} spacing={2} sx={{cursor: 'pointer'}}>
                      <Link component={ReactRouterLink} to={image?.url || ''}>
                        <Avatar variant="square">
                          <img
                            src='../unsplash_logo.png'
                            width={32}
                            height={32}
                            alt='Ansplash logo' 
                          />
                        </Avatar>
                      </Link>
                      <Box sx={{overflow: 'hidden'}}>
                        <Link component={ReactRouterLink} to={image?.url || ''} sx={{overflow: 'hidden'}}>
                          <Typography sx={{ overflow: 'hidden', display: 'block', textWrap: 'nowrap', textOverflow: 'ellipsis' }}>See on unsplash.com</Typography>
                        </Link>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack direction={'row'} alignItems={'center'} spacing={2} sx={{cursor: 'pointer'}}>
                      <Link component={ReactRouterLink} to={backUrl}>
                        <Avatar>
                          <ReplyIcon />
                        </Avatar>
                      </Link>
                      <Box sx={{overflow: 'hidden'}}>
                        <Link component={ReactRouterLink} to={backUrl} sx={{overflow: 'hidden'}}>
                          <Typography sx={{ overflow: 'hidden', display: 'block', textWrap: 'nowrap', textOverflow: 'ellipsis' }}>Back to gallery</Typography>
                        </Link>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack direction={'row'} alignItems={'center'} spacing={2} sx={{cursor: 'pointer'}}>
                      <Avatar onClick={() => downloadURI(imgUrl, image.id.toString())}>
                        <DownloadIcon />
                      </Avatar>
                      <Box onClick={() => downloadURI(imgUrl, image.id.toString())} sx={{overflow: 'hidden'}}>
                        <Typography sx={{ overflow: 'hidden', display: 'block', textWrap: 'nowrap', textOverflow: 'ellipsis' }}>Download</Typography>
                      </Box>
                    </Stack>
                  </Grid>


                  {/* <Divider/> */}

                  <Grid item xs={12}>
                    <Stack direction={'row'} alignItems={'center'} spacing={2} sx={{cursor: 'pointer'}}>
                      <Avatar onClick={() => setIsHistoryForm(!isHistoryForm)}>
                        <FormatListNumberedIcon />
                      </Avatar>
                      <Box onClick={() => setIsHistoryForm(!isHistoryForm)} sx={{overflow: 'hidden'}}>
                        <Typography sx={{ overflow: 'hidden', display: 'block', textWrap: 'nowrap', textOverflow: 'ellipsis' }}>History</Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack direction={'row'} alignItems={'center'} spacing={2} sx={{cursor: 'pointer'}}>
                      <Avatar onClick={() => setIsResizeForm(!isResizeForm)}>
                        <AspectRatioIcon />
                      </Avatar>
                      <Box onClick={() => setIsResizeForm(!isResizeForm)} sx={{overflow: 'hidden'}}>
                        <Typography sx={{ overflow: 'hidden', display: 'block', textWrap: 'nowrap', textOverflow: 'ellipsis' }}>Resize</Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack direction={'row'} alignItems={'center'} spacing={2} sx={{cursor: 'pointer'}}>
                      <Avatar onClick={() => setIsGreyscalseForm(!isGreyscalseForm)}>
                        <FilterBAndWIcon />
                      </Avatar>
                      <Box onClick={() => setIsGreyscalseForm(!isGreyscalseForm)} sx={{overflow: 'hidden'}}>
                        <Typography sx={{ overflow: 'hidden', display: 'block', textWrap: 'nowrap', textOverflow: 'ellipsis' }}>Greyscale</Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack direction={'row'} alignItems={'center'} spacing={2} sx={{cursor: 'pointer'}}>
                      <Avatar onClick={() => setIsBlurForm(!isBlurForm)}>
                        <FilterTiltShiftIcon />
                      </Avatar>
                      <Box onClick={() => setIsBlurForm(!isBlurForm)} sx={{overflow: 'hidden'}}>
                        <Typography sx={{ overflow: 'hidden', display: 'block', textWrap: 'nowrap', textOverflow: 'ellipsis' }}>Blur</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
        <Grid item xs={10} sm={10} md={10} lg={10} xl={10}>
        {image ? <>

          {/* <Stack direction={'row'}> */}
            <Stack justifyContent={'center'} alignItems={'center'} sx={{padding: {xs: 1, md: 3, lg: 6}, paddingTop: {xs: 1, md: 4, lg: 9, xl: 12}}}>
              <Stack sx={{maxWidth: {xs: '100%', md: '70vw', lg: '40vw'}, maxHeight: {xs: '100%', md: '70vh', lg: '40vh'}}}>
                <ImagesCanvas 
                  id={image.id}
                  showEdited={true}
                />                  
              </Stack>
            </Stack>
          {/* </Stack> */}
        </> : status === RequestPhase.failed ? <>
          <NotFound />
        </> : ''}
        </Grid>
      </Grid>
      {/* Page loading */}
      <PageLoading />
    </>
  );
}