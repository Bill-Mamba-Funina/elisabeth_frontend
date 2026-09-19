import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse?: string;
}

interface ClientState {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
}

const initialState: ClientState = {
  clients: [],
  selectedClient: null,
  loading: false,
};

const clientSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setClients: (state, action: PayloadAction<Client[]>) => {
      state.clients = action.payload;
    },

    addClient: (state, action: PayloadAction<Client>) => {
      state.clients.push(action.payload);
    },

    updateClient: (state, action: PayloadAction<Client>) => {
      const index = state.clients.findIndex(
        (client) => client.id === action.payload.id
      );

      if (index !== -1) {
        state.clients[index] = action.payload;
      }
    },

    removeClient: (state, action: PayloadAction<number>) => {
      state.clients = state.clients.filter(
        (client) => client.id !== action.payload
      );
    },

    setSelectedClient: (
      state,
      action: PayloadAction<Client | null>
    ) => {
      state.selectedClient = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setClients,
  addClient,
  updateClient,
  removeClient,
  setSelectedClient,
  setLoading,
} = clientSlice.actions;

export default clientSlice.reducer;
