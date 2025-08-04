import axios from 'axios';
import { deleteItem, getItem, setItem } from '../utils/storage';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

api.interceptors.request.use(
  async (config) => {
    console.log('Making request to:', config.url);
    console.log('Request data:', config.data);
    
    try {
      const accessToken = await getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('Added Authorization header');
      } else {
        console.log('No access token available');
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.data);
    return response;
  },
  async (error) => {
    console.error('Response error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getItem('refreshToken');
        if (refreshToken) {
          console.log('Attempting to refresh token...');
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, { 
            refreshToken 
          });
          
        if (refreshResponse.data.accessToken) {
             await setItem('accessToken', refreshResponse.data.accessToken);
             await setItem('refreshToken', refreshResponse.data.refreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
            console.log('Retrying request with new token');
            return api(originalRequest);
          }
        }
             } catch (refreshError) {
         console.error('Token refresh failed:', refreshError);
         await deleteItem('accessToken');
         await deleteItem('refreshToken');
       }
    }

    return Promise.reject(error);
  }
);

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export const authAPI = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
      const response = await api.post(`${API_BASE_URL}/auth/register`, payload);
      return response.data;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await api.post(`${API_BASE_URL}/auth/login`, payload);
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    try {
      const response = await api.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api; 