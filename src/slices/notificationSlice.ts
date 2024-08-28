import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export enum NotificationType {
  Success = "success",
  Error = "error",
  Warning = "warning",
  Info = "info",
}

type Notification = {
  open: boolean;
  message: string;
  type: NotificationType;
};

type ShowNotification = Omit<Notification, "open">;

const initialState = {
  open: false,
  message: "",
  type: NotificationType.Success,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<ShowNotification>) => {
      state.open = true;
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    showNotificationNoChanges: (state) => {
      state.open = true;
      state.message = 'Nothing changed';
      state.type = NotificationType.Warning;
    },
    hideNotification: (state) => {
      state.open = false;
      state.message = "";
    },
  },
});

export const { showNotification, hideNotification, showNotificationNoChanges } = notificationSlice.actions;
export default notificationSlice.reducer;