import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { defaultPagination, PAGINATION_LIMIT_MAX, PAGINATION_LIMIT_MIN, LOCAL_STORAGE_PAGINATION_LIMIT_KEY, PAGINATION_PAGE_MIN, PaginationChangeType, ImageApiStatus, LOCAL_STORAGE_PAGINATION_PAGE_KEY } from "../constants";
import { GridIndex, Image, Pagination } from "../types";
import { LocalStorageService } from "../services/localStorageService";
import { calculatePageChange, getStartEndIndex, parseNumValue } from "../utils";
import { RootState } from "../store";

export const imagesGridKey = "imagesGrid"

type GridState = {
  gridIndexes: GridIndex[]
  pagination: Pagination
};

const getInitPagination = (): Pagination => {
  const params = new URLSearchParams(window.location.hash.replace('#/', ''))

  const pageParams  = parseNumValue(params.get('page'))
  const limitParams = parseNumValue(params.get('limit'))

  const limitLocalStorage = parseInt(LocalStorageService.getItem(LOCAL_STORAGE_PAGINATION_LIMIT_KEY) || '')
  const pageLocalStorage  = parseInt(LocalStorageService.getItem(LOCAL_STORAGE_PAGINATION_PAGE_KEY)  || '')

  const limit = Math.max(Math.min(limitParams || limitLocalStorage || defaultPagination.limit, PAGINATION_LIMIT_MAX), PAGINATION_LIMIT_MIN)
  const page  = Math.max(pageParams || pageLocalStorage || defaultPagination.page, PAGINATION_PAGE_MIN)


  // saving limit
  if (limit !== limitLocalStorage) {
    LocalStorageService.setItem(LOCAL_STORAGE_PAGINATION_LIMIT_KEY, limit.toString())
  }
  if (page  !== pageLocalStorage ) {
    LocalStorageService.setItem(LOCAL_STORAGE_PAGINATION_PAGE_KEY,  page.toString())
  }

  return { limit, page }
}

export const initialState: GridState = {
  gridIndexes: [],
  pagination: getInitPagination(),
};

export type SetPaginationPayload = {
  pageChangeType: PaginationChangeType, 
  limit?: number, 
  page?: number 
}

export const setPagination = createAsyncThunk(
  `${imagesGridKey}/setPagination`,
  (payload: SetPaginationPayload, { getState }) => {
    const pagination = {...(getState() as RootState)[imagesGridKey].pagination}
    const nextPagination = paginationReduce(pagination, payload)

    // saving
    LocalStorageService.setItem(LOCAL_STORAGE_PAGINATION_LIMIT_KEY, nextPagination.limit.toString())
    LocalStorageService.setItem(LOCAL_STORAGE_PAGINATION_PAGE_KEY,  nextPagination.page.toString())
    
    return nextPagination
  },
  {
    condition: (payload: SetPaginationPayload, { getState }) => {

      const pagination = {...(getState() as RootState)[imagesGridKey].pagination}
      const nextPagination = paginationReduce(pagination, payload)

      if (nextPagination.limit === pagination.limit && nextPagination.page === pagination.page) {
        return false;
      }
    },
  },
);


const paginationReduce = (paginationCurrent: Pagination, payload: SetPaginationPayload): Pagination => {

  const pagination = {...paginationCurrent}
  
  if (payload.pageChangeType) {
    switch(payload.pageChangeType) {
      case PaginationChangeType.firstPage:
        pagination.page  = 1
        break;
      case PaginationChangeType.previousPage:
        pagination.page  = Math.max(pagination.page - 1, 1)
        break;
      case PaginationChangeType.nextPage:
        pagination.page  = pagination.page + 1
        break;
      case PaginationChangeType.changeAll:
        pagination.page  = payload?.page || 0
        pagination.limit = payload?.limit || 0
        break;
      case PaginationChangeType.changeLimit:
        pagination.limit = payload?.limit || 0
        break;
      case PaginationChangeType.changePage:
        pagination.page  = payload?.page || 0
        break;
      default:
        pagination.page  = defaultPagination.page
        pagination.limit = defaultPagination.limit
    }
  }

  pagination.limit  = Math.max(Math.min(pagination.limit, PAGINATION_LIMIT_MAX), PAGINATION_LIMIT_MIN)
  pagination.page   = Math.max(pagination.page, PAGINATION_PAGE_MIN)

  if (PaginationChangeType.changeLimit) {
    pagination.page = calculatePageChange(pagination.page, pagination.limit, pagination.limit)
  }

  return pagination
}

export const paginationAddUpdateAction = createAction<Image[]>(`${imagesGridKey}/paginationAddUpdateAction`)


export const imagesGrid = createSlice({
  name: imagesGridKey,
  initialState,
  reducers: {
    // reducer
    // prepare
  },
  extraReducers: (builder) => {
    builder
      .addCase(paginationAddUpdateAction, (state, action) => {
        const {start, end} = getStartEndIndex(state.pagination)
        for (let i = start; i < end; i++) {
          const cPayloadImage = action.payload[i-start]
          const apiStatus = cPayloadImage ? ImageApiStatus.loaded : ImageApiStatus.doensExist
          state.gridIndexes.push({index: i, apiStatus, imageId: cPayloadImage ? cPayloadImage.id : undefined})
        }
      })

      .addCase(setPagination.fulfilled, (state, action) => {
        state.pagination.limit = action.payload.limit
        state.pagination.page  = action.payload.page
      })
  },
});

export default imagesGrid.reducer;


// selector pagination
export const selectPagination = () => (state: RootState): Pagination => state[imagesGridKey].pagination
// is first page selector
export const isFirstPageSelector = () => (state: RootState) => state[imagesGridKey].pagination.page === 1
// select images grid
export const selectImagesGrid = () => (state: RootState) => {
  const { start, end } = getStartEndIndex(state[imagesGridKey].pagination)
  return state[imagesGridKey].gridIndexes.filter((gridIndex: GridIndex) => gridIndex.index >= start && gridIndex.index < end)
}