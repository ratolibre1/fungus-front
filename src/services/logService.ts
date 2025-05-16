import { LogFilters, LogsResponse, LogResponse, LogDeleteResponse, LogCleanupResponse } from '../types/Log';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Obtiene los logs según los filtros proporcionados
 * @param filters Filtros para la consulta
 * @returns Respuesta con los logs y metadata de paginación
 */
export const getLogs = async (filters: LogFilters = {}): Promise<LogsResponse> => {
  const token = localStorage.getItem('fungus_token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  // Construir query string con los filtros
  const queryParams = new URLSearchParams();
  if (filters.operation) queryParams.append('operation', filters.operation);
  if (filters.collection) queryParams.append('collection', filters.collection);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.documentId) queryParams.append('documentId', filters.documentId);
  if (filters.userId) queryParams.append('userId', filters.userId);
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());

  const queryString = queryParams.toString();
  const url = `${API_URL}/logs${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener los logs');
  }

  return await response.json();
};

/**
 * Obtiene un log específico por su ID
 * @param id ID del log
 * @returns Respuesta con los datos del log
 */
export const getLogById = async (id: string): Promise<LogResponse> => {
  const token = localStorage.getItem('fungus_token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_URL}/logs/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener el log');
  }

  return await response.json();
};

/**
 * Elimina un log específico por su ID
 * @param id ID del log a eliminar
 * @returns Respuesta con mensaje de confirmación
 */
export const deleteLog = async (id: string): Promise<LogDeleteResponse> => {
  const token = localStorage.getItem('fungus_token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_URL}/logs/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar el log');
  }

  return await response.json();
};

/**
 * Limpia los logs antiguos del sistema
 * @returns Respuesta con mensaje de confirmación
 */
export const cleanupLogs = async (): Promise<LogCleanupResponse> => {
  const token = localStorage.getItem('fungus_token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_URL}/logs/cleanup`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al limpiar los logs');
  }

  return await response.json();
}; 