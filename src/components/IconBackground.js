import { jsx as _jsx } from "react/jsx-runtime";
import '../assets/styles/iconBackground.css';
// Importar directamente la imagen de cash-coin por defecto
import cashCoinSvg from '../assets/images/backgrounds/cash-coin.svg';
/**
 * Convierte un color hexadecimal a HSL
 * @param hex Color en formato #RRGGBB
 * @returns { h: number, s: number, l: number }
 */
function hexToHSL(hex) {
    // Elimina el # si está presente
    hex = hex.replace('#', '');
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    }
    else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}
/**
 * Genera un filtro CSS para transformar un SVG al color deseado
 * @param baseColor Color base en formato hexadecimal (#RRGGBB)
 * @param index Índice del elemento, usado para crear variaciones
 * @param type Tipo de variación: 'light', 'dark' o 'base'
 */
const generateColorFilter = (baseColor, index, type) => {
    // Convertir baseColor a HSL
    const { h, s, l } = hexToHSL(baseColor);
    // Valores base para el filtro
    let invert = 45;
    let sepia = 75;
    let saturate = s + 50; // Basado en saturación del color base
    let hueRotate = h; // Basado en el tono del color base
    let brightness = l + 30; // Basado en luminosidad del color base
    let contrast = 100;
    // Variaciones por tipo
    switch (type) {
        case 'light':
            invert += 5 + (index % 10);
            sepia += 5 + (index % 20);
            saturate += 10 + (index % 30);
            hueRotate += (index % 40);
            brightness += 10 + (index % 10);
            contrast = 90 + (index % 10);
            break;
        case 'dark':
            invert -= 10 - (index % 10);
            sepia -= 10 - (index % 15);
            saturate -= 10 - (index % 20);
            hueRotate -= (index * 2) % 40;
            brightness -= 20 - (index % 10);
            contrast = 110 + (index % 10);
            break;
        case 'base':
        default:
            hueRotate += (index % 7) * 5;
            invert += (index % 5) - 2;
            sepia += (index % 5) - 2;
            brightness += (index % 7) - 3;
            break;
    }
    // Limitar valores a rangos válidos
    hueRotate = ((hueRotate % 360) + 360) % 360;
    saturate = Math.max(50, Math.min(300, saturate));
    brightness = Math.max(50, Math.min(200, brightness));
    return `invert(${invert}%) sepia(${sepia}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg) brightness(${brightness}%) contrast(${contrast}%)`;
};
/**
 * Componente reutilizable para crear fondos decorativos con SVGs
 *
 * Ejemplo de uso:
 *
 * ```tsx
 * // Para la página de productos
 * <IconBackground
 *   svgPath="../assets/images/backgrounds/mushroom.svg"
 *   baseColor="#8B5CF6"
 * />
 * ```
 */
const IconBackground = ({ svgPath, baseColor = '#099347' }) => {
    // Por defecto usamos el icono de cash-coin
    const iconSrc = svgPath || cashCoinSvg;
    // Generar un grid para cubrir toda la pantalla
    const points = [];
    for (let i = 0; i < 900; i++) {
        // Tamaño base del icono
        const size = 30;
        // Para opacidad
        const opacity = i % 5 === 0 ? 0.7 : 1;
        // Determinar qué tipo de variación aplicar según el índice
        let colorVariation = 'base';
        if (i % 11 === 0) {
            colorVariation = 'light';
        }
        else if (i % 7 === 0) {
            colorVariation = 'dark';
        }
        // Generar el filtro de color
        const colorFilter = `brightness(0) saturate(100%) ${generateColorFilter(baseColor, i, colorVariation)}`;
        points.push(_jsx("div", { className: 'diamond-point', children: _jsx("img", { src: iconSrc, alt: "Icon", style: {
                    width: `${size}px`,
                    height: `${size}px`,
                    opacity: opacity,
                    filter: colorFilter,
                } }) }, i));
    }
    return (_jsx("div", { className: "icon-background", children: _jsx("div", { className: 'diamond-grid', style: { opacity: 0.8 }, children: points }) }));
};
export default IconBackground;
