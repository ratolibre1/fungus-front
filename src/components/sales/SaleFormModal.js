import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PortalModal from '../common/PortalModal';
import { getClients, createClient } from '../../services/clientService';
import { getSuppliers } from '../../services/supplierService';
import { addCustomerRole } from '../../services/roleService';
import { getProducts, createProduct } from '../../services/productService';
import { previewSale } from '../../services/saleService';
import { compareStringsSpanish, formatCurrencyNoDecimals } from '../../utils/validators';
import ClientModal from '../ClientModal';
const ClientSearchSelector = ({ clients, suppliers, value, onChange, onClientCreated, disabled, error }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [addingRole, setAddingRole] = useState(false);
    // Estados para ClientModal
    const [showClientModal, setShowClientModal] = useState(false);
    const [clientModalLoading, setClientModalLoading] = useState(false);
    const filteredClients = clients.filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.rut.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => compareStringsSpanish(a.name, b.name));
    // Buscar en proveedores que coincidan con el término de búsqueda
    const potentialSuppliers = suppliers.filter(supplier => supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.rut.toLowerCase().includes(searchTerm.toLowerCase())).filter(supplier => 
    // Excluir si ya existe como cliente
    !clients.some(client => client.rut === supplier.rut));
    const selectedClient = clients.find(c => c._id === value);
    const handleSelect = (clientId) => {
        onChange(clientId);
        setIsOpen(false);
        setSearchTerm('');
    };
    const handleClear = () => {
        onChange('');
        setSearchTerm('');
        setIsOpen(false);
    };
    // Abrir ClientModal para crear nuevo cliente
    const handleCreateNewClient = () => {
        setIsOpen(false);
        setShowClientModal(true);
    };
    // Manejar creación desde ClientModal
    const handleClientModalSubmit = async (formData) => {
        setClientModalLoading(true);
        try {
            // En modo create, formData será siempre CreateClientRequest
            const response = await createClient(formData);
            if (response.success) {
                onChange(response.data._id);
                setShowClientModal(false);
                setSearchTerm('');
                if (onClientCreated) {
                    onClientCreated(response.data);
                }
            }
        }
        catch (error) {
            console.error('Error creando cliente:', error);
        }
        finally {
            setClientModalLoading(false);
        }
    };
    // Agregar rol de cliente a un proveedor existente usando addCustomerRole
    const handleAddCustomerRole = async (supplier) => {
        setAddingRole(true);
        try {
            const response = await addCustomerRole(supplier._id);
            if (response.success) {
                // Crear el objeto cliente basado en el proveedor para agregarlo localmente
                const newClient = {
                    _id: supplier._id, // Usar el mismo ID del proveedor
                    name: supplier.name,
                    rut: supplier.rut,
                    email: supplier.email,
                    phone: supplier.phone,
                    address: supplier.address || '',
                    isCustomer: true,
                    isSupplier: true,
                    isDeleted: false,
                    needsReview: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                onChange(supplier._id);
                setIsOpen(false);
                setSearchTerm('');
                if (onClientCreated) {
                    onClientCreated(newClient);
                }
            }
        }
        catch (error) {
            console.error('Error agregando rol de cliente:', error);
        }
        finally {
            setAddingRole(false);
        }
    };
    const formatClientDisplay = (client) => {
        return `${client.name} - ${client.rut}`;
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "position-relative", children: [_jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", className: `form-control ${error ? 'is-invalid' : ''}`, placeholder: "Buscar cliente por nombre o RUT...", value: selectedClient ? formatClientDisplay(selectedClient) : searchTerm, onChange: (e) => {
                                    setSearchTerm(e.target.value);
                                    setIsOpen(true);
                                }, onFocus: () => setIsOpen(true), disabled: disabled }), value && (_jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: handleClear, disabled: disabled, title: "Limpiar selecci\u00F3n", children: _jsx("i", { className: "bi bi-x" }) })), _jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: () => setIsOpen(!isOpen), disabled: disabled, children: _jsx("i", { className: `bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}` }) })] }), isOpen && (_jsx("div", { className: "position-fixed mt-1 bg-white", style: {
                            zIndex: 1070,
                            minWidth: '300px',
                            maxWidth: '500px',
                            left: 'auto',
                            right: 'auto'
                        }, children: _jsxs("div", { className: "card shadow-lg", children: [_jsx("div", { className: "card-header bg-success text-white p-2", children: _jsxs("div", { className: "input-group input-group-sm", children: [_jsx("input", { type: "text", className: "form-control", placeholder: "Buscar clientes por nombre o RUT...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), autoFocus: true }), _jsx("span", { className: "input-group-text", children: _jsx("i", { className: "bi bi-search" }) })] }) }), _jsxs("div", { className: "list-group list-group-flush", style: { maxHeight: '300px', overflowY: 'auto' }, children: [filteredClients.map(client => (_jsx("button", { type: "button", className: `list-group-item list-group-item-action ${value === client._id ? 'active' : ''}`, onClick: () => handleSelect(client._id), children: _jsx("div", { className: "d-flex justify-content-between align-items-center", children: _jsxs("span", { children: [_jsx("strong", { children: client.name }), " - ", _jsx("small", { className: "text-muted", children: client.rut })] }) }) }, client._id))), searchTerm && potentialSuppliers.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "list-group-item bg-light text-muted small", children: [_jsx("i", { className: "bi bi-info-circle me-1" }), "Contactos existentes como proveedores:"] }), potentialSuppliers.map(supplier => (_jsx("div", { className: "list-group-item bg-light", children: _jsxs("div", { className: "d-flex justify-content-between align-items-center", children: [_jsxs("div", { children: [_jsx("strong", { children: supplier.name }), " - ", _jsx("small", { className: "text-muted", children: supplier.rut }), _jsx("br", {}), _jsxs("small", { className: "text-muted", children: [_jsx("i", { className: "bi bi-truck me-1" }), "Existe como proveedor"] })] }), _jsxs("button", { className: "btn btn-outline-success btn-sm", onClick: () => handleAddCustomerRole(supplier), disabled: addingRole, children: [addingRole ? (_jsx("span", { className: "spinner-border spinner-border-sm me-1", role: "status", "aria-hidden": "true" })) : (_jsx("i", { className: "bi bi-arrow-up-right-circle me-1" })), "Agregar como cliente"] })] }) }, `supplier-${supplier._id}`)))] })), filteredClients.length === 0 && potentialSuppliers.length === 0 && searchTerm && (_jsxs("div", { className: "list-group-item text-center py-3", children: [_jsx("i", { className: "bi bi-search me-2 text-muted" }), _jsx("div", { className: "text-muted mb-2", children: "No se encontraron clientes" }), _jsxs("button", { className: "btn btn-success btn-sm", onClick: handleCreateNewClient, children: [_jsx("i", { className: "bi bi-plus-circle me-1" }), "Crear nuevo cliente"] })] })), !searchTerm && filteredClients.length === 0 && (_jsxs("div", { className: "list-group-item text-center text-muted py-3", children: [_jsx("i", { className: "bi bi-search me-2" }), "Escribe para buscar clientes"] }))] })] }) })), isOpen && (_jsx("div", { className: "position-fixed top-0 start-0 w-100 h-100", style: { zIndex: 1069 }, onClick: () => setIsOpen(false) })), error && _jsx("div", { className: "invalid-feedback", children: error })] }), _jsx(ClientModal, { isOpen: showClientModal, modalType: "create", selectedClient: null, loading: clientModalLoading, onClose: () => setShowClientModal(false), onSubmit: handleClientModalSubmit })] }));
};
const ProductSearchSelector = ({ products, value, onChange, onProductCreated, onProductSelected, onClear, disabled, error }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    // Estados para modal de crear producto
    const [showProductModal, setShowProductModal] = useState(false);
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [productFormData, setProductFormData] = useState({
        name: '',
        description: '',
        netPrice: 0,
        stock: null,
        dimensions: ''
    });
    // Solo usar productos (sin consumibles)
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => compareStringsSpanish(a.name, b.name));
    const selectedProduct = products.find(p => p._id === value);
    const handleSelect = (productId) => {
        const product = products.find(p => p._id === productId);
        onChange(productId);
        if (product && onProductSelected) {
            onProductSelected(productId, product);
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
    const handleCreateNewProduct = () => {
        setProductFormData({
            name: searchTerm,
            description: '',
            netPrice: 0,
            stock: null,
            dimensions: ''
        });
        setIsOpen(false);
        setShowProductModal(true);
    };
    const handleCreateProduct = async () => {
        if (!productFormData.name || !productFormData.netPrice)
            return;
        setCreatingProduct(true);
        try {
            const response = await createProduct(productFormData);
            if (response.success) {
                // Primero agregar a la lista
                if (onProductCreated) {
                    onProductCreated(response.data);
                }
                // Luego seleccionarlo automáticamente
                onChange(response.data._id);
                if (onProductSelected) {
                    onProductSelected(response.data._id, response.data);
                }
                setShowProductModal(false);
                setSearchTerm('');
            }
        }
        catch (error) {
            console.error('Error creando producto:', error);
        }
        finally {
            setCreatingProduct(false);
        }
    };
    const handleProductFormChange = (field, value) => {
        setProductFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const formatProductDisplay = (product) => {
        const dimensions = product.dimensions ? ` (${product.dimensions})` : '';
        return `${product.name} - ${product.description}${dimensions}`;
    };
    const formatProductDisplayJSX = (product) => {
        const dimensions = product.dimensions ? ` (${product.dimensions})` : '';
        return (_jsxs("span", { children: [_jsx("strong", { children: product.name }), " -", _jsxs("small", { className: "text-muted", children: [" ", product.description, dimensions] })] }));
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "position-relative", children: [_jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", className: `form-control ${error ? 'is-invalid' : ''}`, placeholder: "Buscar producto...", value: selectedProduct ? formatProductDisplay(selectedProduct) : searchTerm, onChange: (e) => {
                                    setSearchTerm(e.target.value);
                                    setIsOpen(true);
                                }, onFocus: () => setIsOpen(true), disabled: disabled }), value && (_jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: handleClear, disabled: disabled, title: "Limpiar selecci\u00F3n", children: _jsx("i", { className: "bi bi-x" }) })), _jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: () => setIsOpen(!isOpen), disabled: disabled, children: _jsx("i", { className: `bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}` }) })] }), isOpen && (_jsx("div", { className: "position-fixed mt-1 bg-white", style: {
                            zIndex: 1070,
                            minWidth: '400px',
                            maxWidth: '600px',
                            left: 'auto',
                            right: 'auto'
                        }, children: _jsxs("div", { className: "card shadow-lg", children: [_jsx("div", { className: "card-header bg-success text-white p-2", children: _jsxs("div", { className: "input-group input-group-sm", children: [_jsx("input", { type: "text", className: "form-control", placeholder: "Buscar productos...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), autoFocus: true }), _jsx("span", { className: "input-group-text", children: _jsx("i", { className: "bi bi-search" }) })] }) }), _jsx("div", { className: "list-group list-group-flush", style: { maxHeight: '250px', overflowY: 'auto' }, children: filteredProducts.length === 0 ? (_jsxs("div", { className: "list-group-item text-center py-3", children: [_jsxs("div", { className: "text-muted mb-3", children: [_jsx("i", { className: "bi bi-search me-2" }), "No se encontraron productos"] }), searchTerm && (_jsxs("button", { type: "button", className: "btn btn-success btn-sm", onClick: handleCreateNewProduct, disabled: disabled, children: [_jsx("i", { className: "bi bi-plus-circle me-2" }), "Crear nuevo producto"] }))] })) : (filteredProducts.map(product => (_jsx("button", { type: "button", className: `list-group-item list-group-item-action py-2 ${value === product._id ? 'active' : ''}`, onClick: () => handleSelect(product._id), children: formatProductDisplayJSX(product) }, `product_${product._id}`)))) })] }) })), isOpen && (_jsx("div", { className: "position-fixed top-0 start-0 w-100 h-100", style: { zIndex: 1069 }, onClick: () => setIsOpen(false) })), error && _jsx("div", { className: "invalid-feedback", children: error })] }), showProductModal && (_jsxs(PortalModal, { isOpen: true, onClose: () => setShowProductModal(false), children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1080 }, onClick: () => setShowProductModal(false) }), _jsx("div", { className: "modal fade show", style: {
                            display: 'block',
                            zIndex: 1085
                        }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h5", { className: "modal-title", children: "Nuevo Producto" }), _jsx("button", { type: "button", className: "btn-close", onClick: () => setShowProductModal(false), disabled: creatingProduct })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Nombre ", _jsx("span", { style: { color: '#dc3545' }, children: "*" })] }), _jsx("input", { type: "text", className: "form-control", value: productFormData.name, onChange: (e) => handleProductFormChange('name', e.target.value), placeholder: "Ej: Microdosis de psilocibina" })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Descripci\u00F3n" }), _jsx("textarea", { className: "form-control", value: productFormData.description, onChange: (e) => handleProductFormChange('description', e.target.value), placeholder: "Ej: Microdosis de 0.1g de psilocibina", rows: 3 })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Precio neto ", _jsx("span", { style: { color: '#dc3545' }, children: "*" })] }), _jsx("input", { type: "number", className: "form-control", value: productFormData.netPrice, onChange: (e) => handleProductFormChange('netPrice', Number(e.target.value)), placeholder: "Ej: 15000", min: "0" })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Stock" }), _jsx("input", { type: "number", className: "form-control", value: productFormData.stock || '', onChange: (e) => handleProductFormChange('stock', e.target.value ? Number(e.target.value) : null), placeholder: "Ej: 50", min: "0" })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Dimensiones" }), _jsx("input", { type: "text", className: "form-control", value: productFormData.dimensions, onChange: (e) => handleProductFormChange('dimensions', e.target.value), placeholder: "Ej: 10ml" })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowProductModal(false), disabled: creatingProduct, children: "Cancelar" }), _jsx("button", { type: "button", className: "btn btn-success", onClick: handleCreateProduct, disabled: creatingProduct || !productFormData.name || !productFormData.netPrice, children: creatingProduct ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), "Creando..."] })) : (_jsxs(_Fragment, { children: [_jsx("i", { className: "bi bi-check-circle me-2" }), "Crear producto"] })) })] })] }) }) })] }))] }));
};
export default function SaleFormModal({ sale, isOpen, onClose, onSubmit, loading = false }) {
    // Estados del formulario - usando solo fechas (sin horario)
    const [formData, setFormData] = useState({
        counterparty: '',
        documentType: 'boleta',
        items: [],
        taxRate: 0.19,
        observations: '',
        relatedQuotation: ''
    });
    // Estados para opciones de select
    const [clients, setClients] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    // Estados para UI
    const [errors, setErrors] = useState({});
    // Estados para preview y cálculos en tiempo real
    const [previewData, setPreviewData] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    // Estados para manejar inputs numéricos con comas decimales
    const [inputValues, setInputValues] = useState({});
    // Cargar datos iniciales
    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);
    // Cargar datos cuando se edita una venta
    useEffect(() => {
        if (sale && isOpen) {
            populateFormData(sale);
        }
        else if (isOpen) {
            // Resetear formulario para nueva venta
            setFormData({
                counterparty: '',
                documentType: 'boleta',
                items: [],
                taxRate: 0.19,
                observations: '',
                relatedQuotation: ''
            });
        }
    }, [sale, isOpen]);
    // Cargar clientes, proveedores y productos
    const loadInitialData = async () => {
        setLoadingData(true);
        try {
            const [clientsRes, suppliersRes, productsRes] = await Promise.all([
                getClients(),
                getSuppliers(),
                getProducts({})
            ]);
            setClients(clientsRes.data);
            setSuppliers(suppliersRes.data);
            setProducts(productsRes.data);
        }
        catch (error) {
            console.error('Error loading data:', error);
        }
        finally {
            setLoadingData(false);
        }
    };
    // Poblar formulario con datos de venta existente
    const populateFormData = (sale) => {
        const formItems = sale.items.map(item => {
            const itemDetail = typeof item.itemDetail === 'object' ? item.itemDetail : null;
            return {
                item: typeof item.itemDetail === 'string' ? item.itemDetail : itemDetail?._id || '',
                itemName: itemDetail?.name || '',
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
                subtotal: item.subtotal
            };
        });
        setFormData({
            counterparty: typeof sale.counterparty === 'string'
                ? sale.counterparty
                : sale.counterparty._id,
            documentType: sale.documentType,
            items: formItems,
            taxRate: sale.taxRate || 0.19,
            observations: sale.observations || '',
            relatedQuotation: typeof sale.relatedQuotation === 'string'
                ? sale.relatedQuotation || ''
                : sale.relatedQuotation?._id || ''
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
            const response = await previewSale(previewRequest);
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
    // Calcular preview cuando cambian items o tipo de documento
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            calculatePreview();
        }, 500); // Debounce de 500ms
        return () => clearTimeout(timeoutId);
    }, [formData.items, formData.documentType, formData.taxRate]);
    // Agregar nuevo item
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
    // Eliminar item
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
    // Actualizar item
    const updateItem = (index, field, value, productData) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            // Si se cambia el item, buscar su nombre y tipo
            if (field === 'item') {
                if (value) {
                    // Si se selecciona un producto
                    // Usar productData si se proporciona, sino buscar en la lista
                    const product = productData || products.find(p => p._id === value);
                    if (product) {
                        newItems[index].itemName = product.name;
                        newItems[index].unitPrice = product.netPrice || 0;
                        // Si no hay cantidad, poner 1 por defecto
                        if (!newItems[index].quantity || newItems[index].quantity === 0) {
                            newItems[index].quantity = 1;
                        }
                    }
                }
                else {
                    // Si se limpia el producto, limpiar todos los valores
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
        // Si se limpia el producto, también limpiar los inputValues
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
    // Calcular totales para mostrar como referencia en la UI
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
            newErrors.counterparty = 'El cliente es requerido';
        }
        if (formData.items.length === 0) {
            newErrors.items = 'Debe agregar al menos un item';
        }
        formData.items.forEach((item, index) => {
            if (!item.item) {
                newErrors[`item_${index}_item`] = 'Debe seleccionar un producto';
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
            taxRate: formData.taxRate || undefined,
            observations: formData.observations || undefined,
            relatedQuotation: formData.relatedQuotation || undefined
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
    // Manejar cuando se crea un nuevo cliente
    const handleClientCreated = (newClient) => {
        setClients(prev => [...prev, newClient]);
    };
    const handleProductCreated = (newProduct) => {
        setProducts(prev => [...prev, newProduct]);
    };
    if (!isOpen)
        return null;
    return (_jsxs(PortalModal, { isOpen: isOpen, onClose: onClose, children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1050 }, onClick: onClose }), _jsx("div", { className: "modal fade show", style: {
                    display: 'block',
                    zIndex: 1055
                }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h5", { className: "modal-title", children: sale ? 'Editar Venta' : 'Nueva Venta' }), _jsx("button", { type: "button", className: "btn-close", onClick: onClose, disabled: loading, "aria-label": "Cerrar" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("div", { className: "modal-body", children: loadingData ? (_jsx("div", { className: "text-center py-4", children: _jsx("div", { className: "spinner-border", style: { color: '#099347' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "Cargando datos..." }) }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "row mb-4", children: [_jsxs("div", { className: "col-md-6", children: [_jsx("label", { htmlFor: "counterparty", className: "form-label", children: "Cliente *" }), _jsx(ClientSearchSelector, { clients: clients, suppliers: suppliers, value: formData.counterparty, onChange: (value) => setFormData(prev => ({ ...prev, counterparty: value })), disabled: loading, error: errors.counterparty, onClientCreated: handleClientCreated })] }), _jsxs("div", { className: "col-md-6", children: [_jsx("label", { htmlFor: "documentType", className: "form-label", children: "Tipo de Documento *" }), _jsxs("select", { id: "documentType", className: "form-select", value: formData.documentType, onChange: (e) => setFormData(prev => ({ ...prev, documentType: e.target.value })), disabled: loading, children: [_jsxs("option", { value: "boleta", children: [_jsx("i", { className: "bi bi-file-earmark me-2" }), "Boleta"] }), _jsxs("option", { value: "factura", children: [_jsx("i", { className: "bi bi-receipt me-2" }), "Factura"] })] })] })] }), _jsx("div", { className: "row mb-4", children: _jsxs("div", { className: "col-md-12", children: [_jsx("label", { htmlFor: "observations", className: "form-label", children: "Observaciones" }), _jsx("textarea", { id: "observations", className: "form-control", rows: 3, value: formData.observations, onChange: (e) => setFormData(prev => ({ ...prev, observations: e.target.value })), disabled: loading, placeholder: "Observaciones adicionales para la venta..." })] }) }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-3", children: [_jsx("h6", { className: "mb-0", children: "Items de la Venta" }), _jsxs("button", { type: "button", className: "btn btn-sm btn-success", onClick: addItem, disabled: loading, children: [_jsx("i", { className: "bi bi-plus-lg me-1" }), " Agregar Item"] })] }), errors.items && (_jsx("div", { className: "alert alert-danger", children: errors.items })), formData.items.length === 0 ? (_jsxs("div", { className: "alert alert-info text-center", children: [_jsx("i", { className: "bi bi-info-circle me-2" }), "No hay items agregados. Haga clic en \"Agregar Item\" para comenzar."] })) : (_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-bordered", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { style: { minWidth: '200px' }, children: "Producto *" }), _jsx("th", { style: { width: '100px' }, children: "Cantidad *" }), _jsx("th", { style: { width: '120px' }, children: "Precio Unit. *" }), _jsx("th", { style: { width: '120px' }, children: "Descuento" }), _jsx("th", { style: { width: '120px' }, children: "Subtotal" }), _jsx("th", { style: { width: '60px' }, children: "Acci\u00F3n" })] }) }), _jsx("tbody", { children: formData.items.map((item, index) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx(ProductSearchSelector, { products: products, value: item.item, onChange: (value) => updateItem(index, 'item', value), onProductCreated: handleProductCreated, onProductSelected: (productId, product) => updateItem(index, 'item', productId, product), onClear: () => updateItem(index, 'item', ''), disabled: loading, error: errors[`item_${index}_item`] }) }), _jsxs("td", { children: [_jsx("input", { type: "text", className: `form-control ${errors[`item_${index}_quantity`] ? 'is-invalid' : ''}`, value: inputValues[`quantity_${index}`] !== undefined ? inputValues[`quantity_${index}`] : formatInputNumber(item.quantity), onChange: (e) => handleNumericChange(index, 'quantity', e.target.value), onKeyDown: handleNumericKeyDown, disabled: loading, placeholder: "Ej: 5" }), errors[`item_${index}_quantity`] && (_jsx("div", { className: "text-danger small", children: errors[`item_${index}_quantity`] }))] }), _jsxs("td", { children: [_jsx("input", { type: "text", className: `form-control ${errors[`item_${index}_unitPrice`] ? 'is-invalid' : ''}`, value: inputValues[`unitPrice_${index}`] !== undefined ? inputValues[`unitPrice_${index}`] : formatInputNumber(item.unitPrice), onChange: (e) => handleNumericChange(index, 'unitPrice', e.target.value), onKeyDown: handleNumericKeyDown, disabled: loading, placeholder: "Ej: 15990" }), errors[`item_${index}_unitPrice`] && (_jsx("div", { className: "text-danger small", children: errors[`item_${index}_unitPrice`] }))] }), _jsxs("td", { children: [_jsx("input", { type: "text", className: `form-control ${errors[`item_${index}_discount`] ? 'is-invalid' : ''}`, value: inputValues[`discount_${index}`] !== undefined ? inputValues[`discount_${index}`] : formatInputNumber(item.discount), onChange: (e) => handleNumericChange(index, 'discount', e.target.value), onKeyDown: handleNumericKeyDown, disabled: loading, placeholder: "Ej: 1000" }), errors[`item_${index}_discount`] && (_jsx("div", { className: "text-danger small", children: errors[`item_${index}_discount`] }))] }), _jsx("td", { className: "text-end", children: _jsx("strong", { children: formatCurrencyNoDecimals(item.subtotal) }) }), _jsx("td", { className: "text-center", children: _jsx("button", { type: "button", className: "btn btn-sm btn-outline-danger", onClick: () => removeItem(index), disabled: loading, title: "Eliminar item", children: _jsx("i", { className: "bi bi-trash" }) }) })] }, index))) })] }) }))] }), formData.items.length > 0 && (_jsx("div", { className: "card bg-light mt-3", children: _jsx("div", { className: "card-body", children: _jsx("div", { className: "row", children: _jsxs("div", { className: "col-md-6 offset-md-6", children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-2", children: [_jsx("h6", { className: "mb-0", children: "Totales" }), loadingPreview && (_jsx("div", { className: "spinner-border spinner-border-sm text-success", role: "status", children: _jsx("span", { className: "visually-hidden", children: "Calculando..." }) }))] }), _jsx("table", { className: "table table-sm mb-0", children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { children: _jsx("strong", { children: "Neto:" }) }), _jsx("td", { className: "text-end", children: _jsx("strong", { children: formatCurrencyNoDecimals(totalsToShow.netAmount) }) })] }), _jsxs("tr", { children: [_jsx("td", { children: _jsxs("strong", { children: ["IVA (", (formData.taxRate * 100).toFixed(0), "%):"] }) }), _jsx("td", { className: "text-end", children: _jsx("strong", { children: formatCurrencyNoDecimals(totalsToShow.taxAmount) }) })] }), _jsxs("tr", { className: "table-success", children: [_jsx("td", { children: _jsx("strong", { children: "Total:" }) }), _jsx("td", { className: "text-end", children: _jsx("strong", { children: formatCurrencyNoDecimals(totalsToShow.totalAmount) }) })] })] }) })] }) }) }) }))] })) }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: onClose, disabled: loading, children: "Cancelar" }), _jsx("button", { type: "submit", className: "btn btn-success", disabled: loading || loadingData, children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), sale ? 'Actualizando...' : 'Creando...'] })) : (_jsxs(_Fragment, { children: [_jsx("i", { className: "bi bi-check-lg me-1" }), sale ? 'Actualizar Venta' : 'Crear Venta'] })) })] })] })] }) }) })] }));
}
