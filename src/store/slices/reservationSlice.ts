import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Reservation {
  id: number;

  client?: number;
  hall?: number;

  date_debut?: string;
  date_fin?: string;

  heure_debut?: string;
  heure_fin?: string;

  statut?: string;

  montant_total?: number;
  montant_paye?: number;
  montant_restant?: number;

  [key: string]: unknown;
}

interface ReservationState {
  reservations: Reservation[];
  selectedReservation: Reservation | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReservationState = {
  reservations: [],
  selectedReservation: null,
  loading: false,
  error: null,
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
      const updatedReservation = action.payload;

      const index = state.reservations.findIndex(
        (reservation) =>
          reservation.id === updatedReservation.id
      );

      if (index !== -1) {
        state.reservations[index] = updatedReservation;
      }

      if (
        state.selectedReservation &&
        state.selectedReservation.id === updatedReservation.id
      ) {
        state.selectedReservation = updatedReservation;
      }
    },

    removeReservation: (
      state,
      action: PayloadAction<number>
    ) => {
      const id = action.payload;

      state.reservations = state.reservations.filter(
        (reservation) => reservation.id !== id
      );

      if (
        state.selectedReservation &&
        state.selectedReservation.id === id
      ) {
        state.selectedReservation = null;
      }
    },

    setSelectedReservation: (
      state,
      action: PayloadAction<Reservation | null>
    ) => {
      state.selectedReservation = action.payload;
    },

    setLoading: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.loading = action.payload;
    },

    setError: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearReservations: (state) => {
      state.reservations = [];
      state.selectedReservation = null;
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
  setError,
  clearError,
  clearReservations,
} = reservationSlice.actions;

export default reservationSlice.reducer;
