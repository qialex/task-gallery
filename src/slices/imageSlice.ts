import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { AxiosError } from "axios";
import { defaultPagination, PAGINATION_LIMIT_MAX, PAGINATION_LIMIT_MIN, LOCAL_STORAGE_ITEMS_PER_PAGE_KEY, PAGINATION_PAGE_MIN, PaginationChangeType, RequestPhase, ImageApiStatus, EditorChangeType } from "../constants";
import { BlurProps, EditorAction, GreyscaleProps, ImageEditorStoreItem, ImageItem, ImageItemDTO, ImageStoreItem, Pagination, ResizeProps } from "../types";
import { LocalStorageService } from "../services/localStorageService";
import { calculatePageChange, getStartEndIndex, getURL, parseNumValue, resizeImage } from "../utils";
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

export const addEditorChange =  createAsyncThunk<{editorAction: EditorAction, editorItem: ImageEditorStoreItem }, any, { rejectValue: {id: number|undefined, error: string} }>(
  "images/addEditoAction",
  async (payload: {editorAction: EditorAction, editorItem: ImageEditorStoreItem}, { rejectWithValue }) => {
    const editorActions = payload.editorItem.editorActions.filter(a => a.active)

    const blur = payload.editorAction.type === EditorChangeType.blur ? 
    (payload.editorAction.props as BlurProps).blur :
    ((editorActions || []).filter(h => h.type === EditorChangeType.blur).reverse()[0]?.props as BlurProps)?.blur || 0

    const greyscale = payload.editorAction.type === EditorChangeType.greyscale ? 
      (payload.editorAction.props as GreyscaleProps).isGreyscale :
      ((editorActions || []).filter(h => h.type === EditorChangeType.greyscale).reverse()[0]?.props as GreyscaleProps)?.isGreyscale || false
    
    if ([EditorChangeType.blur, EditorChangeType.greyscale].includes(payload.editorAction.type)) {
      payload.editorAction.url = getURL(payload.editorItem?.image?.downloadUrl || '', blur, greyscale)
      const resizeActions: EditorAction[] = (editorActions || []).filter(h => h.type === EditorChangeType.resize) || []
      if (resizeActions.length) {
        try {
          let url = payload.editorAction.url
          for (let i=0; i < resizeActions.length; i++) {
            url = await resizeImage(url, resizeActions[i].props as ResizeProps)
          }
          payload.editorAction.url = url
        } catch (e) {
          return rejectWithValue({id: payload?.editorItem?.image?.id, error: 'Some error during resize restore from ground'});
        }
      }
    }

    if (EditorChangeType.resize === payload.editorAction.type) {
      try {
        payload.editorAction.url = await resizeImage(payload.editorItem?.url, payload.editorAction.props as ResizeProps)
      } catch (e) {
        return rejectWithValue({id: payload?.editorItem?.image?.id, error: 'Some error during resize'});
      }
    }

    return payload
  },
);

export const DeleteLastEditorHistoryItem =  createAsyncThunk(
  "images/DeleteLastEditorHistoryItem",
  (id: number) => {
    return id
  },
);

