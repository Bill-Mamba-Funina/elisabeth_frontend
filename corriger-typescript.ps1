
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " ELISABETH - CORRECTION TYPESCRIPT" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# 1. DOSSIER DU PROJET
# ============================================================

$projectPath = "D:\projet\web\elisabeth_frontend"

if (-not (Test-Path $projectPath)) {
    Write-Host "ERREUR : Le dossier du projet est introuvable :" -ForegroundColor Red
    Write-Host $projectPath -ForegroundColor Red
    exit 1
}

Set-Location $projectPath

Write-Host "Projet :" -ForegroundColor Green
Write-Host $projectPath
Write-Host ""

# ============================================================
# 2. FICHIERS
# ============================================================

$apiRoutesFile = ".\src\lib\api-routes.ts"
$reservationSliceFile = ".\src\store\slices\reservationSlice.ts"
$dashboardFile = ".\src\app\dashboard\page.tsx"
$loginFile = ".\src\app\login\page.tsx"

if (-not (Test-Path $apiRoutesFile)) {
    Write-Host "ERREUR : $apiRoutesFile introuvable." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $reservationSliceFile)) {
    Write-Host "ERREUR : $reservationSliceFile introuvable." -ForegroundColor Red
    exit 1
}

# ============================================================
# 3. SAUVEGARDE
# ============================================================

$backupDirectory = ".\backup_typescript_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

New-Item `
    -ItemType Directory `
    -Path $backupDirectory `
    -Force | Out-Null

Copy-Item `
    $apiRoutesFile `
    "$backupDirectory\api-routes.ts" `
    -Force

Copy-Item `
    $reservationSliceFile `
    "$backupDirectory\reservationSlice.ts" `
    -Force

Write-Host "Sauvegarde créée :" -ForegroundColor Green
Write-Host $backupDirectory
Write-Host ""

# ============================================================
# 4. CORRECTION API_ROUTES
# ============================================================

Write-Host "---------------------------------------------" -ForegroundColor DarkGray
Write-Host "Correction de api-routes.ts" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor DarkGray

$apiRoutesContent = @'
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/token/",
    REFRESH: "/auth/refresh/",
  },

  CLIENTS: "/clients/",
  HALLS: "/halls/",
  SERVICES: "/services/",
  MATERIALS: "/materials/",

  RESERVATIONS: "/reservations/",
  RESERVATION_SERVICES: "/reservation-services/",
  RESERVATION_MATERIALS: "/reservation-materials/",

  PAYMENTS: "/payments/",
  EXPENSES: "/expenses/",
  CASH_MOVEMENTS: "/cash-movements/",

  FINANCES: {
    PAIEMENTS: "/payments/",
    DEPENSES: "/expenses/",
    MOUVEMENTS: "/cash-movements/",
  },

  PERSONNEL: "/personnel/",

  DASHBOARD: "/dashboard/",

  CALENDAR: "/calendar",

  NOTIFICATIONS: "/notifications/",
  DOCUMENTS: "/documents/",
  RAPPORTS: "/rapports/",
} as const;
'@

Set-Content `
    -Path $apiRoutesFile `
    -Value $apiRoutesContent `
    -Encoding UTF8

Write-Host "api-routes.ts : OK" -ForegroundColor Green
Write-Host ""

# ============================================================
# 5. CORRECTION RESERVATION SLICE
# ============================================================

Write-Host "---------------------------------------------" -ForegroundColor DarkGray
Write-Host "Correction de reservationSlice.ts" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor DarkGray

$reservationSliceContent = @'
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
'@

Set-Content `
    -Path $reservationSliceFile `
    -Value $reservationSliceContent `
    -Encoding UTF8

Write-Host "reservationSlice.ts : OK" -ForegroundColor Green
Write-Host ""

# ============================================================
# 6. VERIFICATION DASHBOARD
# ============================================================

Write-Host "---------------------------------------------" -ForegroundColor DarkGray
Write-Host "Verification de dashboard/page.tsx" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor DarkGray

if (Test-Path $dashboardFile) {

    $dashboardContent = Get-Content `
        -Path $dashboardFile `
        -Raw

    if ($dashboardContent -match "API_ROUTES\.FINANCES\.PAIEMENTS") {
        Write-Host "API_ROUTES.FINANCES.PAIEMENTS : OK" -ForegroundColor Green
    }
    else {
        Write-Host "API_ROUTES.FINANCES.PAIEMENTS non trouve." -ForegroundColor Yellow
    }

}
else {

    Write-Host "dashboard/page.tsx introuvable." -ForegroundColor Yellow

}

Write-Host ""

# ============================================================
# 7. VERIFICATION LOGIN
# ============================================================

Write-Host "---------------------------------------------" -ForegroundColor DarkGray
Write-Host "Verification de login/page.tsx" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor DarkGray

if (Test-Path $loginFile) {

    $loginContent = Get-Content `
        -Path $loginFile `
        -Raw

    if ($loginContent -match "API_ROUTES\.AUTH\.LOGIN") {
        Write-Host "API_ROUTES.AUTH.LOGIN : OK" -ForegroundColor Green
    }
    else {
        Write-Host "API_ROUTES.AUTH.LOGIN non trouve." -ForegroundColor Yellow
    }

}
else {

    Write-Host "login/page.tsx introuvable." -ForegroundColor Yellow

}

Write-Host ""

# ============================================================
# 8. AFFICHAGE DES ROUTES IMPORTANTES
# ============================================================

Write-Host "---------------------------------------------" -ForegroundColor DarkGray
Write-Host "Routes ajoutees" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor DarkGray

Select-String `
    -Path $apiRoutesFile `
    -Pattern "AUTH|LOGIN|REFRESH|FINANCES|PAIEMENTS|DEPENSES|MOUVEMENTS"

Write-Host ""

# ============================================================
# 9. VERIFICATION TYPESCRIPT
# ============================================================

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " VERIFICATION TYPESCRIPT" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

npx tsc --noEmit

$tscExitCode = $LASTEXITCODE

Write-Host ""

# ============================================================
# 10. RESULTAT
# ============================================================

if ($tscExitCode -eq 0) {

    Write-Host "====================================================" -ForegroundColor Green
    Write-Host " TYPESCRIPT : AUCUNE ERREUR" -ForegroundColor Green
    Write-Host "====================================================" -ForegroundColor Green
    Write-Host ""

    Write-Host "Les corrections sont terminees." -ForegroundColor Green

}
else {

    Write-Host "====================================================" -ForegroundColor Red
    Write-Host " TYPESCRIPT A ENCORE DES ERREURS" -ForegroundColor Red
    Write-Host "====================================================" -ForegroundColor Red
    Write-Host ""

    Write-Host "Les fichiers originaux sont sauvegardes ici :" -ForegroundColor Yellow
    Write-Host $backupDirectory -ForegroundColor Yellow

    Write-Host ""
    Write-Host "Code de sortie TypeScript : $tscExitCode" -ForegroundColor Red

    exit $tscExitCode
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " FIN DU SCRIPT" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
```
