import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  id: number;
  titre: string;
  message: string;
  lu: boolean;
  createdAt?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (
      state,
      action: PayloadAction<Notification[]>
    ) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(
        (notification) => !notification.lu
      ).length;
    },

    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(
        (item) => item.id === action.payload
      );

      if (notification && !notification.lu) {
        notification.lu = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach(
        (notification) => (notification.lu = true)
      );

      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  markAsRead,
  markAllAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
