import React from 'react';
import IconBackground from './IconBackground';
import '../assets/styles/suppliersBackground.css';
import truckSvg from '../assets/images/backgrounds/truck.svg';

/**
 * Componente de fondo específico para la página de proveedores
 * Utiliza el componente IconBackground con la configuración específica
 */
const SuppliersBackground: React.FC = () => {
  return (
    <IconBackground
      svgPath={truckSvg}        // Usamos el icono de camión para proveedores (mismo que en Sidebar)
      baseColor="#9bf6ff"       // Color naranja para la sección de proveedores
    />
  );
};

export default SuppliersBackground; 