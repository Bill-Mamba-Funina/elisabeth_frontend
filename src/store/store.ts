import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import clientReducer from "./slices/clientSlice";
import notificationReducer from "./slices/notificationSlice";
import paiementReducer from "./slices/paiementSlice";
import reservationReducer from "./slices/reservationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
    notifications: notificationReducer,
    paiements: paiementReducer,
    reservations: reservationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
