import { jsx as _jsx } from "react/jsx-runtime";
import IconBackground from './IconBackground';
import '../assets/styles/suppliersBackground.css';
import truckSvg from '../assets/images/backgrounds/truck.svg';
/**
 * Componente de fondo específico para la página de proveedores
 * Utiliza el componente IconBackground con la configuración específica
 */
const SuppliersBackground = () => {
    return (_jsx(IconBackground, { svgPath: truckSvg, baseColor: "#9bf6ff" // Color naranja para la sección de proveedores
     }));
};
export default SuppliersBackground;
