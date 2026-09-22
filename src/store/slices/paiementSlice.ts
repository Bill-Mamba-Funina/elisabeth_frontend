import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Paiement } from "@/types/paiement";

interface PaiementState {
  paiements: Paiement[];
  loading: boolean;
  error: string | null;
}

const initialState: PaiementState = {
  paiements: [],
  loading: false,
  error: null,
};

const paiementSlice = createSlice({
  name: "paiements",
  initialState,
  reducers: {
    setPaiements(state, action: PayloadAction<Paiement[]>) {
      state.paiements = action.payload;
    },
    addPaiement(state, action: PayloadAction<Paiement>) {
      state.paiements.unshift(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setPaiements, addPaiement, setLoading, setError } = paiementSlice.actions;
export default paiementSlice.reducer;
