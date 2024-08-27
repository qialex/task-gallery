import { CircularProgress, Stack } from "@mui/material";
import { useAppSelector } from "../hooks/reduxHooks";
import { RootState } from "../store";
import { RequestPhase } from "../constants";

export default function PageLoading () {
  const { status } = useAppSelector((state: RootState) => state.images);

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
