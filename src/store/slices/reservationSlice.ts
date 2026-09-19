import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Reservation {
  id: number;
  clientId: number;
  salleId: number;
  dateDebut: string;
  dateFin: string;
  nombreInvites: number;
  statut: string;
  montantTotal?: number;
}

interface ReservationState {
  reservations: Reservation[];
  selectedReservation: Reservation | null;
  loading: boolean;
}

const initialState: ReservationState = {
  reservations: [],
  selectedReservation: null,
  loading: false,
};

const reservationSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    setReservations: (
      state,
      action: PayloadAction<Reservation[]>
    ) => {
      state.reservations = action.payload;
    },

    addReservation: (
      state,
      action: PayloadAction<Reservation>
    ) => {
      state.reservations.push(action.payload);
    },

    updateReservation: (
      state,
      action: PayloadAction<Reservation>
    ) => {
      const index = state.reservations.findIndex(
        (reservation) => reservation.id === action.payload.id
      );

      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
    },

    removeReservation: (
      state,
      action: PayloadAction<number>
    ) => {
      state.reservations = state.reservations.filter(
        (reservation) => reservation.id !== action.payload
      );
    },

    setSelectedReservation: (
      state,
      action: PayloadAction<Reservation | null>
    ) => {
      state.selectedReservation = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setReservations,
  addReservation,
  updateReservation,
  removeReservation,
  setSelectedReservation,
  setLoading,
} = reservationSlice.actions;

export default reservationSlice.reducer;
