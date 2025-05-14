/**
 * Funciones para validación y formateo de datos
 */

/**
 * Compara dos strings según las reglas de ordenamiento en español,
 * considerando que las letras con acentos se ordenan junto con sus versiones sin acento,
 * y la Ñ después de la N.
 * 
 * @param a Primer string a comparar
 * @param b Segundo string a comparar
 * @returns -1 si a < b, 1 si a > b, 0 si son iguales
 */
export const compareStringsSpanish = (a: string, b: string): number => {
  const collator = new Intl.Collator('es-ES', {
    sensitivity: 'base',  // Ignora mayúsculas/minúsculas y acentos para ordenamiento
    numeric: true         // Para manejar números correctamente
  });

  return collator.compare(String(a), String(b));
};

/**
 * Limpia un RUT chileno, eliminando puntos y guión
 * @param rut RUT con o sin formato
 * @returns RUT limpio (solo números y K)
 */
export const cleanRut = (rut: string): string => {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
};

/**
 * Formatea un RUT chileno con puntos y guión
 * @param rut RUT sin formato
 * @returns RUT formateado (Ej: 12.345.678-9)
 */
export const formatRut = (rut: string): string => {
  const cleaned = cleanRut(rut);
  if (cleaned.length === 0) return "";

  // Separar el cuerpo del dígito verificador
  const dv = cleaned.charAt(cleaned.length - 1);
  const rutBody = cleaned.slice(0, -1);

  // Si no hay suficientes dígitos, retornar lo mismo
  if (rutBody.length < 1) return cleaned;

  // Formatear el cuerpo con puntos
  let formattedBody = "";
  let counter = 0;

  for (let i = rutBody.length - 1; i >= 0; i--) {
    counter++;
    formattedBody = rutBody.charAt(i) + formattedBody;
    if (counter === 3 && i !== 0) {
      formattedBody = "." + formattedBody;
      counter = 0;
    }
  }

  // Unir cuerpo formateado con dígito verificador
  return `${formattedBody}-${dv}`;
};

/**
 * Calcula el dígito verificador de un RUT chileno
 * @param rutBody Cuerpo del RUT (sin dígito verificador)
 * @returns Dígito verificador (0-9 o K)
 */
export const calculateDV = (rutBody: string): string => {
  const cleaned = rutBody.replace(/[^0-9]/g, "");
  let sum = 0;
  let factor = 2;

  // Sumatoria
  for (let i = cleaned.length - 1; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }

  // Cálculo del dígito
  const remainder = 11 - (sum % 11);

  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return remainder.toString();
};

/**
 * Valida si un RUT chileno es válido
 * @param rut RUT a validar (con o sin formato)
 * @returns true si el RUT es válido, false en caso contrario
 */
export const validateRut = (rut: string): boolean => {
  const cleaned = cleanRut(rut);

  // Verificar largo mínimo
  if (cleaned.length < 2) return false;

  // Obtener dígito verificador y cuerpo
  const dv = cleaned.charAt(cleaned.length - 1);
  const rutBody = cleaned.slice(0, -1);

  // Verificar que el cuerpo solo tenga números
  if (!/^[0-9]+$/.test(rutBody)) return false;

  // Calcular y comparar dígito verificador
  const calculatedDV = calculateDV(rutBody);

  return calculatedDV === dv;
};

/**
 * Limpia un número de teléfono, dejando solo dígitos
 * @param phone Número de teléfono con o sin formato
 * @returns Número de teléfono limpio (solo dígitos)
 */
export const cleanPhone = (phone: string): string => {
  return phone.replace(/[^0-9]/g, "");
};

/**
 * Formatea un número de teléfono en formato chileno
 * @param phone Número de teléfono sin formato
 * @returns Número formateado (Ej: 569 1234 5678)
 */
export const formatPhone = (phone: string): string => {
  let formatted = cleanPhone(phone);
  if (formatted.length === 0) return "";

  // Si hay muy pocos dígitos, no aplicamos formato para facilitar borrado
  if (formatted.length <= 2) return formatted;

  // Formateamos con espacios
  // Caso: 912345678 -> 9 1234 5678
  if (formatted.length >= 1) {
    // Primer grupo (9)
    if (formatted.length >= 2) { // 9x
      formatted = `${formatted.slice(0, 1)} ${formatted.slice(1)}`;
    }

    // Segundo grupo (1234)
    if (formatted.length >= 6) { // 9 1234xx
      formatted = `${formatted.slice(0, 6)} ${formatted.slice(6)}`;
    }
  }

  return formatted;
}; 