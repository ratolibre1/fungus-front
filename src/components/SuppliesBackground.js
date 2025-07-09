import { jsx as _jsx } from "react/jsx-runtime";
import IconBackground from './IconBackground';
import '../assets/styles/suppliesBackground.css';
import toolsSvg from '../assets/images/backgrounds/tools.svg';
/**
 * Componente de fondo específico para la página de insumos
 * Utiliza el componente IconBackground con la configuración específica
 */
const SuppliesBackground = () => {
    return (_jsx(IconBackground, { svgPath: toolsSvg, baseColor: "#3498DB" // Color azul para la sección de insumos
        , className: "supplies-background", classPrefix: "supply", gridOpacity: 0.35 }));
};
export default SuppliesBackground;
