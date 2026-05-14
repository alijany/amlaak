'use client';

import { API_URL } from "../../../constants";

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('refresh_token', token);
}

export function removeRefreshToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('refresh_token');
}

/**
 * Store authentication tokens from response
 */
export function storeAuthTokens(authResponse: { access_token: string; refresh_token: string }): void {
  setToken(authResponse.access_token);
  setRefreshToken(authResponse.refresh_token);
}

/**
 * Refresh tokens using the refresh token stored in localStorage
 * This function should be called when an API request returns 401
 */
export async function refreshTokens(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    // No refresh token available, user needs to re-authenticate
    removeToken();
    return null;
  }
  
  try {
    const response = await fetch(API_URL +'/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      // Refresh failed, user needs to re-authenticate
      removeToken();
      removeRefreshToken();
      return null;
    }

    const data = await response.json();
    if (data.access_token) {
      storeAuthTokens(data);
      return data.access_token;
    }

    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    removeToken();
    removeRefreshToken();
    return null;
  }
}

/**
 * Logout user by clearing tokens
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  
  // Clear access token from localStorage
  removeToken();
  
  // Clear refresh token from localStorage
  removeRefreshToken();
}
