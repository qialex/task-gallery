import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { AxiosError } from "axios";
import { defaultPagination, PAGINATION_LIMIT_MAX, PAGINATION_LIMIT_MIN, LOCAL_STORAGE_ITEMS_PER_PAGE_KEY, PAGINATION_PAGE_MIN, PaginationChangeType, RequestPhase, ImageApiStatus } from "../constants";
import { EditorHistoryItem, ImageEditorStoreItem, ImageItem, ImageItemDTO, ImageStoreItem, Pagination } from "../types";
import { LocalStorageService } from "../services/localStorageService";
import { calculatePageChange, getStartEndIndex, parseNumValue } from "../utils";
import { RootState } from "../store";

type ImagesState = {
  items: ImageStoreItem[];
  editorItems: ImageEditorStoreItem[];
  pagination: Pagination;
  status: RequestPhase;
  error: string | null;
};

const transformer = (imageDTO: ImageItemDTO): ImageItem => {
  return {
    id: parseInt(imageDTO.id),
    url: imageDTO.url,
    width: imageDTO.width,
    height: imageDTO.height,
    author: imageDTO.author,
    downloadUrl: imageDTO.download_url,
  } as ImageItem
}

const getInitPagination = (): Pagination => {
  const params = new URLSearchParams(window.location.search)
  const pageParams = Math.max(parseNumValue(params.get('page')) || 0, PAGINATION_PAGE_MIN)
  const page = pageParams || defaultPagination.page

  const limitParams = parseNumValue(params.get('limit'))
  const limitLocalStorage = parseInt(LocalStorageService.getItem(LOCAL_STORAGE_ITEMS_PER_PAGE_KEY) || '')  

  const limit = Math.max(Math.min(limitParams || limitLocalStorage || defaultPagination.limit, PAGINATION_LIMIT_MAX), PAGINATION_LIMIT_MIN)
  // saving limit
  if (limit !== limitLocalStorage) {
    LocalStorageService.setItem(LOCAL_STORAGE_ITEMS_PER_PAGE_KEY, limit.toString())
  }

  return { limit, page }
}

export const initialState: ImagesState = {
  items: [],
  editorItems: [],
  pagination: getInitPagination(),
  status: RequestPhase.idle,
  error: null,
};

export const getImages = createAsyncThunk(
  "images/getAll",
  async (_, { rejectWithValue, getState }) => {
    const { pagination } = (getState() as RootState).images
    try {
      const response = await axiosInstance.get("/v2/list", {params: pagination});
      return response.data.map(transformer);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        return rejectWithValue(errorResponse);
      }
      throw error;
    }
  },
  {
    condition: (_, { getState }: { getState: any }) => {
      const { pagination, items, status } = (getState() as RootState).images
      const { start } = getStartEndIndex(pagination)

      const isApiNeeded = new Array(pagination.limit).fill(0)
        .map((_, i) => items.find(item => item.index === start+i))
        .filter((item: ImageStoreItem | undefined) => !item || (item.status as ImageApiStatus === ImageApiStatus.error))

      // Already fetched or in progress, don't need to re-fetch
      if (status === RequestPhase.loading || !isApiNeeded.length) {        
        return false
      } else {
        return true
      }
    },
  },
);

export const getImage = createAsyncThunk(
  "images/getOne",
  async (imageId: number, { rejectWithValue, getState }) => {
    const { items } = (getState() as RootState).images
    const item = items.find((item: ImageStoreItem) => item.image?.id === imageId)
    if (item?.image) {
      return item.image
    }
    try {
      const response = await axiosInstance.get(`/id/${imageId}/info`);
      return transformer(response.data);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;

        return rejectWithValue(errorResponse);
      }

      throw error;
    }
  },
  {
    condition: (imageId: number, { getState }) => {
      const { editorItems, status } = (getState() as RootState).images
      const editorItem = editorItems.find((item: ImageEditorStoreItem) => item.image?.id === imageId)
      // Already fetched or in progress, don't need to re-fetch
      if (status === RequestPhase.loading || editorItem) {
        return false
      } else {
        return true
      }
    },
  },
);

