import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
// Función para formatear moneda localmente
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(amount);
};
export default function QuotationTable({ quotations, pagination, loading, onPageChange, onLimitChange, onViewDetails, onEditQuotation, onDeleteQuotation, onStatusChange, onSort, initialSort }) {
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
    // Obtener el ícono de ordenamiento estilo productos
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
        return (_jsxs("div", { className: "text-center my-5", children: [_jsx("div", { className: "spinner-border", style: { color: '#099347' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "Cargando..." }) }), _jsx("p", { className: "mt-2", children: "Cargando cotizaciones..." })] }));
    }
    // Renderizar mensaje si no hay cotizaciones
    if (quotations.length === 0) {
        return (_jsxs("div", { className: "alert alert-info text-center my-4", role: "alert", children: [_jsx("i", { className: "bi bi-info-circle me-2" }), "No se encontraron cotizaciones con los filtros aplicados"] }));
    }
    // Mapeo de estados a etiquetas con colores - tamaño estandarizado
    const statusLabel = (status) => {
        const badgeClass = "badge fs-8"; // fs-8 para tamaño estándar
        switch (status) {
            case 'pending':
                return _jsx("span", { className: `${badgeClass} bg-warning text-dark`, children: "Pendiente" });
            case 'approved':
                return _jsx("span", { className: `${badgeClass} bg-success`, children: "Aprobada" });
            case 'rejected':
                return _jsx("span", { className: `${badgeClass} bg-danger`, children: "Rechazada" });
            case 'converted':
                return _jsx("span", { className: `${badgeClass} bg-primary`, children: "Convertida" });
            default:
                return _jsx("span", { className: `${badgeClass} bg-secondary`, children: status });
        }
    };
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
    // Generar paginador mejorado y bonito
    const renderPagination = () => {
        if (!pagination)
            return null;
        const { page, pages: totalPages, total, limit } = pagination;
        // Calcular el rango de elementos mostrados
        const startItem = (page - 1) * limit + 1;
        const endItem = Math.min(page * limit, total);
        return (_jsxs("div", { className: "d-flex flex-column flex-lg-row justify-content-between align-items-center mt-3 p-3 bg-light rounded", children: [_jsxs("div", { className: "d-flex flex-column flex-sm-row align-items-center mb-3 mb-lg-0", children: [_jsxs("span", { className: "text-muted mb-2 mb-sm-0 me-sm-3", children: ["Mostrando ", _jsxs("strong", { children: [startItem, "-", endItem] }), " de ", _jsx("strong", { children: total }), " registros"] }), _jsxs("div", { className: "d-flex align-items-center", children: [_jsx("label", { htmlFor: "page-size", className: "form-label me-2 mb-0 text-nowrap text-muted", children: "Registros por p\u00E1gina:" }), _jsxs("select", { id: "page-size", className: "form-select form-select-sm", value: limit, onChange: (e) => onLimitChange(parseInt(e.target.value)), style: { width: 'auto', minWidth: '70px' }, children: [_jsx("option", { value: "5", children: "5" }), _jsx("option", { value: "10", children: "10" }), _jsx("option", { value: "20", children: "20" }), _jsx("option", { value: "25", children: "25" }), _jsx("option", { value: "50", children: "50" }), _jsx("option", { value: "100", children: "100" })] })] })] }), totalPages > 1 && (_jsxs("div", { className: "d-flex align-items-center", children: [_jsx("nav", { "aria-label": "Paginaci\u00F3n de cotizaciones", className: "me-3", children: _jsxs("div", { className: "btn-group", role: "group", children: [_jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => onPageChange(1), disabled: page === 1, title: "Primera p\u00E1gina", children: _jsx("i", { className: "bi bi-chevron-double-left" }) }), _jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => onPageChange(page - 1), disabled: page === 1, title: "P\u00E1gina anterior", children: _jsx("i", { className: "bi bi-chevron-left" }) }), (() => {
                                        // Generar array de páginas a mostrar
                                        let pages = [];
                                        // Mostrar siempre primera y última página
                                        // Y algunas páginas alrededor de la actual
                                        for (let i = 1; i <= totalPages; i++) {
                                            if (i === 1 || // Primera página
                                                i === totalPages || // Última página
                                                (i >= page - 1 && i <= page + 1) // Páginas cercanas a la actual
                                            ) {
                                                pages.push(i);
                                            }
                                            else if ((i === page - 2 && page > 3) || // Puntos suspensivos antes
                                                (i === page + 2 && page < totalPages - 2) // Puntos suspensivos después
                                            ) {
                                                pages.push(-i); // Usamos número negativo para indicar puntos suspensivos
                                            }
                                        }
                                        // Eliminar duplicados y ordenar
                                        pages = [...new Set(pages)].sort((a, b) => Math.abs(a) - Math.abs(b));
                                        return pages.map(p => (p < 0 ? (_jsx("button", { className: "btn btn-outline-secondary btn-sm", disabled: true, children: "..." }, p)) : (_jsx("button", { className: `btn btn-sm ${p === page ? 'btn-success' : 'btn-outline-secondary'}`, onClick: () => onPageChange(p), style: p === page ? { backgroundColor: '#099347', borderColor: '#099347' } : {}, children: p }, p))));
                                    })(), _jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => onPageChange(page + 1), disabled: page === totalPages, title: "P\u00E1gina siguiente", children: _jsx("i", { className: "bi bi-chevron-right" }) }), _jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => onPageChange(totalPages), disabled: page === totalPages, title: "\u00DAltima p\u00E1gina", children: _jsx("i", { className: "bi bi-chevron-double-right" }) })] }) }), _jsxs("form", { onSubmit: handlePageSubmit, className: "d-flex align-items-center", children: [_jsx("span", { className: "me-2 text-muted text-nowrap", children: "P\u00E1gina:" }), _jsx("input", { type: "text", className: "form-control form-control-sm", style: { width: '60px' }, value: pageInput, onChange: handlePageInputChange, "aria-label": "Ir a p\u00E1gina" }), _jsxs("span", { className: "mx-2 text-muted", children: ["de ", totalPages] })] })] }))] }));
    };
    // Mostrar el menú desplegable para cambio de estado
    const renderStatusDropdown = (quotation) => {
        // Si está eliminada o convertida, no mostrar opciones para cambiar estado
        if (quotation.isDeleted || quotation.status === 'converted') {
            return statusLabel(quotation.status);
        }
        return (_jsxs("div", { className: "dropdown", children: [_jsx("button", { className: "btn btn-sm dropdown-toggle", type: "button", "data-bs-toggle": "dropdown", "aria-expanded": "false", style: { backgroundColor: 'transparent', border: 'none', padding: '0' }, children: statusLabel(quotation.status) }), _jsxs("ul", { className: "dropdown-menu dropdown-menu-end", style: { zIndex: 1050 }, children: [quotation.status !== 'approved' && (_jsx("li", { children: _jsxs("button", { className: "dropdown-item", onClick: () => onStatusChange(quotation, 'pending'), disabled: quotation.status === 'pending', children: [_jsx("i", { className: "bi bi-hourglass me-2" }), "Pendiente"] }) })), _jsx("li", { children: _jsxs("button", { className: "dropdown-item", onClick: () => onStatusChange(quotation, 'approved'), disabled: quotation.status === 'approved' || quotation.status === 'rejected', children: [_jsx("i", { className: "bi bi-check-circle me-2" }), "Aprobar"] }) }), _jsx("li", { children: _jsxs("button", { className: "dropdown-item", onClick: () => onStatusChange(quotation, 'rejected'), disabled: quotation.status === 'rejected', children: [_jsx("i", { className: "bi bi-x-circle me-2" }), "Rechazar"] }) }), quotation.status === 'approved' && (_jsx("li", { children: _jsxs("button", { className: "dropdown-item", onClick: () => onStatusChange(quotation, 'converted'), children: [_jsx("i", { className: "bi bi-arrow-right-circle me-2" }), "Convertir a venta"] }) }))] })] }));
    };
    // Renderizar botones de acción - ocultar en lugar de deshabilitar
    const renderActionButtons = (quotation) => {
        const canEdit = quotation.status !== 'converted' && !quotation.isDeleted;
        const canDelete = quotation.status !== 'converted' && !quotation.isDeleted;
        return (_jsxs("div", { className: "btn-group", role: "group", children: [_jsx("button", { type: "button", className: "btn btn-sm btn-outline-primary", onClick: () => onViewDetails(quotation), "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "Ver detalles", children: _jsx("i", { className: "bi bi-eye" }) }), canEdit && (_jsx("button", { type: "button", className: "btn btn-sm btn-outline-secondary", onClick: () => onEditQuotation(quotation), "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "Editar cotizaci\u00F3n", children: _jsx("i", { className: "bi bi-pencil" }) })), canDelete && (_jsx("button", { type: "button", className: "btn btn-sm btn-outline-danger", onClick: () => onDeleteQuotation(quotation), "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "Eliminar cotizaci\u00F3n", children: _jsx("i", { className: "bi bi-trash" }) }))] }));
    };
    return (_jsx("div", { className: "card shadow-sm", children: _jsxs("div", { className: "card-body", children: [_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover table-striped", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsxs("th", { onClick: () => handleSort('documentNumber'), style: { cursor: 'pointer' }, children: ["N\u00BA Documento", getSortIcon('documentNumber')] }), _jsxs("th", { onClick: () => handleSort('date'), style: { cursor: 'pointer' }, children: ["Fecha", getSortIcon('date')] }), _jsxs("th", { onClick: () => handleSort('counterparty'), style: { cursor: 'pointer' }, children: ["Cliente", getSortIcon('counterparty')] }), _jsxs("th", { className: "text-end", onClick: () => handleSort('totalAmount'), style: { cursor: 'pointer' }, children: ["Monto Total", getSortIcon('totalAmount')] }), _jsxs("th", { onClick: () => handleSort('status'), style: { cursor: 'pointer' }, children: ["Estado", getSortIcon('status')] }), _jsx("th", { className: "text-center", children: "Acciones" })] }) }), _jsx("tbody", { children: quotations.map(quotation => (_jsxs("tr", { children: [_jsxs("td", { children: [getDocumentTypeIcon(quotation.documentType), quotation.documentNumber] }), _jsx("td", { children: formatDate(quotation.date) }), _jsx("td", { children: typeof quotation.counterparty === 'object' ? (quotation.counterparty.name) : (_jsxs("span", { className: "text-muted", children: ["ID: ", quotation.counterparty] })) }), _jsx("td", { className: "text-end", children: formatCurrency(quotation.totalAmount) }), _jsx("td", { children: renderStatusDropdown(quotation) }), _jsx("td", { className: "text-center", children: renderActionButtons(quotation) })] }, quotation._id))) })] }) }), renderPagination()] }) }));
}
