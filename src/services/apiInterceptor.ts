/**
 * Interceptor para manejar respuestas HTTP
 * Redirecciona a SessionExpired si recibe un 401 (token expirado)
 */

// Tipo para las respuestas de API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Función para manejar respuestas HTTP
export const handleApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (response.status === 401) {
    // Guardar la URL actual para redirigir después del login (opcional)
    localStorage.setItem('fungus_redirect_after_login', window.location.pathname);

    // Redirigir a la página de sesión expirada
    window.location.href = '/sesion-expirada';

    // Rechazar la promesa para detener la ejecución
    throw new Error('La sesión ha expirado');
  }

  // Para otros errores, lanzar según el mensaje del servidor
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  const respJson = await response.json();
  console.log('Respuesta original de API:', respJson);
  return respJson;
};

// Función para realizar peticiones con el interceptor
export const fetchWithInterceptor = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const response = await fetch(url, options);
  return handleApiResponse<T>(response);
};

// Función para obtener los headers con autenticación
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('fungus_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}; 