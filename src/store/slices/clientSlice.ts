import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Client } from "@/types/client";

interface ClientState {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClientState = {
  clients: [],
  selectedClient: null,
  loading: false,
  error: null,
};

const clientSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setClients(state, action: PayloadAction<Client[]>) {
      state.clients = action.payload;
    },
    addClient(state, action: PayloadAction<Client>) {
      state.clients.unshift(action.payload);
    },
    setSelectedClient(state, action: PayloadAction<Client | null>) {
      state.selectedClient = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setClients, addClient, setSelectedClient, setLoading } = clientSlice.actions;
export default clientSlice.reducer;
