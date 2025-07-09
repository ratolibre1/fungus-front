import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import PortalModal from './common/PortalModal';
import { cleanRut, formatRut, validateRut, cleanPhone, formatPhone } from '../utils/validators';
export default function ClientModal({ isOpen, modalType, selectedClient, loading, onClose, onSubmit }) {
    // Estado para errores de validación específicos
    const [validationErrors, setValidationErrors] = useState({
        rut: null,
        email: null,
        phone: null
    });
    // Formulario
    const [formData, setFormData] = useState({
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
        }
        else if ((modalType === 'edit' || modalType === 'view') && selectedClient) {
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
        if (modalType !== 'create' && modalType !== 'edit')
            return;
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
        }
        else if (phoneDigits === 0) {
            setValidationErrors(prev => ({
                ...prev,
                phone: 'El teléfono es obligatorio'
            }));
        }
        // Establecer validez del formulario - todos los campos son obligatorios
        setIsFormValid(hasName &&
            isRutValid &&
            isEmailValid &&
            hasValidPhone &&
            hasAddress);
    }, [formData, modalType]);
    // Manejar cambios en el RUT con formato
    const handleRutChange = (e) => {
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
    const handlePhoneChange = (e) => {
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
    const handleRutKeyDown = (e) => {
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
    const handlePhoneKeyDown = (e) => {
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
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Manejar submit del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(formData);
    };
    if (!isOpen)
        return null;
    return (_jsxs(PortalModal, { isOpen: isOpen, onClose: onClose, children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1050 }, onClick: onClose }), _jsx("div", { className: "modal fade show", style: {
                    display: 'block',
                    zIndex: 1055
                }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("h5", { className: "modal-title", children: [modalType === 'create' && 'Nuevo Comprador', modalType === 'edit' && 'Editar Comprador', modalType === 'delete' && '¿Eliminar Comprador?', modalType === 'view' && 'Detalles del Comprador'] }), _jsx("button", { type: "button", className: "btn-close", onClick: onClose })] }), _jsx("div", { className: "modal-body", children: modalType === 'create' || modalType === 'edit' ? (_jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Nombre ", _jsx("span", { style: { color: '#dc3545' }, children: "*" })] }), _jsx("input", { type: "text", className: "form-control", name: "name", value: formData.name, onChange: handleTextChange, required: true, placeholder: "Ej: Mar\u00EDa Gonz\u00E1lez" })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["RUT ", _jsx("span", { style: { color: '#dc3545' }, children: "*" })] }), _jsx("input", { type: "text", className: "form-control", name: "rut", value: formData.rut, onChange: handleRutChange, onKeyDown: handleRutKeyDown, required: true, placeholder: "Ej: 12.345.678-9" }), validationErrors.rut && (_jsx("small", { className: "text-danger", children: validationErrors.rut })), _jsx("small", { className: "form-text text-muted d-block", children: "Formato: 12.345.678-9" })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Email ", _jsx("span", { style: { color: '#dc3545' }, children: "*" })] }), _jsx("input", { type: "email", className: "form-control", name: "email", value: formData.email, onChange: handleTextChange, required: true, placeholder: "Ej: cliente@ejemplo.com" }), validationErrors.email && (_jsx("small", { className: "text-danger", children: validationErrors.email }))] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Tel\u00E9fono ", _jsx("span", { style: { color: '#dc3545' }, children: "*" })] }), _jsx("input", { type: "text", className: "form-control", name: "phone", value: formData.phone, onChange: handlePhoneChange, onKeyDown: handlePhoneKeyDown, required: true, placeholder: "Ej: 9 1234 5678" }), validationErrors.phone && (_jsx("small", { className: "text-danger", children: validationErrors.phone })), _jsx("small", { className: "form-text text-muted d-block", children: "Formato: 9 1234 5678" })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Direcci\u00F3n ", _jsx("span", { style: { color: '#dc3545' }, children: "*" })] }), _jsx("input", { type: "text", className: "form-control", name: "address", value: formData.address || '', onChange: handleTextChange, required: true, placeholder: "Ej: Av. Providencia 123, Santiago" })] })] })) : modalType === 'delete' ? (_jsxs("p", { children: ["\u00BFEst\u00E1s seguro de que deseas eliminar a ", _jsx("strong", { children: selectedClient?.name }), "?"] })) : (_jsxs("div", { children: [_jsxs("p", { children: [_jsx("strong", { children: "Nombre:" }), " ", selectedClient?.name] }), _jsxs("p", { children: [_jsx("strong", { children: "RUT:" }), " ", formatRut(selectedClient?.rut || '')] }), _jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", selectedClient?.email] }), _jsxs("p", { children: [_jsx("strong", { children: "Tel\u00E9fono:" }), " ", selectedClient?.phone ? formatPhone(selectedClient.phone) : 'No especificado'] }), _jsxs("p", { children: [_jsx("strong", { children: "Direcci\u00F3n:" }), " ", selectedClient?.address || 'No especificada'] }), _jsxs("p", { children: [_jsx("strong", { children: "Creado:" }), " ", selectedClient && new Date(selectedClient.createdAt).toLocaleDateString()] }), _jsxs("p", { children: [_jsx("strong", { children: "Actualizado:" }), " ", selectedClient && new Date(selectedClient.updatedAt).toLocaleDateString()] })] })) }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: onClose, children: modalType === 'view' ? 'Cerrar' : 'Cancelar' }), modalType !== 'view' && (_jsx("button", { type: "button", className: `btn ${modalType === 'delete' ? 'btn-danger' : ''}`, style: modalType !== 'delete' ? { backgroundColor: '#099347', color: 'white' } : {}, onClick: handleSubmit, disabled: loading || ((modalType === 'create' || modalType === 'edit') && !isFormValid), children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), "Procesando..."] })) : (modalType === 'create' ? 'Crear' :
                                            modalType === 'edit' ? 'Guardar cambios' :
                                                'Eliminar') }))] })] }) }) })] }));
}
