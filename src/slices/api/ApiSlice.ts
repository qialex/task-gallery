import { AxiosError } from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import axiosInstance from "../../services/axiosInstance";
import { GridIndex, ImageDTO, Image } from "../../types";
import { ImageApiStatus, RequestPhase } from "../../constants";
import { imagesEntitiesAddUpdateAction, imagesKey } from "../imageSlice";
import { getStartEndIndex } from "../../utils";
import { imagesGridKey, paginationAddUpdateAction } from "../imagesGridSlice";
import { imagesEditorEntitiesAddUpdateAction, imagesEditorKey } from "../imageEditorSlice";

export const apiKey = "api"

type ApiState = {
  status: RequestPhase
  error: string | null
};

export const initialState: ApiState = {
  status: RequestPhase.idle,
  error: null,
};

const transformer = (imageDTO: ImageDTO): Image => {
  return {
    id: parseInt(imageDTO.id),
    url: imageDTO.url,
    author: imageDTO.author,
    downloadUrl: imageDTO.download_url,
    size: {
      width: imageDTO.width,
      height: imageDTO.height,
    },
  } as Image
}

export const getImages = createAsyncThunk(
  `${imagesKey}/getAll`,
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { pagination } = (getState() as RootState)[imagesGridKey]
    try {
      const response = await axiosInstance.get("/v2/list", {params: pagination});
      const images = response.data.map((imageDTO: ImageDTO) => transformer(imageDTO))
      dispatch(imagesEntitiesAddUpdateAction(images))
      dispatch(paginationAddUpdateAction(images))
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
      const { pagination, gridIndexes } = (getState() as RootState)[imagesGridKey]
      const { status } = (getState() as RootState).api

      const { start } = getStartEndIndex(pagination)

      const isApiNeeded = new Array(pagination.limit).fill(0)
        .map((_, i) => gridIndexes.find((gridIndex: GridIndex) => gridIndex.index === start + i))
        .filter((gridIndex: GridIndex | undefined) => !gridIndex || (gridIndex.apiStatus === ImageApiStatus.error))

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
  `${imagesKey}/getOne`,
  async (imageId: number, { rejectWithValue, getState, dispatch }) => {
    // if image exist
    const entitiesImages = (getState() as RootState)[imagesKey].entities
    const image = entitiesImages[imageId] || undefined
    if (image) {
      dispatch(imagesEditorEntitiesAddUpdateAction([image]))
      return
    }

    try {
      const response = await axiosInstance.get(`/id/${imageId}/info`);
      const images = [response.data].map((imageDTO: ImageDTO) => transformer(imageDTO))
      dispatch(imagesEntitiesAddUpdateAction(images))
      dispatch(imagesEditorEntitiesAddUpdateAction(images))

    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(imagesEditorEntitiesAddUpdateAction([{id: imageId, size: {width: 0, height: 0}, url: '', downloadUrl: '', author: ''}]))
        return rejectWithValue(errorResponse);
      }
      throw error;
    }
  },
  {
    condition: (imageId: number, { getState }) => {
      const entitiesImages = (getState() as RootState)[imagesKey].entities
      const entitiesEditor = (getState() as RootState)[imagesEditorKey].entities
      const { status } = (getState() as RootState).api

      const image = entitiesImages[imageId] || undefined
      const editorItem = entitiesEditor[imageId] || undefined

      // Already fetched or in progress, don't need to re-fetch
      if (status === RequestPhase.loading || (image && editorItem)) {
        return false
      } else {
        return true
      }
    },
  },
);

export const apiSlice = createSlice({
  name: apiKey,
  initialState,
  reducers: {
    // reducer
    // prepare
  },
  extraReducers: (builder) => {
    builder
      // iamges
      .addCase(getImages.pending, (state) => {
        state.status = RequestPhase.loading;
        state.error = null;
      })
      .addCase(getImages.fulfilled, (state) => {
        state.status = RequestPhase.idle;
        state.error = null;
      })
      .addCase(getImages.rejected, (state, action) => {
        state.status = RequestPhase.failed;
        state.error = action.error.message || "Failed to fetch images.";
      })
      // iamge single
      .addCase(getImage.pending, (state) => {
        state.status = RequestPhase.loading;
        state.error = null;
      })
      .addCase(getImage.fulfilled, (state) => {
        state.status = RequestPhase.idle;
        state.error = null;
      })
      .addCase(getImage.rejected, (state, action) => {
        state.status = RequestPhase.failed;
        state.error = action.error.message || "Failed to fetch image.";
      })
  },
});

export default apiSlice.reducer;

// select api status
export const selectApiStatus = () => (state: RootState) => state[apiKey].status

// select api status
export const selectApiStatusLoading = () => (state: RootState) => state[apiKey].status === RequestPhase.loading