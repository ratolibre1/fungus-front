import React from 'react';
import IconBackground from './IconBackground';
import '../assets/styles/salesBackground.css';
import cashCoinSvg from '../assets/images/backgrounds/cash-coin.svg';

/**
 * Componente de fondo específico para la página de ventas
 * Utiliza el componente IconBackground con la configuración específica
 */
const SalesBackground: React.FC = () => {
  return (
    <IconBackground
      svgPath={cashCoinSvg}     // Usamos el icono de cash-coin para ventas (mismo que en Sidebar)
      baseColor="#fc9dff"       // Color rosa/magenta para la sección de ventas (igual que cotizaciones)
    />
  );
};

export default SalesBackground; 