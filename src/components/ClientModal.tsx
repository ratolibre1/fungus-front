import { useEffect, useState } from 'react';
import { Client, CreateClientRequest, UpdateClientRequest } from '../types/client';
import { cleanRut, formatRut, validateRut, cleanPhone, formatPhone } from '../utils/validators';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;

interface ClientModalProps {
  isOpen: boolean;
  modalType: ModalType;
  selectedClient: Client | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateClientRequest | UpdateClientRequest) => Promise<void>;
}

export default function ClientModal({
  isOpen,
  modalType,
  selectedClient,
  loading,
  onClose,
  onSubmit
}: ClientModalProps) {
  // Estado para errores de validación específicos
  const [validationErrors, setValidationErrors] = useState<{
    rut: string | null;
    email: string | null;
    phone: string | null;
  }>({
    rut: null,
    email: null,
    phone: null
  });

  // Formulario
  const [formData, setFormData] = useState<CreateClientRequest | UpdateClientRequest>({
    name: '',
    rut: '',
    email: '',
    phone: '',
    address: ''
  });

  // Estado para validación de formulario
  const [isFormValid, setIsFormValid] = useState(false);

  // Inicializar el formulario cuando cambia el cliente seleccionado o el tipo de modal
  useEffect(() => {
    setValidationErrors({
      rut: null,
      email: null,
      phone: null
    });

    if (modalType === 'create') {
      setFormData({
        name: '',
        rut: '',
        email: '',
        phone: '',
        address: ''
      });
    } else if ((modalType === 'edit' || modalType === 'view') && selectedClient) {
      setFormData({
        name: selectedClient.name,
        rut: selectedClient.rut,
        email: selectedClient.email,
        phone: selectedClient.phone,
        address: selectedClient.address || ''
      });
    }
  }, [modalType, selectedClient]);

  // Validar el formulario cuando cambia
  useEffect(() => {
    if (modalType !== 'create' && modalType !== 'edit') return;

    // Resetear errores de validación
    setValidationErrors({
      rut: null,
      email: null,
      phone: null
    });

    // Validaciones
    const hasName = Boolean(formData.name && formData.name.trim() !== '');
    const hasAddress = Boolean(formData.address && formData.address.trim() !== '');

    // Validación de RUT
    const isRutValid = formData.rut ? validateRut(formData.rut) : false;
    if (formData.rut && !isRutValid) {
      setValidationErrors(prev => ({
        ...prev,
        rut: 'El RUT ingresado no es válido'
      }));
    }

    // Validación básica de email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = formData.email ? emailPattern.test(formData.email) : false;
    if (formData.email && !isEmailValid) {
      setValidationErrors(prev => ({
        ...prev,
        email: 'El email ingresado no es válido'
      }));
    }

    // Validación básica de teléfono (debe contener al menos 8 dígitos Y no estar vacío)
    const phoneDigits = formData.phone ? cleanPhone(formData.phone).length : 0;
    const hasValidPhone = phoneDigits >= 8; // Ya no permitimos teléfono vacío
    if (phoneDigits > 0 && phoneDigits < 8) {
      setValidationErrors(prev => ({
        ...prev,
        phone: 'El teléfono debe tener al menos 8 dígitos'
      }));
    } else if (phoneDigits === 0) {
      setValidationErrors(prev => ({
        ...prev,
        phone: 'El teléfono es obligatorio'
      }));
    }

    // Establecer validez del formulario - todos los campos son obligatorios
    setIsFormValid(
      hasName &&
      isRutValid &&
      isEmailValid &&
      hasValidPhone &&
      hasAddress
    );
  }, [formData, modalType]);

  // Manejar cambios en el RUT con formato
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Solo permitir números y K
    const cleanedValue = cleanRut(value);

    // Formatear con puntos y guión si es válido
    const formattedValue = formatRut(cleanedValue);

    setFormData(prev => ({
      ...prev,
      rut: formattedValue
    }));
  };

  // Manejar cambios en el teléfono con formato manual
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const { value, selectionStart } = input;

    // Capturar la posición del cursor antes de cualquier cambio
    const cursorPosition = selectionStart || 0;

    // Permitir campo vacío
    if (!value) {
      setFormData(prev => ({
        ...prev,
        phone: ''
      }));
      return;
    }

    // Solo mantener dígitos para el análisis
    const digitsOnly = value.replace(/\D/g, '');
    const previousDigitsOnly = (formData.phone || '').replace(/\D/g, '');

    // Si no hay dígitos, permito borrar todo
    if (digitsOnly.length === 0) {
      setFormData(prev => ({
        ...prev,
        phone: ''
      }));
      return;
    }

    // Formatear manualmente sin usar la función de formato
    let formatted = '';

    // Primer grupo - primer dígito
    if (digitsOnly.length >= 1) {
      formatted = digitsOnly.substring(0, 1);
    }

    // Espacio después del primer dígito
    if (digitsOnly.length > 1) {
      formatted += ' ';
    }

    // Segundo grupo - siguientes 4 dígitos
    if (digitsOnly.length > 1) {
      const secondGroupLength = Math.min(4, digitsOnly.length - 1);
      formatted += digitsOnly.substring(1, 1 + secondGroupLength);
    }

    // Espacio después del segundo grupo
    if (digitsOnly.length > 5) {
      formatted += ' ';
    }

    // Tercer grupo - resto de dígitos
    if (digitsOnly.length > 5) {
      formatted += digitsOnly.substring(5);
    }

    // Calcular nueva posición del cursor
    // 1. ¿Agregamos un dígito? (longitud de dígitos aumentó)
    const isAddingDigit = digitsOnly.length > previousDigitsOnly.length;
    // 2. ¿En qué posición relativa a los espacios está el cursor?
    let newCursorPosition = cursorPosition;

    // Ajustar cursor considerando si estamos agregando dígitos
    if (isAddingDigit) {
      // Si estamos agregando un dígito, avanzamos el cursor
      // y consideramos los espacios que podrían haberse agregado

      // Si pasamos de 1 a 2 dígitos, se agrega espacio después del primer dígito
      if (previousDigitsOnly.length === 1 && digitsOnly.length === 2 && cursorPosition >= 1) {
        newCursorPosition += 1; // Sumar el espacio agregado
      }

      // Si pasamos de 5 a 6 dígitos, se agrega espacio después del quinto dígito
      if (previousDigitsOnly.length === 5 && digitsOnly.length === 6 && cursorPosition >= 6) {
        newCursorPosition += 1; // Sumar el espacio agregado
      }
    }

    // Asegurarnos que la nueva posición no esté fuera de los límites
    newCursorPosition = Math.min(formatted.length, Math.max(0, newCursorPosition));

    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));

    // Forzar el cursor a la posición calculada
    requestAnimationFrame(() => {
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };

  // Controlar teclas presionadas en el campo RUT
  const handleRutKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas de navegación y edición
    const navigationKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (navigationKeys.includes(e.key)) {
      return;
    }

    // Permitir números
    if (/[0-9]/.test(e.key)) {
      return;
    }

    // Permitir K/k
    if (e.key.toLowerCase() === 'k') {
      return;
    }

    // Bloquear cualquier otra tecla
    e.preventDefault();
  };

  // Manejar teclas para el teléfono directamente
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir siempre navegación y edición
    const navigationKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (navigationKeys.includes(e.key)) {
      return;
    }

    // Permitir solo números
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Manejar cambios en los campos de texto
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {modalType === 'create' && 'Nuevo Comprador'}
              {modalType === 'edit' && 'Editar Comprador'}
              {modalType === 'delete' && '¿Eliminar Comprador?'}
              {modalType === 'view' && 'Detalles del Comprador'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {modalType === 'create' || modalType === 'edit' ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nombre <span style={{ color: '#dc3545' }}>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleTextChange}
                    required
                    placeholder="Ej: María González"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">RUT <span style={{ color: '#dc3545' }}>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="rut"
                    value={formData.rut}
                    onChange={handleRutChange}
                    onKeyDown={handleRutKeyDown}
                    required
                    placeholder="Ej: 12.345.678-9"
                  />
                  {validationErrors.rut && (
                    <small className="text-danger">{validationErrors.rut}</small>
                  )}
                  <small className="form-text text-muted d-block">Formato: 12.345.678-9</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Email <span style={{ color: '#dc3545' }}>*</span></label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleTextChange}
                    required
                    placeholder="Ej: cliente@ejemplo.com"
                  />
                  {validationErrors.email && (
                    <small className="text-danger">{validationErrors.email}</small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Teléfono <span style={{ color: '#dc3545' }}>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyDown}
                    required
                    placeholder="Ej: 9 1234 5678"
                  />
                  {validationErrors.phone && (
                    <small className="text-danger">{validationErrors.phone}</small>
                  )}
                  <small className="form-text text-muted d-block">Formato: 9 1234 5678</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Dirección <span style={{ color: '#dc3545' }}>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleTextChange}
                    required
                    placeholder="Ej: Av. Providencia 123, Santiago"
                  />
                </div>
              </form>
            ) : modalType === 'delete' ? (
              <p>¿Estás seguro de que deseas eliminar a <strong>{selectedClient?.name}</strong>?</p>
            ) : (
              <div>
                <p><strong>Nombre:</strong> {selectedClient?.name}</p>
                <p><strong>RUT:</strong> {formatRut(selectedClient?.rut || '')}</p>
                <p><strong>Email:</strong> {selectedClient?.email}</p>
                <p><strong>Teléfono:</strong> {selectedClient?.phone ? formatPhone(selectedClient.phone) : 'No especificado'}</p>
                <p><strong>Dirección:</strong> {selectedClient?.address || 'No especificada'}</p>
                <p><strong>Creado:</strong> {selectedClient && new Date(selectedClient.createdAt).toLocaleDateString()}</p>
                <p><strong>Actualizado:</strong> {selectedClient && new Date(selectedClient.updatedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {modalType === 'view' ? 'Cerrar' : 'Cancelar'}
            </button>
            {modalType !== 'view' && (
              <button
                type="button"
                className={`btn ${modalType === 'delete' ? 'btn-danger' : ''}`}
                style={modalType !== 'delete' ? { backgroundColor: '#099347', color: 'white' } : {}}
                onClick={handleSubmit}
                disabled={loading || ((modalType === 'create' || modalType === 'edit') && !isFormValid)}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Procesando...
                  </>
                ) : (
                  modalType === 'create' ? 'Crear' :
                    modalType === 'edit' ? 'Guardar cambios' :
                      'Eliminar'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 