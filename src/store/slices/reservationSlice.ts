import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Reservation } from "@/types/reservation";

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
    setReservations(state, action: PayloadAction<Reservation[]>) {
      state.reservations = action.payload;
    },
    updateReservationFinancials(
      state, 
      action: PayloadAction<{ 
        id: string; 
        paid_amount: number; 
        remaining_amount: number; 
        payment_status: "NON_PAYE" | "PARTIEL" | "PAYE" 
      }>
    ) {
      const { id, paid_amount, remaining_amount, payment_status } = action.payload;
      const index = state.reservations.findIndex((r) => r.id === id);
      if (index !== -1) {
        state.reservations[index].paid_amount = paid_amount;
        state.reservations[index].remaining_amount = remaining_amount;
        state.reservations[index].payment_status = payment_status;
      }
      if (state.selectedReservation && state.selectedReservation.id === id) {
        state.selectedReservation.paid_amount = paid_amount;
        state.selectedReservation.remaining_amount = remaining_amount;
        state.selectedReservation.payment_status = payment_status;
      }
    },
  },
});

export const { setReservations, updateReservationFinancials } = reservationSlice.actions;
export default reservationSlice.reducer;
