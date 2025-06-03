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
      svgPath={bagSvg}                 // Usamos el icono de bag para compras
      baseColor="#4f7e84"          // Color rosa/magenta para la sección de compras (mismo que ventas)
    />
  );
};

export default PurchasesBackground; 