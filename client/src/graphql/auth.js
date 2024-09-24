import { jwtDecode } from 'jwt-decode';


export const ACCESS_TOKEN_KEY = 'accessToken';


export const ACCESS_MEDICAL_TOKEN_KEY = 'accessMedicalToken';


const setCookie = (name, value, days) => {
  let expires = "";
  if (days && name !== 'accessMedicalToken') {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  } else if (name === 'accessMedicalToken') {
    try {
      const { exp } = getCredentialsFromToken(value);
      const expirationDate = new Date(exp * 1000);
      expires = "; expires=" + expirationDate.toUTCString();
    } catch (error) {
      console.error("Invalid JWT token:", error);
    }
  };
  document.cookie = `${name}=${value || ""}${expires}; path=/; Secure; SameSite=Strict`;
};


const getCookie = (name) => {
  const nameEQ = name + "=";
  const cookiesArray = document.cookie.split(';');
  for (let i = 0; i < cookiesArray.length; i++) {
    let cookie = cookiesArray[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
};


export const deleteCookie = (name) => {
  document.cookie = `${name}=; Max-Age=-99999999; path=/`;
};


export const getAccessToken = (access) => {
  return getCookie(access);
};


export const storeToken = (access, token) => {
  setCookie(access, token, 7); // Store token in cookies for 7 days
};


export const logout = () => {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(ACCESS_MEDICAL_TOKEN_KEY);
};


export const getCredentials = (access) => {
  const token = getAccessToken(access);
  if (!token) {
    return null;
  }
  return getCredentialsFromToken(token);
};


const getCredentialsFromToken = (token) => {
  const credentials = jwtDecode(token);
  return credentials;
};
