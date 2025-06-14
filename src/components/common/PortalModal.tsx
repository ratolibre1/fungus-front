import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalModalProps {
  isOpen: boolean;
  children: ReactNode;
  onClose?: () => void;
}

/**
 * Wrapper que renderiza cualquier modal directamente en el body usando React Portal
 * Esto asegura que los modales siempre estén por encima del sidebar y cubran toda la pantalla
 */
const PortalModal = ({ isOpen, children, onClose }: PortalModalProps) => {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Crear o obtener el contenedor de modales en el body
    let modalContainer = document.getElementById('modal-root');

    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'modal-root';
      document.body.appendChild(modalContainer);
    }

    setModalRoot(modalContainer);

    return () => {
      // No eliminar el contenedor al desmontar, puede ser usado por otros modales
    };
  }, []);

  useEffect(() => {
    // Manejar el scroll del body cuando se abre/cierra el modal
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    // Cerrar modal al presionar Escape
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Si el modal no está abierto o no hay contenedor, no renderizar nada
  if (!isOpen || !modalRoot) {
    return null;
  }

  // Renderizar el modal directamente en el portal (sin wrapper complicado)
  return createPortal(children, modalRoot);
};

export default PortalModal; 