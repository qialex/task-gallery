import { useEffect, useRef, useState } from "react";
import { Stack  } from "@mui/material";
import { CircularProgress } from '@mui/material';
import { BlurProps, GreyscaleProps, ImageItem, ResizeProps } from "../../types";
import { downloadURI } from "../../utils";
import { useOnScreen } from "../../hooks/onSecreen";
import { useAppSelector } from "../../hooks/reduxHooks";
import { EditorChangeType } from "../../constants";


export function ImagesCanvas (props: {id: number, showEdited?: boolean, width?: string|number, height?: string|number}) {
  const { id, showEdited, width, height } = props;
  const [isVisibleAlready, setIsVisibleAlready] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  const { editorItem, item } = useAppSelector((state) => {
    const editorItem = state.images.editorItems.find(item => item?.image?.id === id)
    const item = state.images.items.find(item => item?.image?.id === id)
    return {editorItem, item}
  });
  const blur = ((editorItem?.history || []).filter(h => h.type === EditorChangeType.blur).reverse()[0]?.props as BlurProps)?.blur || 0
  const greyscale = ((editorItem?.history || []).filter(h => h.type === EditorChangeType.greyscale).reverse()[0]?.props as GreyscaleProps)?.isGreyscale || false
  const resize: ResizeProps|undefined = ((editorItem?.history || []).filter(h => h.type === EditorChangeType.resize).reverse()[0]?.props as ResizeProps) || undefined
  const image = (editorItem?.image || item?.image) as ImageItem

  const [imgUrl, setImgUrl] = useState<string>(image ? getURL(image.downloadUrl, blur, greyscale) : '')

  // console.log(editorItem, image)

  // const { item } = props;
  // const image = item.image as ImageItem

  const ref = useRef<HTMLDivElement>(null)
  const refImage = useRef<HTMLImageElement>(null)
  const refCanvas = useRef<HTMLCanvasElement>(null)
  const isVisibleNow = useOnScreen(ref)

  useEffect(() => {
    if (isVisibleNow && !isVisibleAlready) {
      setIsVisibleAlready(true)
    }
  }, [isVisibleNow, isVisibleAlready])

  useEffect(() => {
    if (image) {
      setImgUrl(getURL(image.downloadUrl, blur, greyscale))
    }
  }, [blur, greyscale, image]);


  useEffect(() => {
    applyResize()
  });
  
  const onloadImage = () => {
    setIsLoaded(true)
    applyResize()
  }

  const applyResize = () => {
    if (!refCanvas?.current) {
      return
    }
    const canvas = refCanvas.current;
    const ctx = canvas.getContext("2d");

    const img = refImage.current;
    console.log(img)
    if (!img || !image) {
      return
    }

    if (resize && showEdited) {
      canvas.width  = resize.isPercentage ? Math.round(img.width  * parseInt(resize.w) / 100) : parseInt(resize.w);
      canvas.height = resize.isPercentage ? Math.round(img.height * parseInt(resize.h) / 100) : parseInt(resize.h);
    } else {
      canvas.width  = image.width
      canvas.height = image.height
    }

    console.log(ctx)
    if (!ctx) {
      return
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }


  // download image
  // const handleDownloadClick = () => {
  //   downloadURI(image.downloadUrl, image.id.toString())
  // }
  // console.log(image.downloadUrl)
  return (
    <Stack ref={ref}>
      <canvas 
        ref={refCanvas} 
        style={{lineHeight: 0, display: (isVisibleNow && isLoaded && image) ? 'block' : 'none', width: width, height: height}} />
      <img
        ref={refImage}
        crossOrigin='anonymous'
        style={{lineHeight: 0, display: 'none'}}
        width={width}
        height={height}
        src={isVisibleAlready ? imgUrl : ''}
        onLoad={onloadImage}
        alt={image?.author || ''} 
      />
      <Stack
        sx={{display: (isVisibleNow && isLoaded && image) ? 'none' : 'flex', height: width, width: height}}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <CircularProgress />
      </Stack>
    </Stack>
  )
}

const getURL = (url: string, blur: number, grayscale: boolean): string => {
  let result = new URL(url);
  if (grayscale) {
    result.searchParams.append('grayscale', '')
  }
  if (blur) {
    result.searchParams.append('blur', blur.toString())
  }
  return result.href;
}