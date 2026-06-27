import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let accessToken = null;
let onTokenRefreshed = null;
let onLogoutTrigger = null;

const axiosClient = axios.create({
  baseURL: VITE_API_URL,
  withCredentials: true, // Enables sending refresh cookies to backend
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configure tokens and handlers from AuthContext
export const setAccessToken = (token) => {
  accessToken = token;
};

export const registerAuthHandlers = (onRefresh, onLogout) => {
  onTokenRefreshed = onRefresh;
  onLogoutTrigger = onLogout;
};

// Request Interceptor: Attach JWT Access Token
axiosClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 and Refresh Token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error status is 401, not a retry, and not calling login/logout
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('/api/auth/login') &&
      !originalRequest.url.includes('/api/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        // Try calling refresh token endpoint
        const res = await axios.post(
          `${VITE_API_URL}/api/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        const newAccessToken = res.data.data.accessToken;
        
        // Save new token in Axios closure
        setAccessToken(newAccessToken);
        
        // Notify React context (so it updates its state)
        if (onTokenRefreshed) {
          onTokenRefreshed(newAccessToken, res.data.data.user);
        }

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        console.error('Refresh token failed. Session expired.', refreshErr.message);
        
        // Session expired: trigger logout on React side
        if (onLogoutTrigger) {
          onLogoutTrigger();
        }
        return Promise.reject(error);
      }
    }
    
    // Pass along other errors (e.g. 400 validation, 403 forbidden)
    return Promise.reject(error);
  }
);

export default axiosClient;
