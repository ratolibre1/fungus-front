import { jsx as _jsx } from "react/jsx-runtime";
import IconBackground from './IconBackground';
import '../assets/styles/salesBackground.css';
import cashCoinSvg from '../assets/images/backgrounds/cash-coin.svg';
/**
 * Componente de fondo específico para la página de ventas
 * Utiliza el componente IconBackground con la configuración específica
 */
const SalesBackground = () => {
    return (_jsx(IconBackground, { svgPath: cashCoinSvg, baseColor: "#592fa6" // Color rosa/magenta para la sección de ventas (igual que cotizaciones)
     }));
};
export default SalesBackground;
