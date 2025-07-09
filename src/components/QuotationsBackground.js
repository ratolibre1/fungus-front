import { jsx as _jsx } from "react/jsx-runtime";
import IconBackground from './IconBackground';
import '../assets/styles/quotationsBackground.css';
import fileEarmarkTextSvg from '../assets/images/backgrounds/file-earmark-text.svg';
/**
 * Componente de fondo específico para la página de cotizaciones
 * Utiliza el componente IconBackground con la configuración específica
 */
const QuotationsBackground = () => {
    return (_jsx(IconBackground, { svgPath: fileEarmarkTextSvg, baseColor: "#fc9dff" // Color rosa/magenta para la sección de cotizaciones
     }));
};
export default QuotationsBackground;
