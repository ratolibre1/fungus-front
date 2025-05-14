import React from 'react';
import IconBackground from './IconBackground';
import '../assets/styles/quotationsBackground.css';
import fileEarmarkTextSvg from '../assets/images/backgrounds/file-earmark-text.svg';

/**
 * Componente de fondo específico para la página de cotizaciones
 * Utiliza el componente IconBackground con la configuración específica
 */
const QuotationsBackground: React.FC = () => {
  return (
    <IconBackground
      svgPath={fileEarmarkTextSvg}  // Usamos el icono de archivo para cotizaciones (mismo que en Sidebar)
      baseColor="#bdb2ff"           // Color azul para la sección de cotizaciones
    />
  );
};

export default QuotationsBackground; 