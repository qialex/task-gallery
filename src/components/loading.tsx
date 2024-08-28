import { CircularProgress, Stack } from "@mui/material";
import { useAppSelector } from "../hooks/reduxHooks";
import { RequestPhase } from "../constants";
import { useMemo } from "react";
import { selectImagesApiStatusForMemo } from "../slices/imageSlice";

export default function PageLoading () {
  // status
  const selectImagesApiStatusMemo = useMemo(() => selectImagesApiStatusForMemo(), [])
  const status = useAppSelector(selectImagesApiStatusMemo);

  return (
    <>
      {/* Loading */}
      {status === RequestPhase.loading ? <>
        <Stack justifyContent={'center'} alignItems={'center'} sx={{p: 4, minHeight: '80vh'}}>
          <CircularProgress />
        </Stack>
      </> : ''}
    </>
  );
}
