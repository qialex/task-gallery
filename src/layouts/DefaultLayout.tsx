import { Outlet } from "react-router-dom";
import { CircularProgress, Stack } from "@mui/material";
import { useMemo } from "react";
import { selectApiStatusLoading } from "../slices/api/ApiSlice";
import { useAppSelector } from "../hooks/reduxHooks";

const DefaultLayout = () => {

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
      </> : 
        <Outlet />
      }
    </>
  );
};

export default DefaultLayout;