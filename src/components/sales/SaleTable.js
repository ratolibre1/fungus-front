import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { getSaleStatusLabel, getSaleStatusColor } from '../../types/sale';
import { formatCurrencyNoDecimals } from '../../utils/validators';
export default function SaleTable({ sales, pagination, loading, onPageChange, onLimitChange, onViewDetails, onEditSale, onDeleteSale, onStatusChange, onSort, initialSort }) {
    // Estado para manejar ordenamiento
    const [sortConfig, setSortConfig] = useState(initialSort ? { key: initialSort.field, direction: initialSort.direction } : null);
    // Estado para la entrada de página - validar que pagination existe
    const [pageInput, setPageInput] = useState((pagination?.page || 1).toString());
    // Manejar ordenamiento de columnas
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key) {
            direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        }
        setSortConfig({ key, direction });
        if (onSort) {
            onSort(key, direction);
        }
    };
    // Obtener el ícono de ordenamiento
    const getSortIcon = (key) => {
        if (!sortConfig || sortConfig.key !== key) {
            return _jsx("i", { className: "bi bi-arrow-down-square ms-1" });
        }
        return sortConfig.direction === 'asc'
            ? _jsx("i", { className: "bi bi-arrow-up-square-fill ms-1" })
            : _jsx("i", { className: "bi bi-arrow-down-square-fill ms-1" });
    };
    // Manejar cambio de página mediante input
    const handlePageInputChange = (e) => {
        setPageInput(e.target.value);
    };
    // Manejar envío del formulario de página
    const handlePageSubmit = (e) => {
        e.preventDefault();
        const page = parseInt(pageInput);
        const maxPages = pagination?.pages || 1;
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
            onPageChange(page);
        }
        else {
            setPageInput((pagination?.page || 1).toString());
        }
    };
    // Renderizar el indicador de carga
    if (loading) {
        return (_jsxs("div", { className: "text-center my-5", children: [_jsx("div", { className: "spinner-border", style: { color: '#099347' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "Cargando..." }) }), _jsx("p", { className: "mt-2", children: "Cargando ventas..." })] }));
    }
    // Renderizar mensaje si no hay ventas
    if (sales.length === 0) {
        return (_jsxs("div", { className: "alert alert-info text-center my-4", role: "alert", children: [_jsx("i", { className: "bi bi-info-circle me-2" }), "No se encontraron ventas con los filtros aplicados"] }));
    }
    // Formatear fecha
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('es-CL', options);
    };
    // Obtener icono del tipo de documento
    const getDocumentTypeIcon = (documentType) => {
        switch (documentType) {
            case 'factura':
                return _jsx("i", { className: "bi bi-receipt text-primary me-2", title: "Factura" });
            case 'boleta':
                return _jsx("i", { className: "bi bi-file-earmark text-success me-2", title: "Boleta" });
            default:
                return _jsx("i", { className: "bi bi-file-earmark-text text-secondary me-2" });
        }
    };
    // Generar paginador
    const renderPagination = () => {
        if (!pagination)
            return null;
        const { page, pages: totalPages, total, limit } = pagination;
        // Calcular el rango de elementos mostrados
        const startItem = (page - 1) * limit + 1;
        const endItem = Math.min(page * limit, total);
        return (_jsxs("div", { className: "d-flex flex-column flex-lg-row justify-content-between align-items-center mt-3 p-3 bg-light rounded", children: [_jsxs("div", { className: "d-flex flex-column flex-sm-row align-items-center mb-3 mb-lg-0", children: [_jsxs("span", { className: "text-muted mb-2 mb-sm-0 me-sm-3", children: ["Mostrando ", _jsxs("strong", { children: [startItem, "-", endItem] }), " de ", _jsx("strong", { children: total }), " registros"] }), _jsxs("div", { className: "d-flex align-items-center", children: [_jsx("label", { htmlFor: "page-size", className: "form-label me-2 mb-0 text-nowrap text-muted", children: "Registros por p\u00E1gina:" }), _jsxs("select", { id: "page-size", className: "form-select form-select-sm", value: limit, onChange: (e) => onLimitChange(parseInt(e.target.value)), style: { width: 'auto', minWidth: '70px' }, children: [_jsx("option", { value: "5", children: "5" }), _jsx("option", { value: "10", children: "10" }), _jsx("option", { value: "20", children: "20" }), _jsx("option", { value: "25", children: "25" }), _jsx("option", { value: "50", children: "50" }), _jsx("option", { value: "100", children: "100" })] })] })] }), totalPages > 1 && (_jsxs("div", { className: "d-flex align-items-center", children: [_jsx("nav", { "aria-label": "Paginaci\u00F3n de ventas", className: "me-3", children: _jsxs("ul", { className: "pagination pagination-sm mb-0", children: [_jsx("li", { className: `page-item ${!pagination.hasPrev ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => onPageChange(1), disabled: !pagination.hasPrev, title: "Primera p\u00E1gina", children: _jsx("i", { className: "bi bi-chevron-double-left" }) }) }), _jsx("li", { className: `page-item ${!pagination.hasPrev ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => onPageChange(page - 1), disabled: !pagination.hasPrev, title: "P\u00E1gina anterior", children: _jsx("i", { className: "bi bi-chevron-left" }) }) }), _jsx("li", { className: `page-item ${!pagination.hasNext ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => onPageChange(page + 1), disabled: !pagination.hasNext, title: "P\u00E1gina siguiente", children: _jsx("i", { className: "bi bi-chevron-right" }) }) }), _jsx("li", { className: `page-item ${!pagination.hasNext ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => onPageChange(totalPages), disabled: !pagination.hasNext, title: "\u00DAltima p\u00E1gina", children: _jsx("i", { className: "bi bi-chevron-double-right" }) }) })] }) }), _jsxs("form", { onSubmit: handlePageSubmit, className: "d-flex align-items-center", children: [_jsx("span", { className: "me-2 text-muted text-nowrap", children: "P\u00E1gina:" }), _jsx("input", { type: "text", className: "form-control form-control-sm", style: { width: '60px' }, value: pageInput, onChange: handlePageInputChange, "aria-label": "Ir a p\u00E1gina" }), _jsxs("span", { className: "mx-2 text-muted", children: ["de ", totalPages] })] })] }))] }));
    };
    // Mostrar el menú desplegable para cambio de estado
    const renderStatusDropdown = (sale) => {
        // Si está eliminada o es un estado final, no mostrar opciones
        if (sale.isDeleted || sale.status === 'paid') {
            return (_jsx("span", { className: `badge bg-${getSaleStatusColor(sale.status)}`, children: getSaleStatusLabel(sale.status) }));
        }
        return (_jsxs("div", { className: "dropdown", children: [_jsx("button", { className: "btn btn-sm dropdown-toggle", type: "button", "data-bs-toggle": "dropdown", "aria-expanded": "false", style: { backgroundColor: 'transparent', border: 'none', padding: '0' }, children: _jsx("span", { className: `badge bg-${getSaleStatusColor(sale.status)}`, children: getSaleStatusLabel(sale.status) }) }), _jsxs("ul", { className: "dropdown-menu dropdown-menu-end", style: { zIndex: 1050 }, children: [sale.status === 'pending' && (_jsx("li", { children: _jsxs("button", { className: "dropdown-item", onClick: () => onStatusChange(sale, 'invoiced'), children: [_jsx("i", { className: "bi bi-receipt me-2" }), "Facturar"] }) })), sale.status === 'invoiced' && (_jsx("li", { children: _jsxs("button", { className: "dropdown-item", onClick: () => onStatusChange(sale, 'paid'), children: [_jsx("i", { className: "bi bi-check-circle me-2" }), "Marcar como pagada"] }) }))] })] }));
    };
    // Renderizar botones de acción
    const renderActionButtons = (sale) => {
        // Según especificación backend:
        // - Solo se pueden editar si están en pending o invoiced
        // - Solo se pueden eliminar si están en pending
        const canEdit = (sale.status === 'pending' || sale.status === 'invoiced') && !sale.isDeleted;
        const canDelete = sale.status === 'pending' && !sale.isDeleted;
        return (_jsxs("div", { className: "btn-group", role: "group", children: [_jsx("button", { type: "button", className: "btn btn-sm btn-outline-primary", onClick: () => onViewDetails(sale), "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "Ver detalles", children: _jsx("i", { className: "bi bi-eye" }) }), canEdit && (_jsx("button", { type: "button", className: "btn btn-sm btn-outline-secondary", onClick: () => onEditSale(sale), "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "Editar venta", children: _jsx("i", { className: "bi bi-pencil" }) })), canDelete && (_jsx("button", { type: "button", className: "btn btn-sm btn-outline-danger", onClick: () => onDeleteSale(sale), "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "Eliminar venta", children: _jsx("i", { className: "bi bi-trash" }) }))] }));
    };
    return (_jsx("div", { className: "card shadow-sm", children: _jsxs("div", { className: "card-body", children: [_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover table-striped", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsxs("th", { onClick: () => handleSort('documentNumber'), style: { cursor: 'pointer' }, children: ["N\u00BA Documento", getSortIcon('documentNumber')] }), _jsxs("th", { onClick: () => handleSort('date'), style: { cursor: 'pointer' }, children: ["Fecha", getSortIcon('date')] }), _jsxs("th", { onClick: () => handleSort('counterparty'), style: { cursor: 'pointer' }, children: ["Cliente", getSortIcon('counterparty')] }), _jsxs("th", { className: "text-end", onClick: () => handleSort('totalAmount'), style: { cursor: 'pointer' }, children: ["Monto Total", getSortIcon('totalAmount')] }), _jsxs("th", { onClick: () => handleSort('status'), style: { cursor: 'pointer' }, children: ["Estado", getSortIcon('status')] }), _jsx("th", { className: "text-center", children: "Acciones" })] }) }), _jsx("tbody", { children: sales.map(sale => (_jsxs("tr", { children: [_jsxs("td", { children: [getDocumentTypeIcon(sale.documentType), sale.documentNumber] }), _jsx("td", { children: formatDate(sale.date) }), _jsx("td", { children: typeof sale.counterparty === 'object' ? (sale.counterparty.name) : (_jsxs("span", { className: "text-muted", children: ["ID: ", sale.counterparty] })) }), _jsx("td", { className: "text-end", children: formatCurrencyNoDecimals(sale.totalAmount) }), _jsx("td", { children: renderStatusDropdown(sale) }), _jsx("td", { className: "text-center", children: renderActionButtons(sale) })] }, sale._id))) })] }) }), renderPagination()] }) }));
}
