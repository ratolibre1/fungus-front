import React from 'react';
import '../assets/styles/salesBackground.css';
import IconBackground from './IconBackground';
import cashCoinSvg from '../assets/images/backgrounds/cash-coin.svg';

/**
 * Componente de fondo específico para la página de ventas
 * Utiliza el componente IconBackground con la configuración para ventas
 */
const SalesBackground: React.FC = () => {
  return (
    <IconBackground
      svgPath={cashCoinSvg}
      baseColor="#ffadad"  // Verde característico de la sección de ventas
    />
  );
};

export default SalesBackground; 