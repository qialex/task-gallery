import { Avatar, Button, Card, CardActions, CardHeader, IconButton, Typography, Link, Stack  } from "@mui/material";
import { Link as ReactRouterLink } from 'react-router-dom';
import { red } from "@mui/material/colors";
import DownloadIcon from '@mui/icons-material/Download';
import { Image, Size } from "../../types";
import { downloadURI } from "../../utils";
import { ImagesCanvas } from "./ImageCanvas";
import { useMemo } from "react";
import { getItemById } from "../../slices/imageSlice";
import { useAppSelector } from "../../hooks/reduxHooks";
import UnsplashLogo from "../UnsplashIcon";

export function ImagesCard (props: {
  id: number, 
  size?: Size, 
  hideImage?: boolean, 
  enableHeaderLinks?: boolean,
  enableBottomActions?: boolean,
  elevation?: number,
}) {
  const { id, hideImage, enableHeaderLinks, enableBottomActions, size, elevation } = props;
  // image
  const getItemByIdMemo = useMemo(() => getItemById(id), [id])
  const image: Image|undefined = useAppSelector(getItemByIdMemo)

  // download image
  const handleDownloadClick = () => {
    downloadURI(image?.downloadUrl || '', (image?.id || '').toString())
  }

  return (
    <Card elevation={typeof elevation === 'number' ? elevation : 1} >
      {image ? <>
        <CardHeader
          sx={{
            '& .MuiCardHeader-content': {
              display: 'block',
              overflow: 'hidden',
            },
            padding: {xs: 1, md: 2}
          }}
          avatar={
            <Link component={enableHeaderLinks ? ReactRouterLink : 'div'} to={`image/${image.id}`} underline="none">
              <Avatar sx={{ bgcolor: red[500], fontSize: '1.225rem' }} aria-label="recipe">
                {image.author.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </Avatar>
            </Link>
          }
          title={
            <Stack sx={{ overflow: 'hidden' }}>
              <Link
                component={enableHeaderLinks ? ReactRouterLink : 'div'}
                to={`image/${image.id}`}
                underline={enableHeaderLinks ? 'hover' : 'none' }
                sx={{ fontWeight: 'bold', overflow: 'hidden', display: 'block', textWrap: 'nowrap', textOverflow: 'ellipsis' }}
              >
                {image.author}
              </Link>
            </Stack>
          }
          subheader={<Link
            component={enableHeaderLinks ? ReactRouterLink : 'div'}
            to={`image/${image.id}`}
            underline={enableHeaderLinks ? 'hover' : 'none' }
            color={'inherit'}
            sx={{ overflow: 'hidden', display: 'block', textWrap: 'nowrap', textOverflow: 'ellipsis' }}
          >
            ID: {image.id}. Resolution: {size ? size.width : image.size.width}x{size ? size.height : image.size.height}
          </Link>} 
        />

        {/* Image */}
        {!hideImage ? 
          <Link 
            component={ReactRouterLink} 
            to={`image/${image.id}`} 
            underline="none" 
            sx={{lineHeight: 0}}
          >
            <ImagesCanvas 
              id={image.id}
              width='100%'
              height='194px' 
            />
          </Link>
        : ''}

        {/* Card actions */}
        {enableBottomActions ?
          <CardActions sx={{justifyContent: 'space-between'}}>
            <Button
              color={'inherit'}
              component={Link}
              startIcon={<UnsplashLogo width={16} height={16} />}
              size="small"
              href={image.url}
              sx={{ overflow: 'hidden', display: 'flex', justifyContent: 'start', }}
            >
              <Typography 
                component='div' 
                color='inherit' 
                variant="body1" 
                sx={{ fontSize: '0.8rem', overflow: 'hidden', display: 'block', textWrap: 'nowrap', textOverflow: 'ellipsis', justifyContent: 'start' }}
              >
                See original on Unsplash.com
              </Typography>
            </Button>
            <IconButton 
              aria-label="Download"
              onClick={handleDownloadClick}
            >
              <DownloadIcon />
            </IconButton>
          </CardActions>
        : ''}
      </> : <>
        <Stack
          sx={{height: '194px', width: '100%'}}
          alignItems={'center'}
          justifyContent={'center'}
        >
          Error
        </Stack>
      </>}

    </Card>
  )
}