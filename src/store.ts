import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "./slices/notificationSlice";
import imageSlice from "./slices/imageSlice";
import { axiosMiddleware } from "./api/middleware";

const store = configureStore({
  reducer: {
    images: imageSlice,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(axiosMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
