import PageHeader from "../components/headers/PageHeader";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getImage } from "../slices/imageSlice";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { Stack, Typography, Drawer, Divider, List, ListItemButton, ListItemIcon, ListItemText, Grid } from "@mui/material";
import { BlurProps, GreyscaleProps, ImageItem, ResizeProps } from "../types";
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import EditorResize from "../components/editor/editorResize";
import NotFound from "./NotFound";
import PageLoading from "../components/loading";
import { EditorChangeType, RequestPhase } from "../constants";
import { Link as ReactRouterLink } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import ReplyIcon from '@mui/icons-material/Reply';
import PaletteIcon from '@mui/icons-material/Palette';
import BlurLinearIcon from '@mui/icons-material/BlurLinear';
// import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import EditorGreyscale from "../components/editor/editorGreyscale";
import EditorBlur from "../components/editor/editorBlur";
import { downloadURI } from "../utils";
import { ImagesCanvas } from "../components/image/ImageCanvas";


export default function SingleImagePage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { editorItem, status, pagination } = useAppSelector((state) => {
    const editorItem = state.images.editorItems.find(item => item?.image?.id === parseInt(id || ''))
    return {editorItem, status: state.images.status, pagination: state.images.pagination}
  });
  const blur = ((editorItem?.history || []).filter(h => h.type === EditorChangeType.blur).reverse()[0]?.props as BlurProps)?.blur || 0
  const greyscale = ((editorItem?.history || []).filter(h => h.type === EditorChangeType.greyscale).reverse()[0]?.props as GreyscaleProps)?.isGreyscale || false
  const resize: ResizeProps|undefined = ((editorItem?.history || []).filter(h => h.type === EditorChangeType.resize).reverse()[0]?.props as ResizeProps) || undefined

  const image = editorItem?.image as ImageItem
  const [isResizeForm, setIsResizeForm] = useState<boolean>(false)
  const [isGreyscalseForm, setIsGreyscalseForm] = useState<boolean>(false)
  const [isBlurForm, setIsBlurForm] = useState<boolean>(false)

  // const [imgUrl, setImgUrl] = useState<string>(image ? getURL(image.downloadUrl, blur, greyscale) : '')

  useEffect(() => {
    if (id) {
      dispatch(getImage(parseInt(id)));
    }
  }, [id, dispatch]);

  // useEffect(() => {
  //   if (image) {
  //     setImgUrl(getURL(image.downloadUrl, blur, greyscale))
  //   }
  // }, [blur, greyscale, image]);

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
  }

  const imgUrl = ''

  return (
    <>
      {/* Resize form */}
      <Drawer 
        open={(isResizeForm || isGreyscalseForm || isBlurForm)} 
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
        </Stack>
      </Drawer>              
      {/* <EditorCrop /> */}

      <Grid container>
        <Grid item xs={2} sm={2} md={2} lg={2} xl={1}>
          <List>
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

            <Divider />

            {/* <ListItemButton onClick={() => {}}>
              <ListItemIcon>
                <FormatListNumberedIcon />
              </ListItemIcon>
              <ListItemText primary="History" sx={{display: {xs: 'none', lg: 'block'}}} />
            </ListItemButton> */}

            <ListItemButton onClick={() => setIsResizeForm(!isResizeForm)}>
              <ListItemIcon>
                <AspectRatioIcon />
              </ListItemIcon>
              <ListItemText primary="Resize" sx={{display: {xs: 'none', lg: 'block'}}} />
            </ListItemButton>

            <ListItemButton onClick={() => setIsGreyscalseForm(!isGreyscalseForm)}>
              <ListItemIcon>
                <PaletteIcon />
              </ListItemIcon>
              <ListItemText primary="Greyscale" sx={{display: {xs: 'none', lg: 'block'}}} />
            </ListItemButton>

            <ListItemButton onClick={() => setIsBlurForm(!isBlurForm)}>
              <ListItemIcon>
                <BlurLinearIcon />
              </ListItemIcon>
              <ListItemText primary="Blur" sx={{display: {xs: 'none', lg: 'block'}}} />
            </ListItemButton>
          </List>
        </Grid>
        <Grid item xs={10} sm={10} md={10} lg={10} xl={11}>
        {image ? <>

          {/* <Stack direction={'row'}> */}
            <Stack justifyContent={'center'} alignItems={'center'} sx={{padding: 6}}>
              <Stack sx={{maxWidth: '40vw', maxHeight: '40vh'}}>
                {/* <img 
                  crossOrigin='anonymous'
                  src={imgUrl} 
                  alt={image.author} 
                  style={{maxWidth: '40vw', maxHeight: '40vh'}} 
                  onLoad={onloadImage}
                /> */}
                <ImagesCanvas 
                  id={image.id}
                  showEdited={true}
                />                  
              </Stack>
              <PageHeader title="Image" />
              <Typography variant="h5">ID: {image.id}</Typography>
              <Typography variant="h5">Author: {image.author}</Typography>
              <Typography variant="h5">Width: {image.width}</Typography>
              <Typography variant="h5">Height: {image.height}</Typography>
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