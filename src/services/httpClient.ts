import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear una instancia de axios
const httpClient = axios.create({
  baseURL: API_URL,
});

// Configurar interceptor para agregar el token de autorización
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fungus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
});

// Interceptor para manejar errores de respuesta
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('fungus_token');
      localStorage.removeItem('fungus_user');
      window.location.href = '/sesion-expirada';
    }
    return Promise.reject(error);
  }
);

export default httpClient; 