import React from 'react';
import IconBackground from './IconBackground';
import '../assets/styles/buyersBackground.css';
import peopleSvg from '../assets/images/backgrounds/people.svg';

/**
 * Componente de fondo específico para la página de compradores
 * Utiliza el componente IconBackground con la configuración específica
 */
const BuyersBackground: React.FC = () => {
  return (
    <IconBackground
      svgPath={peopleSvg}        // Usamos el icono de personas para compradores (mismo que en Sidebar)
      baseColor="#ffd6a5"        // Color morado para la sección de compradores
    />
  );
};

export default BuyersBackground; 