export const setPagination = createAsyncThunk(
  "images/setPagination",
  (payload: {pageChangeType?: PaginationChangeType, limit?: number, page?: number}, { getState }) => {
    const pagination = {...(getState() as RootState).images.pagination}
    // saving limit
    if (payload.limit) {
      LocalStorageService.setItem(LOCAL_STORAGE_ITEMS_PER_PAGE_KEY, payload.limit.toString())
    }

    if (payload.pageChangeType) {
      switch(payload.pageChangeType) {
        case PaginationChangeType.firstPage:
          pagination.page = 1
          break;
        case PaginationChangeType.previousPage:
          pagination.page = Math.max(pagination.page - 1, 1)
          break;
        case PaginationChangeType.nextPage:
          pagination.page = pagination.page + 1
          break;
        default:
          pagination.page = 1
      }
    }
    if (payload.limit) {
      pagination.page = calculatePageChange(pagination.page, pagination.limit, payload.limit)
      pagination.limit = payload.limit
    }
    if (payload.page) {
      pagination.page = payload.page
    }

    return pagination
  },
  {
    condition: (payload: {pageChangeType?: PaginationChangeType, limit?: number, page?: number}, { getState }) => {
      const { pagination } = (getState() as RootState).images
      if (payload.pageChangeType) {
        return true
      } else if (payload.limit && payload.page && (pagination.limit !== payload.limit || pagination.page !== payload.page)) {
        return true
      } else if ((payload.limit && pagination.limit === payload.limit) || (payload.page && pagination.page === payload.page)) {
        return false
      } else {
        return true
      }
    },
  },
);

export const setEditorChange = createAsyncThunk(
  "images/setEditorHistory",
  (payload: {historyItem: EditorHistoryItem, editorItem: ImageEditorStoreItem}, { getState }) => {
    // const pagination = {...(getState() as RootState).images.pagination}
    return payload
  },
);

export const imageSlice = createSlice({
  name: "images",
  initialState,
  reducers: {
    // reducer
    // prepare
  },
  extraReducers: (builder) => {
    builder
      .addCase(getImages.pending, (state) => {
        state.status = RequestPhase.loading;
        state.error = null;
      })
      .addCase(
        getImages.fulfilled,
        (state, action: PayloadAction<ImageItem[]>) => {
          state.status = RequestPhase.idle;
          const {start, end} = getStartEndIndex(state.pagination)
          for (let i = start; i < end; i++) {
            const cPayloadImage = action.payload[i-start]
            const status = cPayloadImage ? ImageApiStatus.loaded : ImageApiStatus.doensExist
            state.items.push({index: i, status, image: cPayloadImage})
          }
        }
      )
      .addCase(getImages.rejected, (state, action) => {
        console.log('addCase -> getImages.failed')
        state.status = RequestPhase.failed;
        const {start, end} = getStartEndIndex(state.pagination)
        for (let i = start; i < end; i++) {
          if (!state.items.find(item => item.index === i)) {
            state.items.push({index: i, status: ImageApiStatus.error, image: undefined})
          }
        }
        state.error = action.error.message || "Failed to fetch images.";
      })

      .addCase(getImage.pending, (state) => {
        state.status = RequestPhase.loading;
        state.error = null;
      })
      .addCase(
        getImage.fulfilled,
        (state, action: PayloadAction<ImageItem>) => {
          const item = state.items.find((item: ImageStoreItem) => item.image?.id === action.payload.id)
          const editorItem = state.editorItems.find((item: ImageEditorStoreItem) => item.image?.id === action.payload.id)
          if (!action.payload && !item && !editorItem) {
            state.editorItems.push({status: ImageApiStatus.error, image: undefined, history: []})
          }
          if (!action.payload && item && !editorItem) {
            state.editorItems.push({status: item.status, image: item.image, history: []})
          }
          if (editorItem && editorItem.status !== ImageApiStatus.loaded && action.payload) {
            const editorItemIndex = state.editorItems.findIndex((item: ImageEditorStoreItem) => item.image?.id === action.payload.id)
            state.editorItems[editorItemIndex] = {...state.editorItems[editorItemIndex], status: ImageApiStatus.loaded}
          }
          if (action.payload && !editorItem) {
            state.editorItems.push({status: ImageApiStatus.loaded, image: action.payload, history: []})
          }
          state.status = RequestPhase.idle;
        }
      )
      .addCase(getImage.rejected, (state, action) => {
        state.status = RequestPhase.failed;
        const item = state.items.find((item: ImageStoreItem) => item.image?.id === action.payload)
        const editorItem = state.editorItems.find((item: ImageEditorStoreItem) => item.image?.id === action.payload)
        if (!item && !editorItem) {
          state.editorItems.push({status: ImageApiStatus.error, image: undefined, history: []})
        }
        if (item && !editorItem) {
          state.editorItems.push({status: item.status, image: item.image, history: []})
        }
        
        state.error = action.error.message || "Failed to fetch images.";
      })

      .addCase(setPagination.fulfilled, (state, action) => {
        state.pagination = action.payload
      })

      .addCase(setEditorChange.fulfilled, (state, action) => {
        const item = state.editorItems.find(item => typeof item?.image?.id === 'number' && item?.image?.id === action.payload.editorItem?.image?.id)
        if (item) {
          item.history = [...item.history, action.payload.historyItem]
        }
      })
  },
});

export default imageSlice.reducer;
