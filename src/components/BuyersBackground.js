import { jsx as _jsx } from "react/jsx-runtime";
import IconBackground from './IconBackground';
import '../assets/styles/buyersBackground.css';
import peopleSvg from '../assets/images/backgrounds/people.svg';
/**
 * Componente de fondo específico para la página de compradores
 * Utiliza el componente IconBackground con la configuración específica
 */
const BuyersBackground = () => {
    return (_jsx(IconBackground, { svgPath: peopleSvg, baseColor: "#ffd6a5" // Color morado para la sección de compradores
     }));
};
export default BuyersBackground;
