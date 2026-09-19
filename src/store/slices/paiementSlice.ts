import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Paiement {
  id: number;
  reservationId: number;
  montant: number;
  modePaiement: string;
  datePaiement: string;
  reference?: string;
}

interface PaiementState {
  paiements: Paiement[];
  loading: boolean;
}

const initialState: PaiementState = {
  paiements: [],
  loading: false,
};

const paiementSlice = createSlice({
  name: "paiements",
  initialState,
  reducers: {
    setPaiements: (
      state,
      action: PayloadAction<Paiement[]>
    ) => {
      state.paiements = action.payload;
    },

    addPaiement: (
      state,
      action: PayloadAction<Paiement>
    ) => {
      state.paiements.push(action.payload);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setPaiements,
  addPaiement,
  setLoading,
} = paiementSlice.actions;

export default paiementSlice.reducer;
