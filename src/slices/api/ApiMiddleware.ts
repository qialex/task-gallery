import { Middleware } from "@reduxjs/toolkit";
import {
  showNotification,
  NotificationType,
} from "../notificationSlice";

export const axiosMiddleware: Middleware =
  ({ dispatch }) =>
    (next) =>
      async (action) => {
        if (action.type.endsWith("/rejected")) {
          const errorMessage = action.payload?.message || "An error occurred!";

          dispatch(
            showNotification({
              type: NotificationType.Error,
              message: errorMessage,
            })
          );
        } 
        return next(action);
      };
