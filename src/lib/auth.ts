const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

/**
 * Enregistre les tokens JWT dans le localStorage.
 */
export function setToken(
  accessToken: string,
  refreshToken?: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  console.log("✅ access_token enregistré :", !!localStorage.getItem(ACCESS_TOKEN_KEY));
  console.log(
    "✅ refresh_token enregistré :",
    !!localStorage.getItem(REFRESH_TOKEN_KEY)
  );
}

/**
 * Récupère le token d'accès.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Récupère le refresh token.
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Supprime les deux tokens.
 */
export function removeToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Vérifie si l'utilisateur possède un access token.
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

