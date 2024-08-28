import { useEffect, useMemo, useRef, useState } from "react";
import { Stack } from "@mui/material";
import { CircularProgress } from '@mui/material';
import { useOnScreen } from "../../hooks/onSecreen";
import { useAppSelector } from "../../hooks/reduxHooks";
import { getItemById, getImageUrlForCanvas } from "../../slices/imageSlice";

export function ImagesCanvas (props: {id: number, showEdited?: boolean, width?: string|number, height?: string|number}) {
  const { id, showEdited, width, height } = props;
  const getItemByIdMemo = useMemo(() => getItemById(id), [id])
  const item = useAppSelector(getItemByIdMemo)

  const getImageUrlForCanvasMemo = useMemo(() => getImageUrlForCanvas(id, !!showEdited), [id, showEdited])
  const imgUrl = useAppSelector(getImageUrlForCanvasMemo)

  const [isVisibleAlready, setIsVisibleAlready] = useState<boolean>(!!showEdited)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  const ref = useRef<HTMLDivElement>(null);
  const isVisibleNow = useOnScreen(ref);

  const isImageVisible = useMemo(() => (
    isVisibleNow && isLoaded
  ), [isVisibleNow, isLoaded]);

  useEffect(() => {
    if (isVisibleNow && !isVisibleAlready) {
      setIsVisibleAlready(true)
    }
  }, [isVisibleNow, isVisibleAlready])

  useEffect(() => {
    setIsLoaded(false)
  }, [imgUrl])

  const onloadImage = () => {
    setIsLoaded(true)
  }

  return (
    <Stack ref={ref}>
      <img
        width={width}
        height={height}
        src={isVisibleAlready ? imgUrl : ''}
        onLoad={onloadImage}
        alt={item?.image?.author || ''} 
        style={{lineHeight: 0, display: isImageVisible ? 'block' : 'none', width, height}}
      />
      <Stack
        sx={{display: isImageVisible ? 'none' : 'flex', height, width, }}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <CircularProgress />
      </Stack>
    </Stack>
  )
}