export interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh?: string;
  user: AuthUser;
}
