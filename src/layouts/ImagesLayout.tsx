import { useEffect, useMemo, useRef } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { parseNumValue } from "../utils";
import NavPagination from "../components/nav/NavPagination";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { Stack } from "@mui/material";
import { selectPagination, setPagination } from "../slices/imageSlice";
import { Pagination } from "../types";

const ImagesLayout = () => {
  const dispatch = useAppDispatch();
  // pagination
  const selectPaginationMemo = useMemo(() => selectPagination(), [])
  const pagination = useAppSelector(selectPaginationMemo);

  const [searchParams, setSearchParams] = useSearchParams();
  const prevRef = useRef<{state: Pagination, url: Pagination}>();

  useEffect(() => {
    const searchPage  = parseNumValue(searchParams.get('page'));
    const searchLimit = parseNumValue(searchParams.get('limit'));

    // set url from state
    if (
      pagination && 
      pagination.limit && 
      pagination.page && 
      prevRef?.current?.state?.page && 
      (
        pagination.page !== prevRef.current.state.page || 
        pagination.limit !== prevRef.current.state.limit 
      )
    ) {
      setSearchParams({page: pagination.page.toString(), limit: pagination.limit.toString()})
    } 
    // set state
    if (
      searchPage && 
      searchLimit && 
      prevRef?.current?.url?.page && 
      (
        searchPage !== prevRef.current.url.page || 
        searchLimit !== prevRef.current.url.limit 
      )
    ) {
      dispatch(setPagination({page: searchPage, limit: searchLimit}))
    }
    // set url state iinitial
    if (!searchPage || !searchLimit) {
      setSearchParams({page: pagination.page.toString(), limit: pagination.limit.toString()})
    }

    prevRef.current = {state: {...pagination}, url: {page: searchPage || 0, limit: searchLimit || 0}}
  });

  return (
    <Stack sx={{minHeight: '90vh', pt: 2, pb: 10}}>
      <Outlet />
      <NavPagination />
    </Stack>
  );
};

export default ImagesLayout;
