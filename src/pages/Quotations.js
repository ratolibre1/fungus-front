import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import QuotationsBackground from '../components/QuotationsBackground';
import { getQuotations, deleteQuotation, updateQuotationStatus, createQuotation, updateQuotation, convertQuotationToSale } from '../services/quotationService';
import QuotationTable from '../components/quotations/QuotationTable';
import QuotationDetailsModal from '../components/quotations/QuotationDetailsModal';
import QuotationFormModal from '../components/quotations/QuotationFormModal';
export default function Quotations() {
    // Estado para los datos
    const [quotations, setQuotations] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        page: 1,
        limit: 20,
        hasNext: false,
        hasPrev: false
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Estado para los filtros
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        sortField: 'documentNumber',
        sortDirection: 'desc'
    });
    // Estado para modal
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    // Cargar datos de cotizaciones
    const loadQuotations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getQuotations(filters);
            setQuotations(response.data);
            setPagination(response.pagination);
        }
        catch (err) {
            console.error('Error al cargar cotizaciones:', err);
            setError('Ocurrió un error al cargar las cotizaciones. Por favor, intente nuevamente.');
        }
        finally {
            setLoading(false);
        }
    };
    // Cargar datos al montar el componente o cambiar filtros
    useEffect(() => {
        loadQuotations();
    }, [filters]);
    // Manejar cambio de página
    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };
    // Manejar cambio de límite por página
    const handleLimitChange = (limit) => {
        setFilters(prev => ({ ...prev, page: 1, limit }));
    };
    // Manejar ordenamiento
    const handleSort = (field, direction) => {
        setFilters(prev => ({
            ...prev,
            page: 1,
            sortField: field,
            sortDirection: direction
        }));
    };
    // Manejar ver detalles
    const handleViewDetails = (quotation) => {
        setSelectedQuotation(quotation);
        setShowDetailModal(true);
    };
    // Manejar edición
    const handleEditQuotation = (quotation) => {
        setSelectedQuotation(quotation);
        setShowEditModal(true);
    };
    // Manejar envío del formulario de cotización
    const handleQuotationSubmit = async (formData) => {
        setLoading(true);
        try {
            if (selectedQuotation) {
                // Actualizar cotización existente
                await updateQuotation(selectedQuotation._id, formData);
            }
            else {
                // Crear nueva cotización
                await createQuotation(formData);
            }
            loadQuotations(); // Recargar la lista
            setShowEditModal(false);
            setSelectedQuotation(null);
        }
        catch (err) {
            console.error('Error saving quotation:', err);
            setError('No se pudo guardar la cotización. Por favor, intente nuevamente.');
        }
        finally {
            setLoading(false);
        }
    };
    // Manejar eliminación
    const handleDeleteQuotation = (quotation) => {
        setSelectedQuotation(quotation);
        setShowDeleteModal(true);
    };
    // Confirmar eliminación
    const confirmDelete = async () => {
        if (!selectedQuotation)
            return;
        setLoading(true);
        try {
            await deleteQuotation(selectedQuotation._id);
            loadQuotations(); // Recargar la lista
            setShowDeleteModal(false);
        }
        catch (err) {
            console.error('Error al eliminar cotización:', err);
            setError('No se pudo eliminar la cotización. Por favor, intente nuevamente.');
        }
        finally {
            setLoading(false);
        }
    };
    // Cambiar estado de cotización
    const handleStatusChange = async (quotation, newStatus) => {
        setLoading(true);
        try {
            if (newStatus === 'converted') {
                const result = await convertQuotationToSale(quotation._id);
                // Mostrar notificación de éxito
                const alert = document.createElement('div');
                alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
                alert.style.top = '20px';
                alert.style.right = '20px';
                alert.style.zIndex = '9999';
                alert.innerHTML = `
          <i class="bi bi-check-circle-fill me-2"></i>
          <strong>¡Conversión exitosa!</strong> 
          Venta ${result.data.documentNumber} creada correctamente.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
                document.body.appendChild(alert);
                // Auto-ocultar después de 5 segundos
                setTimeout(() => {
                    alert.remove();
                }, 5000);
                console.log('✅ Cotización convertida a venta:', result.data);
            }
            else {
                await updateQuotationStatus(quotation._id, newStatus);
            }
            loadQuotations(); // Recargar la lista
        }
        catch (err) {
            console.error('Error al cambiar estado:', err);
            if (newStatus === 'converted') {
                setError('No se pudo convertir la cotización a venta. Por favor, intente nuevamente.');
            }
            else {
                setError('No se pudo cambiar el estado de la cotización. Por favor, intente nuevamente.');
            }
        }
        finally {
            setLoading(false);
        }
    };
    // Manejar cambios en los filtros
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 })); // Reset a primera página
    };
    // Resetear filtros
    const handleResetFilters = () => {
        setFilters({
            page: 1,
            limit: 20,
            sortField: 'documentNumber',
            sortDirection: 'desc'
        });
    };
    return (_jsx(Layout, { children: _jsxs("div", { className: "quotations-page-container", children: [_jsx(QuotationsBackground, {}), _jsxs("div", { className: "d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom", children: [_jsx("h1", { className: "h2 font-heading", style: { color: '#099347' }, children: "Cotizaciones" }), _jsx("div", { children: _jsxs("button", { className: "btn btn-sm btn-success me-2", onClick: () => {
                                    setSelectedQuotation(null);
                                    setShowEditModal(true);
                                }, children: [_jsx("i", { className: "bi bi-plus-lg me-1" }), " Nueva Cotizaci\u00F3n"] }) })] }), error && (_jsxs("div", { className: "alert alert-danger", role: "alert", children: [_jsx("i", { className: "bi bi-exclamation-triangle-fill me-2" }), error] })), _jsx("div", { className: "card mb-4 shadow-sm", children: _jsx("div", { className: "card-body", children: _jsxs("div", { className: "row g-3", children: [_jsxs("div", { className: "col-md-6 col-lg-3", children: [_jsx("label", { htmlFor: "status", className: "form-label", children: "Estado" }), _jsxs("select", { id: "status", name: "status", className: "form-select", value: filters.status || '', onChange: handleFilterChange, children: [_jsx("option", { value: "", children: "Todos" }), _jsx("option", { value: "pending", children: "Pendiente" }), _jsx("option", { value: "approved", children: "Aprobada" }), _jsx("option", { value: "rejected", children: "Rechazada" }), _jsx("option", { value: "converted", children: "Convertida" })] })] }), _jsxs("div", { className: "col-md-6 col-lg-3", children: [_jsx("label", { htmlFor: "startDate", className: "form-label", children: "Desde" }), _jsx("input", { type: "date", id: "startDate", name: "startDate", className: "form-control", value: filters.startDate || '', onChange: handleFilterChange })] }), _jsxs("div", { className: "col-md-6 col-lg-3", children: [_jsx("label", { htmlFor: "endDate", className: "form-label", children: "Hasta" }), _jsx("input", { type: "date", id: "endDate", name: "endDate", className: "form-control", value: filters.endDate || '', onChange: handleFilterChange })] }), _jsx("div", { className: "col-md-6 col-lg-3 d-flex align-items-end", children: _jsxs("div", { className: "d-grid gap-2 d-md-flex w-100", children: [_jsxs("button", { className: "btn btn-outline-primary me-md-2 flex-grow-1", type: "button", onClick: loadQuotations, children: [_jsx("i", { className: "bi bi-search me-1" }), " Buscar"] }), _jsxs("button", { className: "btn btn-outline-secondary flex-grow-1", type: "button", onClick: handleResetFilters, children: [_jsx("i", { className: "bi bi-x-circle me-1" }), " Limpiar"] })] }) })] }) }) }), _jsx(QuotationTable, { quotations: quotations, pagination: pagination, loading: loading, onPageChange: handlePageChange, onLimitChange: handleLimitChange, onViewDetails: handleViewDetails, onEditQuotation: handleEditQuotation, onDeleteQuotation: handleDeleteQuotation, onStatusChange: handleStatusChange, onSort: handleSort, initialSort: { field: 'documentNumber', direction: 'desc' } }), showDetailModal && (_jsx(QuotationDetailsModal, { quotation: selectedQuotation, onClose: () => setShowDetailModal(false), onEdit: () => {
                        setShowDetailModal(false);
                        setShowEditModal(true);
                    } })), showDeleteModal && selectedQuotation && (_jsxs(_Fragment, { children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1050 } }), _jsx("div", { className: "modal fade show", style: {
                                display: 'block',
                                zIndex: 1055,
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%'
                            }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog modal-dialog-centered", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h5", { className: "modal-title", children: "Confirmar eliminaci\u00F3n" }), _jsx("button", { type: "button", className: "btn-close", onClick: () => setShowDeleteModal(false), disabled: loading, "aria-label": "Cerrar" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("p", { children: ["\u00BFEst\u00E1 seguro que desea eliminar la cotizaci\u00F3n ", _jsx("strong", { children: selectedQuotation.documentNumber }), "?"] }), _jsxs("p", { className: "text-danger", children: [_jsx("i", { className: "bi bi-exclamation-triangle-fill me-2" }), "Esta acci\u00F3n no se puede deshacer."] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowDeleteModal(false), disabled: loading, children: "Cancelar" }), _jsx("button", { type: "button", className: "btn btn-danger", onClick: confirmDelete, disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), "Eliminando..."] })) : (_jsx(_Fragment, { children: "Eliminar" })) })] })] }) }) })] })), _jsx(QuotationFormModal, { quotation: selectedQuotation, isOpen: showEditModal, onClose: () => {
                        setShowEditModal(false);
                        setSelectedQuotation(null);
                    }, onSubmit: handleQuotationSubmit, loading: loading })] }) }));
}
