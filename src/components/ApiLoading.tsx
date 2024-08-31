import { CircularProgress, Stack } from "@mui/material";
import { useAppSelector } from "../hooks/reduxHooks";
import { useMemo } from "react";
import { selectApiStatusLoading } from "../slices/api/ApiSlice";

export default function ApiLoading () {
  // status
  const selectApiStatusLoadingMemo = useMemo(() => selectApiStatusLoading(), [])
  const isLoading = useAppSelector(selectApiStatusLoadingMemo);

  return (
    <>
      {/* Loading */}
      {isLoading ? <>
        <Stack justifyContent={'center'} alignItems={'center'} sx={{p: 4, minHeight: '80vh'}}>
          <CircularProgress />
        </Stack>
      </> : ''}
    </>
  );
}
