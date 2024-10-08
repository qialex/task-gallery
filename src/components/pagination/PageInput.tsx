import { TextField } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { selectPagination, setPagination } from "../../slices/imagesGridSlice";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { parseNumValue } from "../../utils";
import { PAGINATION_PAGE_MIN, PaginationChangeType } from "../../constants";

export default function PageInput () {
  const dispatch = useAppDispatch();
  // pagination
  const selectPaginationMemo = useMemo(() => selectPagination(), [])
  const pagination = useAppSelector(selectPaginationMemo);
  
  const [value, setValue] = useState<string>(pagination.page.toString());

  // set value if page changed
  useEffect(() => {
    setValue(pagination.page.toString())
  }, [pagination.page])

  const dispatchChange = (): void => { 
    // if we have new value displatch, 
    // otherwise set current page as value and not dispatch
    if (value) {
      dispatch(setPagination({pageChangeType: PaginationChangeType.changePage, page: parseInt(value)}));
    } else {
      setValue(pagination.page.toString())
    }
  }

  // handle user change
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.value) {
      setValue('')
      return
    }
    const v = parseNumValue(e.target.value)
    if (v && v >= PAGINATION_PAGE_MIN) {
      setValue(v.toString())
    }
  }

  // handle enter press
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      dispatchChange();
    }
  }

  // handle blur as submit
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    dispatchChange();
  }

  return (
    <TextField 
      size="small"
      sx={{width: {xs: '64px', sm: '72px', textAlign: 'center'}}}
      value={value}
      onChange={handleChange}
      onKeyUp={handleKeyUp}
      onBlur={handleBlur}
      // label="Page" 
      variant="outlined"
    />
  );
}
