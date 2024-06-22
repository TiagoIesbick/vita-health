// Disclaimer: This example keeps the access token in LocalStorage just because
// it's simpler, but in a real application you may want to use cookies instead
// for better security. Also, it doesn't handle token expiration.
import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'accessToken';

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export const storeToken = (token) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getCredentials = () => {
   const token = getAccessToken();
   if (!token) {
      return null;
   };
   return getCredentialsFromToken(token);
};

const getCredentialsFromToken = (token) => {
  const credentials = jwtDecode(token);
  return credentials;
};
