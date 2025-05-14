import React from 'react';
import IconBackground from './IconBackground';
import '../assets/styles/productsBackground.css';
import boxSeamSvg from '../assets/images/backgrounds/box-seam.svg';

/**
 * Componente de fondo específico para la página de productos
 * Utiliza el componente IconBackground con la configuración específica
 */
const ProductsBackground: React.FC = () => {
  return (
    <IconBackground
      svgPath={boxSeamSvg}    // Usamos el icono de caja para productos (mismo que en Sidebar)
      baseColor="#a0c4ff"     // Color morado/azul para la sección de productos
    />
  );
};

export default ProductsBackground; 