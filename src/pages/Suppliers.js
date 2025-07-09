import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SuppliersBackground from '../components/SuppliersBackground';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/supplierService';
import { formatRut, formatPhone, compareStringsSpanish } from '../utils/validators';
import SupplierModal from '../components/SupplierModal';
export default function Suppliers() {
    // Estados
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [allSuppliers, setAllSuppliers] = useState([]); // Guardar todos los proveedores
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    // Estados para ordenamiento
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    // Cargar todos los proveedores
    const loadSuppliers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getSuppliers();
            setAllSuppliers(response.data); // Guardar todos los datos
            setSuppliers(response.data); // Mostrar todos inicialmente
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    // Filtrar localmente en tiempo real
    const filterSuppliers = (term) => {
        if (!term.trim()) {
            setSuppliers(allSuppliers);
            return;
        }
        const filtered = allSuppliers.filter(supplier => {
            const searchLower = term.toLowerCase();
            return (supplier.name.toLowerCase().includes(searchLower) ||
                supplier.rut.toLowerCase().includes(searchLower) ||
                supplier.email.toLowerCase().includes(searchLower));
        });
        setSuppliers(filtered);
    };
    // Manejar cambio en el input de búsqueda
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        filterSuppliers(value);
    };
    // Resetear búsqueda
    const resetSearch = () => {
        setSearchTerm('');
        setSuppliers(allSuppliers);
    };
    // Cargar al montar el componente
    useEffect(() => {
        loadSuppliers();
    }, []);
    // Abrir modal
    const openModal = (type, supplier = null) => {
        setModalType(type);
        setSelectedSupplier(supplier);
    };
    // Cerrar modal
    const closeModal = () => {
        setModalType(null);
        setSelectedSupplier(null);
    };
    // Manejar submit del formulario del modal
    const handleModalSubmit = async (formData) => {
        setModalLoading(true);
        setError(null);
        try {
            if (modalType === 'create') {
                await createSupplier(formData);
            }
            else if (modalType === 'edit' && selectedSupplier) {
                await updateSupplier(selectedSupplier._id, formData);
            }
            else if (modalType === 'delete' && selectedSupplier) {
                await deleteSupplier(selectedSupplier._id);
            }
            // Siempre recargar la lista desde el servidor primero
            await loadSuppliers();
            // Si había un filtro aplicado, limpiar después del borrado para mostrar que se eliminó
            if (modalType === 'delete' && searchTerm.trim()) {
                setSearchTerm('');
            }
            else if (searchTerm.trim()) {
                // Para create y edit, mantener el filtro aplicado
                filterSuppliers(searchTerm);
            }
            closeModal();
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setModalLoading(false);
        }
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
    const getSortedSuppliers = () => {
        return [...suppliers].sort((a, b) => {
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
    return (_jsx(Layout, { children: _jsxs("div", { className: "suppliers-page-container", children: [_jsx(SuppliersBackground, {}), _jsxs("div", { className: "d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom", children: [_jsx("h1", { className: "h2 font-heading", style: { color: '#099347' }, children: "Proveedores" }), _jsxs("button", { className: "btn", style: { backgroundColor: '#099347', color: 'white' }, onClick: () => openModal('create'), children: [_jsx("i", { className: "bi bi-plus-circle me-1" }), " Nuevo Proveedor"] })] }), _jsx("div", { className: "card mb-4 border-0 shadow-sm", children: _jsx("div", { className: "card-body", children: _jsx("div", { className: "row g-3", children: _jsx("div", { className: "col-md-6", children: _jsxs("div", { className: "input-group", children: [_jsx("input", { type: "text", className: "form-control", placeholder: "Buscar por nombre, rut o email...", value: searchTerm, onChange: (e) => handleSearchChange(e.target.value) }), _jsx("span", { className: "input-group-text", children: _jsx("i", { className: "bi bi-search" }) }), searchTerm && (_jsx("button", { className: "btn btn-outline-secondary", type: "button", onClick: resetSearch, children: _jsx("i", { className: "bi bi-x-lg" }) }))] }) }) }) }) }), error && (_jsx("div", { className: "alert text-white", style: { backgroundColor: '#dc3545' }, role: "alert", children: error })), loading && !error ? (_jsx("div", { className: "d-flex justify-content-center my-5", children: _jsx("div", { className: "spinner-border", style: { color: '#099347' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "Cargando..." }) }) })) : (_jsx(_Fragment, { children: suppliers.length === 0 ? (_jsx("div", { className: "alert alert-info", role: "alert", children: searchTerm ? "No se encontraron proveedores con ese criterio de búsqueda." : "No hay proveedores disponibles." })) : (_jsx("div", { className: "card shadow-sm", children: _jsx("div", { className: "card-body", children: _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover table-striped", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsxs("th", { onClick: () => handleSort('name'), style: { cursor: 'pointer' }, children: ["Nombre", _jsx("i", { className: `bi ms-1 ${sortField === 'name'
                                                                    ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                                                                    : 'bi-arrow-down-square'}` })] }), _jsxs("th", { onClick: () => handleSort('rut'), style: { cursor: 'pointer' }, children: ["RUT", _jsx("i", { className: `bi ms-1 ${sortField === 'rut'
                                                                    ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                                                                    : 'bi-arrow-down-square'}` })] }), _jsxs("th", { onClick: () => handleSort('email'), style: { cursor: 'pointer' }, children: ["Email", _jsx("i", { className: `bi ms-1 ${sortField === 'email'
                                                                    ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                                                                    : 'bi-arrow-down-square'}` })] }), _jsx("th", { children: "Tel\u00E9fono" }), _jsx("th", { children: "Direcci\u00F3n" }), _jsx("th", { className: "text-center", children: "Acciones" })] }) }), _jsx("tbody", { children: getSortedSuppliers().map(supplier => (_jsxs("tr", { children: [_jsxs("td", { children: [supplier.needsReview && (_jsx("i", { className: "bi bi-exclamation-triangle-fill", style: {
                                                                    color: '#ffc107'
                                                                }, title: "Requiere revisi\u00F3n" })), supplier.isCustomer && (_jsx("i", { className: "bi bi-people-fill", style: { color: '#0d6efd' }, title: "Tambi\u00E9n es Comprador" })), " ", supplier.name] }), _jsx("td", { children: formatRut(supplier.rut) }), _jsx("td", { children: supplier.email }), _jsx("td", { children: supplier.phone ? formatPhone(supplier.phone) : '-' }), _jsx("td", { children: supplier.address || '-' }), _jsx("td", { className: "text-center", children: _jsxs("div", { className: "btn-group", children: [_jsx("button", { className: "btn btn-sm btn-outline-success", onClick: () => navigate(`/proveedor/${supplier._id}`), title: "Ver detalle", children: _jsx("i", { className: "bi bi-eye" }) }), _jsx("button", { className: "btn btn-sm btn-outline-primary", onClick: () => openModal('edit', supplier), title: "Editar", children: _jsx("i", { className: "bi bi-pencil" }) }), _jsx("button", { className: "btn btn-sm btn-outline-danger", onClick: () => openModal('delete', supplier), title: "Eliminar", children: _jsx("i", { className: "bi bi-trash" }) })] }) })] }, supplier._id))) })] }) }) }) })) })), _jsx(SupplierModal, { isOpen: modalType !== null, modalType: modalType || 'view', selectedSupplier: selectedSupplier, loading: modalLoading, onClose: closeModal, onSubmit: handleModalSubmit })] }) }));
}
