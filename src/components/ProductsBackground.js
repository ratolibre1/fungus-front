import { jsx as _jsx } from "react/jsx-runtime";
import IconBackground from './IconBackground';
import '../assets/styles/productsBackground.css';
import boxSeamSvg from '../assets/images/backgrounds/box-seam.svg';
/**
 * Componente de fondo específico para la página de productos
 * Utiliza el componente IconBackground con la configuración específica
 */
const ProductsBackground = () => {
    return (_jsx(IconBackground, { svgPath: boxSeamSvg, baseColor: "#a0c4ff" // Color morado/azul para la sección de productos
     }));
};
export default ProductsBackground;
