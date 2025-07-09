import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PortalModal from '../common/PortalModal';
import { getSuppliers, createSupplier } from '../../services/supplierService';
import { getClients } from '../../services/clientService';
import { addSupplierRole } from '../../services/roleService';
import { getConsumables, createConsumable } from '../../services/consumableService';
import { previewPurchase } from '../../services/purchaseService';
import { compareStringsSpanish, formatCurrencyNoDecimals } from '../../utils/validators';
import SupplierModal from '../SupplierModal';
const SupplierSearchSelector = ({ suppliers, clients, value, onChange, onSupplierCreated, disabled, error }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [addingRole, setAddingRole] = useState(false);
    // Estados para SupplierModal
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [supplierModalLoading, setSupplierModalLoading] = useState(false);
    const filteredSuppliers = suppliers.filter(supplier => supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.rut.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => compareStringsSpanish(a.name, b.name));
    // Buscar en clientes que coincidan con el término de búsqueda
    const potentialClients = clients.filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.rut.toLowerCase().includes(searchTerm.toLowerCase())).filter(client => 
    // Excluir si ya existe como proveedor
    !suppliers.some(supplier => supplier.rut === client.rut));
    const selectedSupplier = suppliers.find(s => s._id === value);
    const handleSelect = (supplierId) => {
        onChange(supplierId);
        setIsOpen(false);
        setSearchTerm('');
    };
    const handleClear = () => {
        onChange('');
        setSearchTerm('');
        setIsOpen(false);
    };
    // Abrir SupplierModal para crear nuevo proveedor
    const handleCreateNewSupplier = () => {
        setIsOpen(false);
        setShowSupplierModal(true);
    };
    // Manejar creación desde SupplierModal
    const handleSupplierModalSubmit = async (formData) => {
        setSupplierModalLoading(true);
        try {
            // En modo create, formData será siempre CreateSupplierRequest
            const response = await createSupplier(formData);
            if (response.success) {
                onChange(response.data._id);
                setShowSupplierModal(false);
                setSearchTerm('');
                if (onSupplierCreated) {
                    onSupplierCreated(response.data);
                }
            }
        }
        catch (error) {
            console.error('Error creando proveedor:', error);
        }
        finally {
            setSupplierModalLoading(false);
        }
    };
    // Agregar rol de proveedor a un cliente existente usando addSupplierRole
    const handleAddSupplierRole = async (client) => {
        setAddingRole(true);
        try {
            const response = await addSupplierRole(client._id);
            if (response.success) {
                // Crear el objeto proveedor basado en el cliente para agregarlo localmente
                const newSupplier = {
                    _id: client._id, // Usar el mismo ID del cliente
                    name: client.name,
                    rut: client.rut,
                    email: client.email,
                    phone: client.phone,
                    address: client.address || '',
                    isCustomer: true,
                    needsReview: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                onChange(client._id);
                setIsOpen(false);
                setSearchTerm('');
                if (onSupplierCreated) {
                    onSupplierCreated(newSupplier);
                }
            }
        }
        catch (error) {
            console.error('Error agregando rol de proveedor:', error);
        }
        finally {
            setAddingRole(false);
        }
    };
    const formatSupplierDisplay = (supplier) => {
        return `${supplier.name} - ${supplier.rut}`;
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "position-relative", children: [_jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", className: `form-control ${error ? 'is-invalid' : ''}`, placeholder: "Buscar proveedor por nombre o RUT...", value: selectedSupplier ? formatSupplierDisplay(selectedSupplier) : searchTerm, onChange: (e) => {
                                    setSearchTerm(e.target.value);
                                    setIsOpen(true);
                                }, onFocus: () => setIsOpen(true), disabled: disabled }), value && (_jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: handleClear, disabled: disabled, title: "Limpiar selecci\u00F3n", children: _jsx("i", { className: "bi bi-x" }) })), _jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: () => setIsOpen(!isOpen), disabled: disabled, children: _jsx("i", { className: `bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}` }) })] }), isOpen && (_jsx("div", { className: "position-fixed mt-1 bg-white", style: {
                            zIndex: 1070,
                            minWidth: '300px',
                            maxWidth: '500px',
                            left: 'auto',
                            right: 'auto'
                        }, children: _jsxs("div", { className: "card shadow-lg", children: [_jsx("div", { className: "card-header bg-success text-white p-2", children: _jsxs("div", { className: "input-group input-group-sm", children: [_jsx("input", { type: "text", className: "form-control", placeholder: "Buscar proveedores por nombre o RUT...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), autoFocus: true }), _jsx("span", { className: "input-group-text", children: _jsx("i", { className: "bi bi-search" }) })] }) }), _jsxs("div", { className: "list-group list-group-flush", style: { maxHeight: '300px', overflowY: 'auto' }, children: [filteredSuppliers.map(supplier => (_jsx("button", { type: "button", className: `list-group-item list-group-item-action ${value === supplier._id ? 'active' : ''}`, onClick: () => handleSelect(supplier._id), children: _jsx("div", { className: "d-flex justify-content-between align-items-center", children: _jsxs("span", { children: [_jsx("strong", { children: supplier.name }), " - ", _jsx("small", { className: "text-muted", children: supplier.rut })] }) }) }, supplier._id))), searchTerm && potentialClients.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "list-group-item bg-light text-muted small", children: [_jsx("i", { className: "bi bi-info-circle me-1" }), "Contactos existentes como clientes:"] }), potentialClients.map(client => (_jsx("div", { className: "list-group-item bg-light", children: _jsxs("div", { className: "d-flex justify-content-between align-items-center", children: [_jsxs("div", { children: [_jsx("strong", { children: client.name }), " - ", _jsx("small", { className: "text-muted", children: client.rut }), _jsx("br", {}), _jsxs("small", { className: "text-muted", children: [_jsx("i", { className: "bi bi-people me-1" }), "Existe como cliente"] })] }), _jsxs("button", { className: "btn btn-outline-success btn-sm", onClick: () => handleAddSupplierRole(client), disabled: addingRole, children: [addingRole ? (_jsx("span", { className: "spinner-border spinner-border-sm me-1", role: "status", "aria-hidden": "true" })) : (_jsx("i", { className: "bi bi-arrow-up-right-circle me-1" })), "Agregar como proveedor"] })] }) }, `client-${client._id}`)))] })), filteredSuppliers.length === 0 && potentialClients.length === 0 && searchTerm && (_jsxs("div", { className: "list-group-item text-center py-3", children: [_jsx("i", { className: "bi bi-search me-2 text-muted" }), _jsx("div", { className: "text-muted mb-2", children: "No se encontraron proveedores" }), _jsxs("button", { className: "btn btn-success btn-sm", onClick: handleCreateNewSupplier, children: [_jsx("i", { className: "bi bi-plus-circle me-1" }), "Crear nuevo proveedor"] })] })), !searchTerm && filteredSuppliers.length === 0 && (_jsxs("div", { className: "list-group-item text-center text-muted py-3", children: [_jsx("i", { className: "bi bi-search me-2" }), "Escribe para buscar proveedores"] }))] })] }) })), isOpen && (_jsx("div", { className: "position-fixed top-0 start-0 w-100 h-100", style: { zIndex: 1069 }, onClick: () => setIsOpen(false) })), error && _jsx("div", { className: "invalid-feedback", children: error })] }), _jsx(SupplierModal, { isOpen: showSupplierModal, modalType: "create", selectedSupplier: null, loading: supplierModalLoading, onClose: () => setShowSupplierModal(false), onSubmit: handleSupplierModalSubmit })] }));
};
const ConsumableSearchSelector = ({ consumables, value, onChange, onConsumableCreated, onConsumableSelected, onClear, disabled, error }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    // Estados para modal de crear insumo
    const [showConsumableModal, setShowConsumableModal] = useState(false);
    const [creatingConsumable, setCreatingConsumable] = useState(false);
    const [consumableFormData, setConsumableFormData] = useState({
        name: '',
        description: '',
        netPrice: 0,
        stock: null
    });
    const filteredConsumables = consumables.filter(consumable => consumable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumable.description.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => compareStringsSpanish(a.name, b.name));
    const selectedConsumable = consumables.find(c => c._id === value);
    const handleSelect = (consumableId) => {
        const consumable = consumables.find(c => c._id === consumableId);
        onChange(consumableId);
        if (consumable && onConsumableSelected) {
            onConsumableSelected(consumableId, consumable);
        }
        setIsOpen(false);
        setSearchTerm('');
    };
    const handleClear = () => {
        onChange('');
        if (onClear) {
            onClear();
        }
        setSearchTerm('');
        setIsOpen(false);
    };
    const handleCreateNewConsumable = () => {
        setConsumableFormData({
            name: searchTerm,
            description: '',
            netPrice: 0,
            stock: null
        });
        setIsOpen(false);
        setShowConsumableModal(true);
    };
    const handleCreateConsumable = async () => {
        if (!consumableFormData.name || !consumableFormData.netPrice)
            return;
        setCreatingConsumable(true);
        try {
            const response = await createConsumable(consumableFormData);
            if (response.success) {
                // Primero agregar a la lista
                if (onConsumableCreated) {
                    onConsumableCreated(response.data);
                }
                // Luego seleccionarlo automáticamente
                onChange(response.data._id);
                if (onConsumableSelected) {
                    onConsumableSelected(response.data._id, response.data);
                }
                setShowConsumableModal(false);
                setSearchTerm('');
            }
        }
        catch (error) {
            console.error('Error creando insumo:', error);
        }
        finally {
            setCreatingConsumable(false);
        }
    };
    const handleConsumableFormChange = (field, value) => {
        setConsumableFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const formatConsumableDisplay = (consumable) => {
        return `${consumable.name} - ${consumable.description}`;
    };
    const formatConsumableDisplayJSX = (consumable) => {
        return (_jsxs("div", { children: [_jsx("strong", { children: consumable.name }), _jsx("br", {}), _jsx("small", { className: "text-muted", children: consumable.description })] }));
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "position-relative", children: [_jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", className: `form-control ${error ? 'is-invalid' : ''}`, placeholder: "Buscar insumo...", value: selectedConsumable ? formatConsumableDisplay(selectedConsumable) : searchTerm, onChange: (e) => {
                                    setSearchTerm(e.target.value);
                                    setIsOpen(true);
                                }, onFocus: () => setIsOpen(true), disabled: disabled }), value && (_jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: handleClear, disabled: disabled, title: "Limpiar selecci\u00F3n", children: _jsx("i", { className: "bi bi-x" }) })), _jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: () => setIsOpen(!isOpen), disabled: disabled, children: _jsx("i", { className: `bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}` }) })] }), isOpen && (_jsx("div", { className: "position-fixed mt-1 bg-white", style: {
                            zIndex: 1070,
                            minWidth: '400px',
                            maxWidth: '600px',
                            left: 'auto',
                            right: 'auto'
                        }, children: _jsxs("div", { className: "card shadow-lg", children: [_jsx("div", { className: "card-header bg-success text-white p-2", children: _jsxs("div", { className: "input-group input-group-sm", children: [_jsx("input", { type: "text", className: "form-control", placeholder: "Buscar insumos por nombre o descripci\u00F3n...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), autoFocus: true }), _jsx("span", { className: "input-group-text", children: _jsx("i", { className: "bi bi-search" }) })] }) }), _jsx("div", { className: "list-group list-group-flush", style: { maxHeight: '200px', overflowY: 'auto' }, children: filteredConsumables.length === 0 ? (_jsxs("div", { className: "list-group-item text-center py-3", children: [_jsxs("div", { className: "text-muted mb-3", children: [_jsx("i", { className: "bi bi-search me-2" }), "No se encontraron insumos"] }), searchTerm && (_jsxs("button", { type: "button", className: "btn btn-success btn-sm", onClick: handleCreateNewConsumable, disabled: disabled, children: [_jsx("i", { className: "bi bi-plus-circle me-2" }), "Crear nuevo insumo"] }))] })) : (filteredConsumables.map(consumable => (_jsx("button", { type: "button", className: `list-group-item list-group-item-action ${value === consumable._id ? 'active' : ''}`, onClick: () => handleSelect(consumable._id), children: _jsxs("div", { className: "d-flex justify-content-between align-items-center", children: [_jsx("div", { children: formatConsumableDisplayJSX(consumable) }), _jsxs("small", { className: "text-muted", children: ["$", consumable.netPrice] })] }) }, consumable._id)))) })] }) })), isOpen && (_jsx("div", { className: "position-fixed top-0 start-0 w-100 h-100", style: { zIndex: 1069 }, onClick: () => setIsOpen(false) })), error && _jsx("div", { className: "invalid-feedback", children: error })] }), showConsumableModal && (_jsxs(PortalModal, { isOpen: true, onClose: () => setShowConsumableModal(false), children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1080 }, onClick: () => setShowConsumableModal(false) }), _jsx("div", { className: "modal fade show", style: {
                            display: 'block',
                            zIndex: 1085
                        }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h5", { className: "modal-title", children: "Nuevo Insumo" }), _jsx("button", { type: "button", className: "btn-close", onClick: () => setShowConsumableModal(false), disabled: creatingConsumable })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Nombre ", _jsx("span", { style: { color: '#dc3545' }, children: "*" })] }), _jsx("input", { type: "text", className: "form-control", value: consumableFormData.name, onChange: (e) => handleConsumableFormChange('name', e.target.value), placeholder: "Ej: Filtros de jeringa" })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Descripci\u00F3n" }), _jsx("textarea", { className: "form-control", value: consumableFormData.description, onChange: (e) => handleConsumableFormChange('description', e.target.value), placeholder: "Ej: Filtros est\u00E9riles de 0.22 micras", rows: 3 })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Precio neto ", _jsx("span", { style: { color: '#dc3545' }, children: "*" })] }), _jsx("input", { type: "number", className: "form-control", value: consumableFormData.netPrice, onChange: (e) => handleConsumableFormChange('netPrice', Number(e.target.value)), placeholder: "Ej: 2500", min: "0" })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Stock" }), _jsx("input", { type: "number", className: "form-control", value: consumableFormData.stock || '', onChange: (e) => handleConsumableFormChange('stock', e.target.value ? Number(e.target.value) : null), placeholder: "Ej: 30", min: "0" })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowConsumableModal(false), disabled: creatingConsumable, children: "Cancelar" }), _jsx("button", { type: "button", className: "btn btn-success", onClick: handleCreateConsumable, disabled: creatingConsumable || !consumableFormData.name || !consumableFormData.netPrice, children: creatingConsumable ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), "Creando..."] })) : (_jsxs(_Fragment, { children: [_jsx("i", { className: "bi bi-check-circle me-2" }), "Crear insumo"] })) })] })] }) }) })] }))] }));
};
export default function PurchaseFormModal({ purchase, isOpen, onClose, onSubmit, loading = false }) {
    // Estados para datos maestros
    const [suppliers, setSuppliers] = useState([]);
    const [clients, setClients] = useState([]);
    const [consumables, setConsumables] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    // Estados del formulario
    const [formData, setFormData] = useState({
        counterparty: '',
        documentType: 'factura',
        date: new Date().toISOString().split('T')[0],
        items: [],
        taxRate: 0.19,
        observations: ''
    });
    // Estados para UI
    const [errors, setErrors] = useState({});
    // Estados para preview y cálculos en tiempo real
    const [previewData, setPreviewData] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    // Estados para manejar inputs numéricos con comas decimales
    const [inputValues, setInputValues] = useState({});
    // Cargar datos iniciales
    const loadInitialData = async () => {
        setLoadingData(true);
        try {
            const [suppliersResponse, clientsResponse, consumablesResponse] = await Promise.all([
                getSuppliers(),
                getClients(),
                getConsumables()
            ]);
            setSuppliers(suppliersResponse.data);
            setClients(clientsResponse.data);
            setConsumables(consumablesResponse.data);
        }
        catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
        finally {
            setLoadingData(false);
        }
    };
    // Poblar formulario cuando se está editando
    const populateFormData = (purchase) => {
        const items = purchase.items.map(item => ({
            item: typeof item.itemDetail === 'object' ? item.itemDetail._id : item.itemDetail,
            itemName: typeof item.itemDetail === 'object' ? item.itemDetail.name : 'Item no encontrado',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            subtotal: item.subtotal
        }));
        setFormData({
            counterparty: typeof purchase.counterparty === 'object' ? purchase.counterparty._id : purchase.counterparty,
            documentType: purchase.documentType,
            date: purchase.date.split('T')[0],
            items,
            taxRate: purchase.taxRate,
            observations: purchase.observations || ''
        });
    };
    // Función para calcular preview en tiempo real
    const calculatePreview = async () => {
        if (formData.items.length === 0 || !formData.documentType) {
            // Si no hay items, limpiar totales
            setPreviewData({
                netAmount: 0,
                taxAmount: 0,
                totalAmount: 0
            });
            return;
        }
        const validItems = formData.items.filter(item => item.item && item.quantity > 0);
        if (validItems.length === 0) {
            // Si no hay items válidos, limpiar totales
            setPreviewData({
                netAmount: 0,
                taxAmount: 0,
                totalAmount: 0
            });
            return;
        }
        setLoadingPreview(true);
        try {
            const previewRequest = {
                documentType: formData.documentType,
                items: validItems.map(item => ({
                    item: item.item,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount > 0 ? item.discount : undefined
                })),
                taxRate: formData.taxRate
            };
            const response = await previewPurchase(previewRequest);
            setPreviewData({
                netAmount: response.data.netAmount,
                taxAmount: response.data.taxAmount,
                totalAmount: response.data.totalAmount
            });
        }
        catch (error) {
            console.error('Error calculando preview:', error);
            setPreviewData(null);
        }
        finally {
            setLoadingPreview(false);
        }
    };
    // Efectos
    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);
    useEffect(() => {
        if (purchase && isOpen) {
            populateFormData(purchase);
        }
        else if (isOpen) {
            // Resetear formulario para nueva compra
            setFormData({
                counterparty: '',
                documentType: 'factura',
                date: new Date().toISOString().split('T')[0],
                items: [],
                taxRate: 0.19,
                observations: ''
            });
            setErrors({});
            setPreviewData(null);
        }
    }, [purchase, isOpen]);
    // Calcular preview cuando cambian items o tipo de documento
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            calculatePreview();
        }, 500); // Debounce de 500ms
        return () => clearTimeout(timeoutId);
    }, [formData.items, formData.documentType, formData.taxRate]);
    // Manejar agregar item
    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    item: '',
                    itemName: '',
                    quantity: 1,
                    unitPrice: 0,
                    discount: 0,
                    subtotal: 0
                }
            ]
        }));
    };
    // Manejar eliminar item
    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
        // Limpiar los inputValues para ese índice y reorganizar los demás
        setInputValues(prev => {
            const newInputValues = { ...prev };
            // Eliminar los valores del índice actual
            delete newInputValues[`quantity_${index}`];
            delete newInputValues[`unitPrice_${index}`];
            delete newInputValues[`discount_${index}`];
            // Reorganizar los índices superiores (moverlos hacia abajo)
            Object.keys(newInputValues).forEach(key => {
                const match = key.match(/^(quantity|unitPrice|discount)_(\d+)$/);
                if (match) {
                    const field = match[1];
                    const currentIndex = parseInt(match[2]);
                    if (currentIndex > index) {
                        const newKey = `${field}_${currentIndex - 1}`;
                        newInputValues[newKey] = newInputValues[key];
                        delete newInputValues[key];
                    }
                }
            });
            return newInputValues;
        });
    };
    // Manejar actualización de item
    const updateItem = (index, field, value, consumableData) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            // Si se cambia el item, buscar su nombre y precio
            if (field === 'item') {
                if (value) {
                    // Si se selecciona un insumo
                    // Usar consumableData si se proporciona, sino buscar en la lista
                    const selectedConsumable = consumableData || consumables.find(c => c._id === value);
                    if (selectedConsumable) {
                        newItems[index].itemName = selectedConsumable.name;
                        newItems[index].unitPrice = selectedConsumable.netPrice || 0;
                        // Si no hay cantidad, poner 1 por defecto
                        if (!newItems[index].quantity || newItems[index].quantity === 0) {
                            newItems[index].quantity = 1;
                        }
                    }
                }
                else {
                    // Si se limpia el insumo, limpiar todos los valores
                    newItems[index].itemName = '';
                    newItems[index].unitPrice = 0;
                    newItems[index].quantity = 0;
                    newItems[index].discount = 0;
                    newItems[index].subtotal = 0;
                }
            }
            // Recalcular subtotal siempre que cambie item, quantity, unitPrice o discount
            if (['item', 'quantity', 'unitPrice', 'discount'].includes(field)) {
                const item = newItems[index];
                const subtotalBeforeDiscount = item.quantity * item.unitPrice;
                newItems[index].subtotal = Math.max(0, subtotalBeforeDiscount - item.discount);
            }
            return { ...prev, items: newItems };
        });
        // Si se limpia el insumo, también limpiar los inputValues
        if (field === 'item' && !value) {
            setInputValues(prev => {
                const newInputValues = { ...prev };
                delete newInputValues[`quantity_${index}`];
                delete newInputValues[`unitPrice_${index}`];
                delete newInputValues[`discount_${index}`];
                return newInputValues;
            });
        }
        // Limpiar errores específicos cuando se corrige el campo
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            if (field === 'item' && value) {
                delete newErrors[`item_${index}_item`];
            }
            if (field === 'quantity' && Number(value) > 0) {
                delete newErrors[`item_${index}_quantity`];
            }
            if (field === 'unitPrice' && Number(value) >= 0) {
                delete newErrors[`item_${index}_unitPrice`];
            }
            if (field === 'discount' && Number(value) >= 0) {
                delete newErrors[`item_${index}_discount`];
            }
            return newErrors;
        });
    };
    // Calcular totales localmente como fallback
    const calculateTotals = () => {
        const netAmount = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
        const taxAmount = netAmount * formData.taxRate;
        const totalAmount = netAmount + taxAmount;
        return { netAmount, taxAmount, totalAmount };
    };
    // Validar formulario
    const validateForm = () => {
        const newErrors = {};
        if (!formData.counterparty) {
            newErrors.counterparty = 'El proveedor es requerido';
        }
        if (formData.items.length === 0) {
            newErrors.items = 'Debe agregar al menos un item';
        }
        // Validar cada item
        formData.items.forEach((item, index) => {
            if (!item.item) {
                newErrors[`item_${index}_item`] = 'Debe seleccionar un insumo';
            }
            if (item.quantity <= 0) {
                newErrors[`item_${index}_quantity`] = 'La cantidad debe ser mayor a 0';
            }
            if (item.unitPrice < 0) {
                newErrors[`item_${index}_unitPrice`] = 'El precio no puede ser negativo';
            }
            if (item.discount < 0) {
                newErrors[`item_${index}_discount`] = 'El descuento no puede ser negativo';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // Manejar envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        // Convertir fechas agregando horario de 12:00 (mediodía)
        const dateWithTime = formData.date ? `${formData.date}T12:00:00.000Z` : '';
        // Preparar datos para envío - formato simplificado para la nueva API
        const submitData = {
            documentType: formData.documentType,
            counterparty: formData.counterparty,
            items: formData.items.map(item => {
                const apiItem = {
                    item: item.item,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                };
                // Solo enviar discount si es mayor que 0
                if (item.discount > 0) {
                    apiItem.discount = item.discount;
                }
                return apiItem;
            }),
            date: dateWithTime,
            taxRate: formData.taxRate || undefined,
            observations: formData.observations || undefined
        };
        onSubmit(submitData);
    };
    // Usar datos del preview si están disponibles, sino calcular localmente
    const totalsToShow = previewData || calculateTotals();
    // Formatear número para mostrar en el input
    const formatInputNumber = (value) => {
        // Si value no es un número o es undefined/null, retornar vacío
        if (value === null || value === undefined || isNaN(Number(value))) {
            return '';
        }
        // Solo retornar vacío si es exactamente cero, no para valores "falsy"
        if (value === 0) {
            return '';
        }
        // Convertir a string con coma decimal
        const formattedValue = value.toString().replace('.', ',');
        return formattedValue;
    };
    // Manejar cambios en campos numéricos con soporte para comas
    const handleNumericChange = (index, field, value) => {
        const inputKey = `${field}_${index}`;
        // Guardar el valor exactamente como se escribió
        setInputValues(prev => ({
            ...prev,
            [inputKey]: value
        }));
        // Sólo intentar convertir a número si tiene un formato válido
        // Esto permite valores parciales como "1234," durante la edición
        if (value === '' || value === '-' || value === ',' || value === '.' || value.endsWith(',') || value.endsWith('.')) {
            // Para valores parciales/vacíos, guardar cero
            updateItem(index, field, 0);
        }
        else {
            // Para valores completos que se pueden convertir a número
            const numericValue = value.replace(',', '.');
            const parsedValue = Number(numericValue);
            if (!isNaN(parsedValue)) {
                updateItem(index, field, parsedValue);
            }
        }
    };
    // Validar input numérico
    const handleNumericKeyDown = (e) => {
        const currentValue = e.currentTarget.value;
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
            if (e.currentTarget.selectionStart === 0 && !currentValue.includes('-')) {
                return;
            }
            e.preventDefault();
            return;
        }
        // Manejar punto y coma como decimales
        if (e.key === '.' || e.key === ',') {
            // Si ya hay un punto o una coma, no permitir otro
            if (currentValue.includes('.') || currentValue.includes(',')) {
                e.preventDefault();
                return;
            }
            return;
        }
        // Bloquear cualquier otra tecla
        e.preventDefault();
    };
    // Manejar cuando se crea un nuevo proveedor
    const handleSupplierCreated = (newSupplier) => {
        setSuppliers(prev => [...prev, newSupplier]);
    };
    const handleConsumableCreated = (newConsumable) => {
        setConsumables(prev => [...prev, newConsumable]);
    };
    if (!isOpen)
        return null;
    return (_jsxs(PortalModal, { isOpen: isOpen, onClose: onClose, children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1050 }, onClick: onClose }), _jsx("div", { className: "modal fade show", style: {
                    display: 'block',
                    zIndex: 1055
                }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h5", { className: "modal-title", children: purchase ? 'Editar Compra' : 'Nueva Compra' }), _jsx("button", { type: "button", className: "btn-close", onClick: onClose, disabled: loading, "aria-label": "Cerrar" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("div", { className: "modal-body", children: loadingData ? (_jsx("div", { className: "text-center py-4", children: _jsx("div", { className: "spinner-border", style: { color: '#099347' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "Cargando datos..." }) }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "row mb-4", children: [_jsxs("div", { className: "col-md-4", children: [_jsx("label", { htmlFor: "counterparty", className: "form-label", children: "Proveedor *" }), _jsx(SupplierSearchSelector, { suppliers: suppliers, clients: clients, value: formData.counterparty, onChange: (value) => setFormData(prev => ({ ...prev, counterparty: value })), disabled: loading, error: errors.counterparty, onSupplierCreated: handleSupplierCreated })] }), _jsxs("div", { className: "col-md-4", children: [_jsx("label", { htmlFor: "documentType", className: "form-label", children: "Tipo de Documento *" }), _jsxs("select", { id: "documentType", className: "form-select", value: formData.documentType, onChange: (e) => setFormData(prev => ({ ...prev, documentType: e.target.value })), disabled: loading, children: [_jsxs("option", { value: "factura", children: [_jsx("i", { className: "bi bi-receipt me-2" }), "Factura"] }), _jsxs("option", { value: "boleta", children: [_jsx("i", { className: "bi bi-file-earmark me-2" }), "Boleta"] })] })] }), _jsxs("div", { className: "col-md-4", children: [_jsx("label", { htmlFor: "date", className: "form-label", children: "Fecha *" }), _jsx("input", { type: "date", id: "date", className: "form-control", value: formData.date, onChange: (e) => setFormData(prev => ({ ...prev, date: e.target.value })), disabled: loading })] })] }), _jsx("div", { className: "row mb-4", children: _jsxs("div", { className: "col-md-12", children: [_jsx("label", { htmlFor: "observations", className: "form-label", children: "Observaciones" }), _jsx("textarea", { id: "observations", className: "form-control", rows: 3, value: formData.observations, onChange: (e) => setFormData(prev => ({ ...prev, observations: e.target.value })), disabled: loading, placeholder: "Observaciones adicionales para la compra..." })] }) }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-3", children: [_jsx("h6", { className: "mb-0", children: "Items de la Compra" }), _jsxs("button", { type: "button", className: "btn btn-sm btn-success", onClick: addItem, disabled: loading, children: [_jsx("i", { className: "bi bi-plus-lg me-1" }), " Agregar Item"] })] }), errors.items && (_jsx("div", { className: "alert alert-danger", children: errors.items })), formData.items.length === 0 ? (_jsxs("div", { className: "alert alert-info text-center", children: [_jsx("i", { className: "bi bi-info-circle me-2" }), "No hay items agregados. Haga clic en \"Agregar Item\" para comenzar."] })) : (_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-bordered", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { style: { minWidth: '200px' }, children: "Insumo *" }), _jsx("th", { style: { width: '100px' }, children: "Cantidad *" }), _jsx("th", { style: { width: '120px' }, children: "Precio Unit. *" }), _jsx("th", { style: { width: '120px' }, children: "Descuento" }), _jsx("th", { style: { width: '120px' }, children: "Subtotal" }), _jsx("th", { style: { width: '60px' }, children: "Acci\u00F3n" })] }) }), _jsx("tbody", { children: formData.items.map((item, index) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx(ConsumableSearchSelector, { consumables: consumables, value: item.item, onChange: (value) => updateItem(index, 'item', value), onConsumableCreated: handleConsumableCreated, onConsumableSelected: (consumableId, consumable) => updateItem(index, 'item', consumableId, consumable), onClear: () => updateItem(index, 'item', ''), disabled: loading, error: errors[`item_${index}_item`] }) }), _jsxs("td", { children: [_jsx("input", { type: "text", className: `form-control ${errors[`item_${index}_quantity`] ? 'is-invalid' : ''}`, value: inputValues[`quantity_${index}`] !== undefined ? inputValues[`quantity_${index}`] : formatInputNumber(item.quantity), onChange: (e) => handleNumericChange(index, 'quantity', e.target.value), onKeyDown: handleNumericKeyDown, disabled: loading, placeholder: "Ej: 5" }), errors[`item_${index}_quantity`] && (_jsx("div", { className: "text-danger small", children: errors[`item_${index}_quantity`] }))] }), _jsxs("td", { children: [_jsx("input", { type: "text", className: `form-control ${errors[`item_${index}_unitPrice`] ? 'is-invalid' : ''}`, value: inputValues[`unitPrice_${index}`] !== undefined ? inputValues[`unitPrice_${index}`] : formatInputNumber(item.unitPrice), onChange: (e) => handleNumericChange(index, 'unitPrice', e.target.value), onKeyDown: handleNumericKeyDown, disabled: loading, placeholder: "Ej: 2500" }), errors[`item_${index}_unitPrice`] && (_jsx("div", { className: "text-danger small", children: errors[`item_${index}_unitPrice`] }))] }), _jsxs("td", { children: [_jsx("input", { type: "text", className: `form-control ${errors[`item_${index}_discount`] ? 'is-invalid' : ''}`, value: inputValues[`discount_${index}`] !== undefined ? inputValues[`discount_${index}`] : formatInputNumber(item.discount), onChange: (e) => handleNumericChange(index, 'discount', e.target.value), onKeyDown: handleNumericKeyDown, disabled: loading, placeholder: "Ej: 500" }), errors[`item_${index}_discount`] && (_jsx("div", { className: "text-danger small", children: errors[`item_${index}_discount`] }))] }), _jsx("td", { className: "text-end", children: _jsx("strong", { children: formatCurrencyNoDecimals(item.subtotal) }) }), _jsx("td", { className: "text-center", children: _jsx("button", { type: "button", className: "btn btn-sm btn-outline-danger", onClick: () => removeItem(index), disabled: loading, title: "Eliminar item", children: _jsx("i", { className: "bi bi-trash" }) }) })] }, index))) })] }) }))] }), formData.items.length > 0 && (_jsx("div", { className: "card bg-light mt-3", children: _jsx("div", { className: "card-body", children: _jsx("div", { className: "row", children: _jsxs("div", { className: "col-md-6 offset-md-6", children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-2", children: [_jsx("h6", { className: "mb-0", children: "Totales" }), loadingPreview && (_jsx("div", { className: "spinner-border spinner-border-sm text-success", role: "status", children: _jsx("span", { className: "visually-hidden", children: "Calculando..." }) }))] }), _jsx("table", { className: "table table-sm mb-0", children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { children: _jsx("strong", { children: "Neto:" }) }), _jsx("td", { className: "text-end", children: _jsx("strong", { children: formatCurrencyNoDecimals(totalsToShow.netAmount) }) })] }), _jsxs("tr", { children: [_jsx("td", { children: _jsxs("strong", { children: ["IVA (", (formData.taxRate * 100).toFixed(0), "%):"] }) }), _jsx("td", { className: "text-end", children: _jsx("strong", { children: formatCurrencyNoDecimals(totalsToShow.taxAmount) }) })] }), _jsxs("tr", { className: "table-success", children: [_jsx("td", { children: _jsx("strong", { children: "Total:" }) }), _jsx("td", { className: "text-end", children: _jsx("strong", { children: formatCurrencyNoDecimals(totalsToShow.totalAmount) }) })] })] }) })] }) }) }) }))] })) }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: onClose, disabled: loading, children: "Cancelar" }), _jsx("button", { type: "submit", className: "btn btn-success", disabled: loading || loadingData, children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), purchase ? 'Actualizando...' : 'Creando...'] })) : (_jsxs(_Fragment, { children: [_jsx("i", { className: "bi bi-check-lg me-1" }), purchase ? 'Actualizar Compra' : 'Crear Compra'] })) })] })] })] }) }) })] }));
}
