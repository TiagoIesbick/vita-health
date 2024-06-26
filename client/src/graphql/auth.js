// Disclaimer: This example keeps the access token in LocalStorage just because
// it's simpler, but in a real application you may want to use cookies instead
// for better security. Also, it doesn't handle token expiration.
import { jwtDecode } from 'jwt-decode';

export const ACCESS_TOKEN_KEY = 'accessToken';

export const ACCESS_MEDICAL_TOKEN_KEY = 'accessMedicalToken';

export const getAccessToken = (access) => {
  return localStorage.getItem(access);
}

export const storeToken = (access, token) => {
  localStorage.setItem(access, token);
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_MEDICAL_TOKEN_KEY);
};

export const getCredentials = (access) => {
   const token = getAccessToken(access);
   if (!token) {
      return null;
   };
   return getCredentialsFromToken(token);
};

const getCredentialsFromToken = (token) => {
  const credentials = jwtDecode(token);
  return credentials;
};
