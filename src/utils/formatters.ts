/**
 * Formatea un número como moneda (pesos chilenos)
 * @param amount - Monto a formatear
 * @returns Cadena formateada con formato de moneda
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Formatea una fecha en formato corto (día, mes y año)
 * @param dateString - Cadena de fecha (ISO)
 * @returns Fecha formateada
 */
export const formatShortDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('es-CL', options);
};

/**
 * Formatea una fecha incluyendo la hora
 * @param dateString - Cadena de fecha (ISO)
 * @returns Fecha y hora formateadas
 */
export const formatDateTime = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('es-CL', options);
}; 