export const ShangeEditorHistoryActive = createAsyncThunk(
  "images/ShangeEditorHistoryActive",
  (payload: {id: number, index: number}) => {
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
            state.editorItems.push({status: ImageApiStatus.error, image: undefined, editorActions: [], url: '', size: {width: 0, height: 0}})
          }
          if (!action.payload && item && !editorItem) {
            state.editorItems.push({
              status: item.status,
              image: item.image, 
              editorActions: [], 
              url: item.image?.downloadUrl || '', 
              size: {width: item.image?.width || 0, height: item.image?.height || 0},
            })
          }
          if (editorItem && editorItem.status !== ImageApiStatus.loaded && action.payload) {
            const editorItemIndex = state.editorItems.findIndex((item: ImageEditorStoreItem) => item.image?.id === action.payload.id)
            state.editorItems[editorItemIndex] = {...state.editorItems[editorItemIndex], status: ImageApiStatus.loaded}
          }
          if (action.payload && !editorItem) {
            state.editorItems.push({
              status: ImageApiStatus.loaded, 
              image: action.payload, 
              editorActions: [], 
              url: action.payload?.downloadUrl || '',
              size: {width: action.payload?.width || 0, height: action.payload?.height || 0}
            })
          }
          state.status = RequestPhase.idle;
        }
      )
      .addCase(getImage.rejected, (state, action) => {
        state.status = RequestPhase.failed;
        const item = state.items.find((item: ImageStoreItem) => item.image?.id === action.payload)
        const editorItem = state.editorItems.find((item: ImageEditorStoreItem) => item.image?.id === action.payload)
        if (!item && !editorItem) {
          state.editorItems.push({
            status: ImageApiStatus.error,
            image: undefined,
            editorActions: [],
            url: '',
            size: {width: 0, height: 0},
          })
        }
        if (item && !editorItem) {
          state.editorItems.push({
            status: item.status,
            image: item.image,
            editorActions: [],
            url: item.image?.downloadUrl || '',
            size: {width: item.image?.width || 0, height: item.image?.height || 0}
          })
        }
        
        state.error = action.error.message || "Failed to fetch images.";
      })

      .addCase(setPagination.fulfilled, (state, action) => {
        state.pagination = action.payload
      })

      .addCase(addEditorChange.fulfilled, (state, action) => {
        const item = state.editorItems.find(item => typeof item?.image?.id === 'number' && item?.image?.id === action.payload.editorItem?.image?.id)
        if (item) {
          item.editorActions = [...item.editorActions.filter(a => a.active), action.payload.editorAction]
          item.url =  action.payload.editorAction.url
          if (item.image && ( action.payload.editorAction.props as ResizeProps ).wAbs) {
            item.size.width = ( action.payload.editorAction.props as ResizeProps ).wAbs
            item.size.height = ( action.payload.editorAction.props as ResizeProps ).hAbs
          }
        }
      })
      .addCase(addEditorChange.rejected, (state, action) => {
        const item = state.editorItems.find(item => typeof item?.image?.id === 'number' && item?.image?.id === action.payload?.id)
        if (item) {
          item.editorActions = item.editorActions.filter(a => !!a.url)
          if (item.image) {
            const {w, h} = getCurrentImageSize(state as RootState['images'], action.payload?.id || 0)
            item.size.width = w
            item.size.height = h
          }
        }        
        state.error = action.error.message || "Failed to fetch images.";
      })

      // Remove last history item
      .addCase(DeleteLastEditorHistoryItem.fulfilled, (state, action) => {
        const item = state.editorItems.find(item => typeof item?.image?.id === 'number' && item?.image?.id === action.payload)
        if (item) {
          item.editorActions.length = item.editorActions.length - 1
          item.url = item.editorActions[item.editorActions.length - 1]?.url || item.image?.downloadUrl || ''

          if (item.image) {
            const {w, h} = getCurrentImageSize(state as RootState['images'], action.payload)
            item.size.width = w
            item.size.height = h
          }
        }
      })

      // make some changes inactive
      .addCase(ShangeEditorHistoryActive.fulfilled, (state, action) => {
        const item = state.editorItems.find(item => typeof item?.image?.id === 'number' && item?.image?.id === action.payload.id)
        if (item) {
          item.editorActions = item.editorActions.map((a, i)=> { 
            a.active = i <= action.payload.index;
            return a
          })
          item.url = item.editorActions.filter(a => a.active).reverse()[0]?.url || item.image?.downloadUrl || ''
          if (item.image) {
            const {w, h} = getCurrentImageSize(state as RootState['images'], action.payload.id)
            item.size.width = w
            item.size.height = h
          }
        }
      })
  },
});

export default imageSlice.reducer;

export const getCurrentImageSize = (state: RootState['images'], id: number): {w: number, h: number} => {
  const editorItem = state.editorItems.find(item => typeof item?.image?.id === 'number' && item?.image?.id === id)
  const resizeActions = (editorItem?.editorActions || [])
    .filter(action => action.type === EditorChangeType.resize).reverse()[0]?.props as ResizeProps || null

  return {w: resizeActions?.wAbs || editorItem?.image?.width || 0, h: resizeActions?.hAbs || editorItem?.image?.height || 0}
}

// selector pagination
export const selectPagination = () => (state: RootState): Pagination => state.images.pagination
// selector for grid page
export const selectImagesApiStatus = (state: RootState) => state.images.status
export const selectImagesGrid = (state: RootState) => {
  const { start, end } = getStartEndIndex(state.images.pagination)
  return state.images.items.filter(item => item.index >= start && item.index < end)
}
export const selectGridPageData = createSelector([selectImagesGrid, selectImagesApiStatus], (items, status) => ({items, status}))

// select status
export const selectImagesApiStatusForMemo = () => selectImagesApiStatus

// selector image
export const getItemById = (id: number) => (state: RootState): ImageStoreItem|undefined => {
  return state.images.items.find(item => item?.image?.id === id) || undefined
}
// selector for image canvas page
export const getImageUrlForCanvas = (id: number, showEdited: boolean) => (state: RootState) => {
  const editorItem = state.images.editorItems.find(item => item?.image?.id === id)
  const item = state.images.items.find(item => item?.image?.id === id)
  return ((showEdited ? editorItem?.url : item?.image?.downloadUrl)) || ''
}
// selector editorItems
export const getEditorItemsById = (id: number) => (state: RootState): ImageEditorStoreItem|undefined => {
  return state.images.editorItems.find(item => item?.image?.id === id) || undefined
}
// is first page selector
export const isFirstPageSelector = () => (state: RootState) => state.images.pagination.page === 1