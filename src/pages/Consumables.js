import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SuppliesBackground from '../components/SuppliesBackground';
import { getConsumables, createConsumable, updateConsumable, deleteConsumable } from '../services/consumableService';
import { compareStringsSpanish } from '../utils/validators';
import PortalModal from '../components/common/PortalModal';
export default function Consumables() {
    // Estados
    const [consumables, setConsumables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedConsumable, setSelectedConsumable] = useState(null);
    const [modalType, setModalType] = useState(null);
    // Necesitamos permitir entrada parcial durante la edición
    const [inputValues, setInputValues] = useState({
        netPrice: '',
        stock: ''
    });
    // Agregar nuevos estados para ordenamiento
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    // Agregar estado para validación de formulario
    const [isFormValid, setIsFormValid] = useState(false);
    // Formulario
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        netPrice: 0,
        stock: null
    });
    // Cargar los consumibles
    const loadConsumables = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getConsumables({});
            setConsumables(response.data);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    // Cargar al montar el componente
    useEffect(() => {
        loadConsumables();
    }, []);
    // Validar el formulario cuando cambia
    useEffect(() => {
        // Para crear/editar insumo se necesita al menos nombre y precio
        const hasName = Boolean(formData.name && formData.name.trim() !== '');
        const hasPrice = typeof formData.netPrice === 'number' && formData.netPrice > 0;
        // Establecer la validez del formulario según los requisitos
        setIsFormValid((modalType === 'create' || modalType === 'edit') && hasName && hasPrice);
    }, [formData, modalType]);
    // Abrir modal
    const openModal = (type, consumable = null) => {
        setModalType(type);
        setSelectedConsumable(consumable);
        // Reiniciar la validación del formulario
        setIsFormValid(type === 'delete');
        if (type === 'create') {
            setFormData({
                name: '',
                description: '',
                netPrice: 0,
                stock: null
            });
            // Inicializar los campos de entrada vacíos
            setInputValues({
                netPrice: '',
                stock: ''
            });
        }
        else if (type === 'edit' && consumable) {
            // Asegurarse de tener un insumo válido con todas sus propiedades
            console.log('openModal edit - insumo seleccionado:', consumable);
            // Limpiar primero los valores para evitar mezclas
            setInputValues({
                netPrice: '',
                stock: ''
            });
            // Crear una copia nueva del objeto formData para evitar referencias
            const newFormData = {
                name: consumable.name || '',
                description: consumable.description || '',
                netPrice: typeof consumable.netPrice === 'number' ? consumable.netPrice : 0,
                stock: typeof consumable.stock === 'number' ? consumable.stock : null
            };
            console.log('openModal edit - formData inicializado:', newFormData);
            setFormData(newFormData);
            // Formatear y establecer los valores de input DESPUÉS de setFormData
            // para asegurar que se use el valor más reciente
            setTimeout(() => {
                const formattedValues = {
                    netPrice: formatInputNumber(newFormData.netPrice),
                    stock: formatInputNumber(newFormData.stock)
                };
                console.log('openModal edit - inputValues formateados:', formattedValues);
                setInputValues(formattedValues);
            }, 0);
            // Validar el formulario para edición
            const hasName = Boolean(consumable.name && consumable.name.trim() !== '');
            const hasPrice = typeof consumable.netPrice === 'number' && consumable.netPrice > 0;
            setIsFormValid(hasName && hasPrice);
        }
    };
    // Cerrar modal
    const closeModal = () => {
        setModalType(null);
        setSelectedConsumable(null);
    };
    // Manejar cambios en los campos de texto
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Manejar cambios en el formulario para campos numéricos
    const handleNumericChange = (e) => {
        const { name, value } = e.target;
        // Guardar el valor exactamente como se escribió
        setInputValues(prev => ({
            ...prev,
            [name]: value
        }));
        // Sólo intentar convertir a número si tiene un formato válido
        // Esto permite valores parciales como "1234," durante la edición
        if (value === '' || value === '-' || value === ',' || value === '.' || value.endsWith(',') || value.endsWith('.')) {
            // Para valores parciales/vacíos, guardar valores diferentes dependiendo del campo
            setFormData(prev => ({
                ...prev,
                [name]: name === 'stock' && value === '' ? null : 0
            }));
        }
        else {
            // Para valores completos que se pueden convertir a número
            const numericValue = value.replace(',', '.');
            const parsedValue = Number(numericValue);
            if (!isNaN(parsedValue)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: parsedValue
                }));
            }
        }
    };
    // Validar input numérico para rechazar 'e' y múltiples comas
    const handleNumericKeyDown = (e) => {
        // Permitir teclas de navegación y edición
        const navigationKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (navigationKeys.includes(e.key)) {
            return;
        }
        // Permitir números
        if (/[0-9]/.test(e.key)) {
            return;
        }
        // Permitir guión solo al principio y si no hay ya uno
        if (e.key === '-') {
            if (e.currentTarget.selectionStart === 0 && !e.currentTarget.value.includes('-')) {
                return;
            }
            e.preventDefault();
            return;
        }
        // Manejar punto y coma como decimales
        if (e.key === '.' || e.key === ',') {
            // Si ya hay un punto o una coma, no permitir otro
            if (e.currentTarget.value.includes('.') || e.currentTarget.value.includes(',')) {
                e.preventDefault();
                return;
            }
            return;
        }
        // Bloquear cualquier otra tecla
        e.preventDefault();
    };
    // Formatear número para mostrar en el input
    const formatInputNumber = (value) => {
        // Depuración
        console.log(`formatInputNumber recibido: valor=${value}, tipo=${typeof value}`);
        // Si value no es un número o es undefined/null, retornar vacío
        if (value === null || value === undefined || isNaN(Number(value))) {
            console.log('formatInputNumber: valor inválido, retornando vacío');
            return '';
        }
        // Solo retornar vacío si es exactamente cero, no para valores "falsy"
        if (value === 0) {
            console.log('formatInputNumber: valor es cero, retornando vacío');
            return '';
        }
        // Convertir a string con coma decimal
        const formattedValue = value.toString().replace('.', ',');
        console.log(`formatInputNumber: valor formateado=${formattedValue}`);
        return formattedValue;
    };
    // Manejar submit del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (modalType === 'create') {
                await createConsumable(formData);
            }
            else if (modalType === 'edit' && selectedConsumable) {
                await updateConsumable(selectedConsumable._id, formData);
            }
            else if (modalType === 'delete' && selectedConsumable) {
                await deleteConsumable(selectedConsumable._id);
            }
            loadConsumables();
            closeModal();
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    // Formatear precio para mostrar en la UI con decimales cuando existan
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            // El número de decimales será entre 0 y 2, dependiendo si tiene decimales
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    };
    // Función para manejar ordenamiento
    const handleSort = (field) => {
        if (sortField === field) {
            // Si ya estamos ordenando por este campo, cambiar dirección
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
            // Si es un nuevo campo, ordenar ascendente
            setSortField(field);
            setSortDirection('asc');
        }
    };
    // Función para obtener datos ordenados
    const getSortedConsumables = () => {
        return [...consumables].sort((a, b) => {
            const aValue = a[sortField] ?? '';
            const bValue = b[sortField] ?? '';
            // Si los valores son strings, usamos el ordenamiento español
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? compareStringsSpanish(aValue, bValue)
                    : compareStringsSpanish(bValue, aValue);
            }
            // Para valores que no son strings, usamos el ordenamiento estándar
            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };
    return (_jsx(Layout, { children: _jsxs("div", { className: "supplies-page-container", children: [_jsx(SuppliesBackground, {}), _jsxs("div", { className: "d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom", children: [_jsx("h1", { className: "h2 font-heading", style: { color: '#099347' }, children: "Insumos" }), _jsxs("button", { className: "btn", style: { backgroundColor: '#099347', color: 'white' }, onClick: () => openModal('create'), children: [_jsx("i", { className: "bi bi-plus-circle me-1" }), " Nuevo Insumo"] })] }), error && (_jsx("div", { className: "alert text-white", style: { backgroundColor: '#dc3545' }, role: "alert", children: error })), loading && !error ? (_jsx("div", { className: "d-flex justify-content-center my-5", children: _jsx("div", { className: "spinner-border", style: { color: '#099347' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "Cargando..." }) }) })) : (_jsx(_Fragment, { children: consumables.length === 0 ? (_jsx("div", { className: "alert alert-info", role: "alert", children: "No hay insumos disponibles." })) : (_jsx("div", { className: "card shadow-sm", children: _jsx("div", { className: "card-body", children: _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover table-striped", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsxs("th", { onClick: () => handleSort('name'), style: { cursor: 'pointer' }, children: ["Nombre", _jsx("i", { className: `bi ms-1 ${sortField === 'name'
                                                                    ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                                                                    : 'bi-arrow-down-square'}` })] }), _jsxs("th", { onClick: () => handleSort('description'), style: { cursor: 'pointer' }, children: ["Descripci\u00F3n", _jsx("i", { className: `bi ms-1 ${sortField === 'description'
                                                                    ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                                                                    : 'bi-arrow-down-square'}` })] }), _jsxs("th", { className: "text-end", onClick: () => handleSort('netPrice'), style: { cursor: 'pointer' }, children: ["Precio", _jsx("i", { className: `bi ms-1 ${sortField === 'netPrice'
                                                                    ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                                                                    : 'bi-arrow-down-square'}` })] }), _jsxs("th", { className: "text-center", onClick: () => handleSort('stock'), style: { cursor: 'pointer' }, children: ["Stock", _jsx("i", { className: `bi ms-1 ${sortField === 'stock'
                                                                    ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                                                                    : 'bi-arrow-down-square'}` })] }), _jsx("th", { className: "text-center", children: "Acciones" })] }) }), _jsx("tbody", { children: getSortedConsumables().map(consumable => (_jsxs("tr", { children: [_jsx("td", { children: consumable.name }), _jsx("td", { children: consumable.description }), _jsx("td", { className: "text-end", children: formatPrice(consumable.netPrice) }), _jsx("td", { className: "text-center", children: _jsx("span", { className: `badge ${consumable.stock === 0 ? 'bg-danger' : (consumable.stock ? 'bg-success' : 'bg-secondary')}`, children: consumable.stock !== null ? consumable.stock : '' }) }), _jsx("td", { className: "text-center", children: _jsxs("div", { className: "btn-group", children: [_jsx("button", { className: "btn btn-sm btn-outline-primary", onClick: () => openModal('edit', consumable), title: "Editar", children: _jsx("i", { className: "bi bi-pencil" }) }), _jsx("button", { className: "btn btn-sm btn-outline-danger", onClick: () => openModal('delete', consumable), title: "Eliminar", children: _jsx("i", { className: "bi bi-trash" }) })] }) })] }, consumable._id))) })] }) }) }) })) })), modalType && (_jsxs(PortalModal, { isOpen: true, onClose: closeModal, children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1050 }, onClick: closeModal }), _jsx("div", { className: "modal fade show", style: {
                                display: 'block',
                                zIndex: 1055
                            }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("h5", { className: "modal-title", children: [modalType === 'create' && 'Nuevo Insumo', modalType === 'edit' && 'Editar Insumo', modalType === 'delete' && '¿Eliminar Insumo?', modalType === 'view' && 'Detalles del Insumo'] }), _jsx("button", { type: "button", className: "btn-close", onClick: closeModal })] }), _jsx("div", { className: "modal-body", children: modalType === 'create' || modalType === 'edit' ? (_jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Nombre ", _jsx("span", { style: { color: '#dc3545' }, children: "*" })] }), _jsx("input", { type: "text", className: "form-control", name: "name", value: formData.name, onChange: handleTextChange, required: true, placeholder: "Ej: Filtros de jeringa" })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Descripci\u00F3n" }), _jsx("textarea", { className: "form-control", name: "description", value: formData.description, onChange: handleTextChange, placeholder: "Ej: Filtros est\u00E9riles de 0.22 micras", rows: 3 })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Precio neto ", _jsx("span", { style: { color: '#dc3545' }, children: "*" })] }), _jsx("input", { type: "text", className: "form-control", name: "netPrice", value: inputValues.netPrice, onChange: handleNumericChange, onKeyDown: handleNumericKeyDown, required: true, placeholder: "Ej: 2500" })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Stock" }), _jsx("input", { type: "text", className: "form-control", name: "stock", value: inputValues.stock, onChange: handleNumericChange, onKeyDown: handleNumericKeyDown, placeholder: "Ej: 30" })] })] })) : modalType === 'delete' ? (_jsxs("p", { children: ["\u00BFEst\u00E1s seguro de que deseas eliminar ", _jsx("strong", { children: selectedConsumable?.name }), "?"] })) : (_jsxs("div", { children: [_jsxs("p", { children: [_jsx("strong", { children: "Nombre:" }), " ", selectedConsumable?.name] }), _jsxs("p", { children: [_jsx("strong", { children: "Descripci\u00F3n:" }), " ", selectedConsumable?.description || 'Sin descripción'] }), _jsxs("p", { children: [_jsx("strong", { children: "Precio:" }), " ", selectedConsumable && formatPrice(selectedConsumable.netPrice)] }), _jsxs("p", { children: [_jsx("strong", { children: "Stock:" }), " ", selectedConsumable && selectedConsumable.stock !== null ? `${selectedConsumable.stock} unidades` : 'No especificado'] }), _jsxs("p", { children: [_jsx("strong", { children: "Tipo:" }), " ", selectedConsumable?.itemType || 'No especificado'] }), _jsxs("p", { children: [_jsx("strong", { children: "Creado:" }), " ", selectedConsumable && new Date(selectedConsumable.createdAt).toLocaleDateString()] }), _jsxs("p", { children: [_jsx("strong", { children: "Actualizado:" }), " ", selectedConsumable && new Date(selectedConsumable.updatedAt).toLocaleDateString()] })] })) }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: closeModal, children: modalType === 'view' ? 'Cerrar' : 'Cancelar' }), modalType !== 'view' && (_jsx("button", { type: "button", className: `btn ${modalType === 'delete' ? 'btn-danger' : ''}`, style: modalType !== 'delete' ? { backgroundColor: '#099347', color: 'white' } : {}, onClick: handleSubmit, disabled: loading || ((modalType === 'create' || modalType === 'edit') && !isFormValid), children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), "Procesando..."] })) : (modalType === 'create' ? 'Crear' :
                                                        modalType === 'edit' ? 'Guardar cambios' :
                                                            'Eliminar') }))] })] }) }) })] }))] }) }));
}
