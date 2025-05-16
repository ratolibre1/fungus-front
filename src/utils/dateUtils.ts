/**
 * Formatea una fecha ISO a formato DD/MM/YYYY
 * @param isoDate Fecha en formato ISO
 * @returns Fecha formateada como DD/MM/YYYY
 */
export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Formatea una fecha ISO a formato localizado con tiempo
 * @param isoDate Fecha en formato ISO
 * @returns Fecha y hora formateadas
 */
export const formatDateTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Convierte una fecha a formato ISO para enviar a la API
 * @param date Fecha a convertir
 * @returns Fecha en formato ISO YYYY-MM-DD
 */
export const toISODateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}; 