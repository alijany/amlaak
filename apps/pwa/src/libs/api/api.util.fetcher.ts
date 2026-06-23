import { getToken, refreshTokens } from '@/components/auth/auth.utils.tokens';
import { API_URL } from '../../../constants';
import { ApiError } from './api.types.error';

/** The active agency (tenant) selected in the dashboard, sent on every request. */
function getActiveAgencyId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('selected-agency');
}

export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const baseUrl = API_URL;

  // Internal function to make the actual request
  const makeRequest = async (token: string | null): Promise<Response> => {
    const requestInit = { ...init };
    const headers: Record<string, string> = {
      ...(requestInit?.headers as Record<string, string>),
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const agencyId = getActiveAgencyId();
    if (agencyId) headers['x-agency-id'] = agencyId;

    requestInit.headers = headers;

    return fetch(`${baseUrl}${url}`, requestInit);
  };

  // First attempt with current token
  const token = getToken();
  let response = await makeRequest(token);

  // If we get 401 and we have a token, try to refresh
  if (response.status === 401 && token) {
    const newToken = await refreshTokens();
    
    if (newToken) {
      // Retry with new token
      response = await makeRequest(newToken);
    }
  }

  if (!response.ok) {
    const errorMessage = (await response.json().catch(() => null))?.message || 'خطای ناشناخته';
    const error = new ApiError(errorMessage);
    error.status = response.status;
    try {
      error.info = await response.json();
    } catch {
      error.info = { message: response.statusText };
    }
    throw error;
  }

  return response.json().catch(() => null);
}

export async function postFetcher<T, R>(url: string, {arg}: {arg:T}): Promise<R> {
  return fetcher<R>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
}

export async function patchFetcher<T, R>(url: string, {arg}: {arg:T}): Promise<R> {
  return fetcher<R>(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
}

export async function deleteFetcher<R>(url: string): Promise<R> {
  return fetcher<R>(url, {
    method: 'DELETE',
  });
}

export async function putFetcher<T, R>(url: string, {arg}: {arg:T}): Promise<R> {
  return fetcher<R>(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
}

export async function formDataFetcher<R>(url: string, { arg }: { arg: FormData }): Promise<R> {
  return fetcher<R>(url, {
    method: 'POST',
    body: arg,
  });
}

export async function uploadFileFetcher<R>(url: string, file: File): Promise<R> {
  const formData = new FormData();
  formData.append('file', file);

  return fetcher<R>(url, {
    method: 'POST',
    body: formData,
  });
}
