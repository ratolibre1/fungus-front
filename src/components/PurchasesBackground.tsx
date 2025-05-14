import React from 'react';
import IconBackground from './IconBackground';
import '../assets/styles/purchasesBackground.css';
import bagSvg from '../assets/images/backgrounds/bag.svg';

/**
 * Componente de fondo específico para la página de compras
 * Utiliza el componente IconBackground con la configuración específica
 */
const PurchasesBackground: React.FC = () => {
  return (
    <IconBackground
      svgPath={bagSvg}          // Usamos el icono de bolsa para compras (mismo que en Sidebar)
      baseColor="#caffbf"       // Color naranjo oscuro para la sección de compras
    />
  );
};

export default PurchasesBackground; 