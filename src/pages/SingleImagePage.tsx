import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getImage } from "../slices/imageSlice";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { Stack, Drawer, Divider, List, ListItemButton, ListItemIcon, ListItemText, Grid } from "@mui/material";
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
  const { editorItem, status, pagination } = useAppSelector((state) => {
    const editorItem = state.images.editorItems.find(item => item?.image?.id === parseInt(id || ''))
    return {editorItem, status: state.images.status, pagination: state.images.pagination}
  });

  const image = editorItem?.image as ImageItem
  const [isResizeForm, setIsResizeForm] = useState<boolean>(false)
  const [isGreyscalseForm, setIsGreyscalseForm] = useState<boolean>(false)
  const [isBlurForm, setIsBlurForm] = useState<boolean>(false)
  const [isHistoryForm, setIsHistoryForm] = useState<boolean>(false)

  // const [imgUrl, setImgUrl] = useState<string>(image ? getURL(image.downloadUrl, blur, greyscale) : '')

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
                item={{...editorItem, index: 0} as ImageStoreItem}
                hideImage={true}
              />
            : ''}
          </Stack>

          <List>
            <ListItemButton component={ReactRouterLink} to={image?.url || ''}>
              <ListItemIcon>
                <img
                src='../unsplash_logo.png'
                width={16}
                height={16}
                alt='Ansplash logo' 
              />
              </ListItemIcon>
              <ListItemText primary="see on unsplash.com" sx={{display: {xs: 'none', lg: 'block'}}} />
            </ListItemButton>

            <ListItemButton component={ReactRouterLink} to={backUrl}>
              <ListItemIcon>
                <ReplyIcon />
              </ListItemIcon>
              <ListItemText primary="Back to gallery" sx={{display: {xs: 'none', lg: 'block'}}} />
            </ListItemButton>
            



            <ListItemButton onClick={() => downloadURI(imgUrl, image.id.toString())}>
              <ListItemIcon>
                <DownloadIcon />
              </ListItemIcon>
              <ListItemText primary="Download" sx={{display: {xs: 'none', lg: 'block'}}} />
            </ListItemButton>

            <Divider 
              // sx={{maxWidth: {xs: '100%', lg: '50%'}}}
            />

            <ListItemButton onClick={() => setIsHistoryForm(!isHistoryForm)}>
              <ListItemIcon>
                <FormatListNumberedIcon />
              </ListItemIcon>
              <ListItemText primary="History" sx={{display: {xs: 'none', lg: 'block'}}} />
            </ListItemButton>

            <ListItemButton onClick={() => setIsResizeForm(!isResizeForm)}>
              <ListItemIcon>
                <AspectRatioIcon />
              </ListItemIcon>
              <ListItemText primary="Resize" sx={{display: {xs: 'none', lg: 'block'}}} />
            </ListItemButton>

            <ListItemButton onClick={() => setIsGreyscalseForm(!isGreyscalseForm)}>
              <ListItemIcon>
                <FilterBAndWIcon />
              </ListItemIcon>
              <ListItemText primary="Greyscale" sx={{display: {xs: 'none', lg: 'block'}}} />
            </ListItemButton>

            <ListItemButton onClick={() => setIsBlurForm(!isBlurForm)}>
              <ListItemIcon>
                <FilterTiltShiftIcon />
              </ListItemIcon>
              <ListItemText primary="Blur" sx={{display: {xs: 'none', lg: 'block'}}} />
            </ListItemButton>


          </List>
        </Grid>
        <Grid item xs={10} sm={10} md={10} lg={10} xl={10}>
        {image ? <>

          {/* <Stack direction={'row'}> */}
            <Stack justifyContent={'center'} alignItems={'center'} sx={{padding: 6}}>
              <Stack sx={{maxWidth: '40vw', maxHeight: '40vh'}}>
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

      <PageLoading />
    </>
  );
}