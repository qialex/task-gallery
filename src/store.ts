import { configureStore } from "@reduxjs/toolkit";
import notificationReducer, { notificationKey } from "./slices/notificationSlice";
import imageSlice, { imagesKey } from "./slices/imageSlice";
import { axiosMiddleware } from "./slices/api/ApiMiddleware";
import apiSlice, { apiKey } from "./slices/api/ApiSlice";
import imagesGrid, { imagesGridKey } from "./slices/imagesGridSlice";
import imageEditorSlice, { imagesEditorKey } from "./slices/imageEditorSlice";

const store = configureStore({
  reducer: {
    [imagesEditorKey]: imageEditorSlice,
    [imagesGridKey]: imagesGrid,
    [apiKey]: apiSlice,
    [notificationKey]: notificationReducer,
    [imagesKey]: imageSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(axiosMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
