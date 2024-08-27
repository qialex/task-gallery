import { MenuItem, Select, SelectChangeEvent, Stack } from "@mui/material";
import { PAGINATION_LIMIT_ITEMS } from "../../constants";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store";
import { setPagination } from "../../slices/imageSlice";

export default function LimitSelect () {
  const dispatch = useAppDispatch();
  const pagination = useAppSelector((state: RootState) => state.images.pagination);

  const handleChange = (e: SelectChangeEvent<number>) => {
    dispatch(setPagination({limit: parseInt(e.target.value as string)}));
  }

  const items = [...PAGINATION_LIMIT_ITEMS]
  if (!items.includes(pagination.limit)) {
    items.push(pagination.limit)
    items.sort((a, b) => a > b ? 1 : -1)
  }

  return (
    <Stack>
      <Select
        size="small"
        sx={{width: '74px'}}
        value={pagination.limit}
        onChange={handleChange}
      >
        {items.map((n: number) => 
          <MenuItem value={n} key={n}>{n}</MenuItem>
        )}
      </Select>
    </Stack>
  );
}
