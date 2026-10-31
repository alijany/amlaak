import { getToken, refreshTokens } from '@/components/auth/auth.utils.tokens';
import { API_URL } from '../../../constants';
import { ApiError } from './api.types.error';

export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const baseUrl = API_URL;
  
  // Internal function to make the actual request
  const makeRequest = async (token: string | null): Promise<Response> => {
    const requestInit = { ...init };
    
    if (token) {
      const headers = requestInit?.headers ?? {};
      requestInit.headers = {
        ...headers,
        'Authorization': `Bearer ${token}`
      };
    }

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
    // Read the body once. A second `response.json()` always throws on the
    // consumed stream, so structured detail — error codes, validation issues —
    // would be discarded before any caller could see it.
    const payload = await response.json().catch(() => null);
    // No copy is chosen here. `fetcher` is a plain function with no
    // `useTranslations`, so it carries the API's `code` through untouched and
    // lets `useApiErrorMessage` pick the wording at the display layer, where
    // the locale is actually known.
    const error = new ApiError(payload?.message ?? '');
    error.status = response.status;
    error.code = payload?.code;
    error.params = payload?.params;
    error.issues = payload?.issues;
    error.info = payload ?? { message: response.statusText };
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
