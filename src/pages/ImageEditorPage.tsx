import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getImageUrlForCanvas, getItemById } from "../slices/imageSlice";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { Stack, Drawer, Grid, Card, CardContent, Avatar, Box, Typography, Link, Divider } from "@mui/material";
import { Image } from "../types";
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import EditorResize from "../components/editor/editorResize";
import NotFound from "./NotFound";
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
import { blue, deepOrange, deepPurple, green, grey } from "@mui/material/colors";
import { selectPagination } from "../slices/imagesGridSlice";
import { getImage } from "../slices/api/ApiSlice";
import { getImageEditorById } from "../slices/imageEditorSlice";
import UnsplashLogo from "../components/UnsplashIcon";

export default function ImageEditorPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  // pagination
  const selectPaginationMemo = useMemo(() => selectPagination(), []);
  const pagination = useAppSelector(selectPaginationMemo);
  // image
  const getItemByIdMemo = useMemo(() => getItemById(parseInt(id || '')), [id])
  const image: Image|undefined = useAppSelector(getItemByIdMemo)

  // editor item
  const getImageEditorByIdMemo = useMemo(() => getImageEditorById(parseInt(id || '')), [id])
  const editorImage = useAppSelector(getImageEditorByIdMemo)

  // img url
  const getImageUrlForCanvasMemo = useMemo(() => getImageUrlForCanvas(parseInt(id || ''), true), [id])
  const imgUrl = useAppSelector(getImageUrlForCanvasMemo)

  // const image = editorItem?.image as Image
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

  const editorEtems = [
    {
      avatarColor: blue[500],
      isLink: true,
      url: backUrl,
      title: 'Back to gallery',
      onClick: () => {},
      isDivider: false,
      icon: <><ReplyIcon /></>
    },
    {
      avatarColor: deepPurple[500],
      isLink: false,
      url: '',
      title: 'Download',
      onClick: () => downloadURI(imgUrl, (image?.id || '').toString()),
      isDivider: false,
      icon: <><DownloadIcon /></>
    },
    {
      isDivider: true,
    },
    {
      avatarColor: green[500],
      isLink: false,
      url: '',
      title: 'History',
      onClick: () => setIsHistoryForm(!isHistoryForm),
      isDivider: false,
      icon: <><FormatListNumberedIcon /></>
    },    
    {
      avatarColor: deepOrange[500],
      isLink: false,
      url: '',
      title: 'Resize',
      onClick: () => setIsResizeForm(!isResizeForm),
      isDivider: false,
      icon: <><AspectRatioIcon /></>
    },  
    {
      avatarColor: deepOrange[500],
      isLink: false,
      url: '',
      title: 'Greyscale',
      onClick: () => setIsGreyscalseForm(!isGreyscalseForm),
      isDivider: false,
      icon: <><FilterBAndWIcon /></>
    },      
    {
      avatarColor: deepOrange[500],
      isLink: false,
      url: '',
      title: 'Blur',
      onClick: () => setIsBlurForm(!isBlurForm),
      isDivider: false,
      icon: <><FilterTiltShiftIcon /></>
    }, 
    {
      isDivider: true,
    },
    {
      avatarColor: grey[500],
      isLink: true,
      url: image?.url || '',
      title: 'See on unsplash.com',
      onClick: () => {},
      isDivider: false,
      icon: <UnsplashLogo width={32} height={32} />
    },
  ]

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
        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} sx={{minWidth: '3.5rem'}}>
          <Stack sx={{mt: 2}}>
            {image ? 
              <ImagesCard
                size={editorImage?.size}
                id={image.id}
                hideImage={true}
              />
            : ''}
          </Stack>

          <Stack sx={{mt: 2}}>
            <Card>
              <CardContent sx={{padding: {xs: 1, md: 2}}}>
                <Grid component='div' container spacing={2}>
                  {editorEtems.map((item, key) => 
                    <Grid item xs={12} key={key.toString()}>
                      {item.isDivider ? 
                        <Divider /> 
                        :
                        <Stack 
                          direction={'row'} 
                          alignItems={'center'} 
                          spacing={2} 
                          sx={{cursor: 'pointer'}}
                          onClick={() => !item.isLink && item?.onClick && item?.onClick()}
                        >
                          <Link 
                            component={item.isLink ? ReactRouterLink : 'div'} 
                            to={item.url} 
                            // onClick={() => !item.isLink && item?.onClick && item?.onClick()}
                          >
                            <Avatar sx={{ bgcolor: item.avatarColor }}>
                              {item.icon}
                            </Avatar>
                          </Link>
                          <Box sx={{overflow: 'hidden'}}>
                            <Link 
                              underline={item.isLink ? 'always' : 'hover'}
                              component={item.isLink ? ReactRouterLink : 'div'} 
                              to={item.url} 
                              sx={{overflow: 'hidden'}} 
                            >
                              <Typography 
                                sx={{ overflow: 'hidden', display: 'block', textWrap: 'nowrap', textOverflow: 'ellipsis' }}
                              >
                                {item.title}
                              </Typography>
                            </Link>
                          </Box>
                        </Stack>
                      }
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
        <Grid item xs={10} sm={10} md={10} lg={10} xl={10} sx={{maxWidth: 'min(calc(100% - 3.5rem), 83.3333%);'}}>
          {imgUrl && image?.id ? <>
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
          </> : <>
            <NotFound />
          </>}
        </Grid>
      </Grid>
    </>
  );
}