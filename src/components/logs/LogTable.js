import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export default function LogTable({ logs, pagination, loading, onPageChange, onViewDetails, onDeleteLog }) {
    // Renderizar el indicador de carga
    if (loading) {
        return (_jsxs("div", { className: "text-center my-5", children: [_jsx("div", { className: "spinner-border", style: { color: '#099347' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "Cargando..." }) }), _jsx("p", { className: "mt-2", children: "Cargando registros..." })] }));
    }
    // Renderizar mensaje si no hay logs
    if (logs.length === 0) {
        return (_jsxs("div", { className: "alert alert-info text-center my-4", role: "alert", children: [_jsx("i", { className: "bi bi-info-circle me-2" }), "No se encontraron registros con los filtros aplicados"] }));
    }
    // Mapeo de operaciones a etiquetas con colores
    const operationLabel = (operation) => {
        switch (operation) {
            case 'create':
                return _jsx("span", { className: "badge bg-success", children: "Creaci\u00F3n" });
            case 'update':
                return _jsx("span", { className: "badge bg-primary", children: "Actualizaci\u00F3n" });
            case 'delete':
                return _jsx("span", { className: "badge bg-danger", children: "Eliminaci\u00F3n" });
            default:
                return _jsx("span", { className: "badge bg-secondary", children: operation });
        }
    };
    // Mapeo de colecciones a nombres legibles
    const collectionLabel = (collection) => {
        const collections = {
            'product': 'Productos',
            'consumable': 'Insumos',
            'contact': 'Contactos',
            'quotation': 'Cotizaciones',
            'sale': 'Ventas',
            'purchase': 'Compras'
        };
        return collections[collection] || collection;
    };
    // Función para formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount);
    };
    // Función para obtener información clave del log
    const getKeyInfo = (log) => {
        const details = log.details;
        // Para transacciones (cotizaciones, ventas, compras)
        if (log.collectionType === 'quotation' || log.collectionType === 'sale' || log.collectionType === 'purchase') {
            const transactionDetails = details;
            if (transactionDetails.documentNumber) {
                const subtitle = transactionDetails.counterparty?.name ||
                    transactionDetails.transactionInfo?.counterparty ||
                    'Contraparte no disponible';
                let badge = '';
                if (transactionDetails.operationType === 'STATUS_CHANGE') {
                    badge = `${transactionDetails.statusTransition?.from} → ${transactionDetails.statusTransition?.to}`;
                }
                else if (transactionDetails.operationType === 'QUOTATION_CONVERSION') {
                    badge = 'Conversión desde cotización';
                }
                else if (transactionDetails.totalAmount) {
                    badge = formatCurrency(transactionDetails.totalAmount);
                }
                return {
                    title: transactionDetails.documentNumber,
                    subtitle,
                    badge
                };
            }
        }
        // Para contactos
        if (log.collectionType === 'contact') {
            const contactDetails = details;
            if (contactDetails.contactName) {
                let badge = '';
                if (contactDetails.operationType) {
                    const operationMap = {
                        'CLIENT_CREATION': 'Nuevo Cliente',
                        'SUPPLIER_CREATION': 'Nuevo Proveedor',
                        'CONTACT_CREATION': 'Nuevo Contacto',
                        'CONTACT_REACTIVATION': 'Reactivado',
                        'ROLE_CHANGE': 'Cambio de Rol',
                        'MARK_AS_REVIEWED': 'Revisado'
                    };
                    badge = operationMap[contactDetails.operationType] || contactDetails.operationType;
                }
                return {
                    title: contactDetails.contactName,
                    subtitle: contactDetails.contactRut,
                    badge
                };
            }
        }
        // Para items (productos/consumibles)
        if (log.collectionType === 'product' || log.collectionType === 'consumable') {
            const itemDetails = details;
            if (itemDetails.itemName) {
                let badge = '';
                if (itemDetails.priceImpact?.percentageChange) {
                    badge = `Precio ${itemDetails.priceImpact.percentageChange}`;
                }
                else if (itemDetails.stockImpact?.difference) {
                    badge = `Stock ${itemDetails.stockImpact.difference > 0 ? '+' : ''}${itemDetails.stockImpact.difference}`;
                }
                else if (itemDetails.financialImpact?.stockValue) {
                    badge = `Valor: ${formatCurrency(itemDetails.financialImpact.stockValue)}`;
                }
                else if (itemDetails.pricing?.netPrice) {
                    badge = formatCurrency(itemDetails.pricing.netPrice);
                }
                return {
                    title: itemDetails.itemName,
                    subtitle: itemDetails.itemType === 'Product' ? 'Producto' : 'Insumo',
                    badge
                };
            }
        }
        // Fallback para logs sin información enriquecida
        return {
            title: `ID: ${log.documentId.substring(0, 8)}...`,
            subtitle: undefined,
            badge: undefined
        };
    };
    // Generar paginador
    const renderPagination = () => {
        const { page, totalPages } = pagination;
        // Si no hay suficientes páginas, no mostrar paginador
        if (totalPages <= 1)
            return null;
        // Generar array de páginas a mostrar
        let pages = [];
        // Mostrar siempre primera y última página
        // Y algunas páginas alrededor de la actual
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || // Primera página
                i === totalPages || // Última página
                (i >= page - 2 && i <= page + 2) // Páginas cercanas a la actual
            ) {
                pages.push(i);
            }
            else if ((i === page - 3 && page > 3) || // Puntos suspensivos antes
                (i === page + 3 && page < totalPages - 2) // Puntos suspensivos después
            ) {
                pages.push(-i); // Usamos número negativo para indicar puntos suspensivos
            }
        }
        // Eliminar duplicados y ordenar
        pages = [...new Set(pages)].sort((a, b) => Math.abs(a) - Math.abs(b));
        return (_jsx("nav", { "aria-label": "Paginaci\u00F3n de logs", children: _jsxs("ul", { className: "pagination justify-content-center", children: [_jsx("li", { className: `page-item ${page === 1 ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => onPageChange(page - 1), disabled: page === 1, children: _jsx("i", { className: "bi bi-chevron-left" }) }) }), pages.map(p => (p < 0 ? (
                    // Puntos suspensivos
                    _jsx("li", { className: "page-item disabled", children: _jsx("span", { className: "page-link", children: "..." }) }, p)) : (
                    // Número de página
                    _jsx("li", { className: `page-item ${p === page ? 'active' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => onPageChange(p), style: p === page ? { backgroundColor: '#099347', borderColor: '#099347' } : {}, children: p }) }, p)))), _jsx("li", { className: `page-item ${page === totalPages ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => onPageChange(page + 1), disabled: page === totalPages, children: _jsx("i", { className: "bi bi-chevron-right" }) }) })] }) }));
    };
    return (_jsxs("div", { className: "table-responsive", children: [_jsxs("table", { className: "table table-hover table-striped", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: "Fecha" }), _jsx("th", { scope: "col", children: "Usuario" }), _jsx("th", { scope: "col", children: "Operaci\u00F3n" }), _jsx("th", { scope: "col", children: "Colecci\u00F3n" }), _jsx("th", { scope: "col", children: "Informaci\u00F3n Clave" }), _jsx("th", { scope: "col", className: "text-center", children: "Acciones" })] }) }), _jsx("tbody", { children: logs.map(log => {
                            const keyInfo = getKeyInfo(log);
                            return (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { children: new Date(log.createdAt).toLocaleDateString('es-CL') }), _jsx("small", { className: "text-muted", children: new Date(log.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) })] }), _jsx("td", { children: typeof log.userId === 'object' && log.userId ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "fw-medium", children: log.userId.name }), _jsx("small", { className: "text-muted", children: log.userId.email })] })) : (_jsxs("span", { className: "text-muted", children: ["ID: ", log.userId] })) }), _jsx("td", { children: operationLabel(log.operation) }), _jsx("td", { children: _jsx("span", { className: "badge bg-light text-dark border", children: collectionLabel(log.collectionType) }) }), _jsx("td", { children: _jsxs("div", { className: "d-flex flex-column", children: [_jsx("div", { className: "fw-medium text-truncate", style: { maxWidth: '200px' }, title: keyInfo.title, children: keyInfo.title }), keyInfo.subtitle && (_jsx("small", { className: "text-muted text-truncate", style: { maxWidth: '200px' }, title: keyInfo.subtitle, children: keyInfo.subtitle })), keyInfo.badge && (_jsx("span", { className: "badge bg-info mt-1 align-self-start", style: { fontSize: '0.7rem' }, children: keyInfo.badge }))] }) }), _jsx("td", { className: "text-center", children: _jsxs("div", { className: "btn-group", role: "group", children: [_jsx("button", { type: "button", className: "btn btn-sm btn-outline-primary", onClick: () => onViewDetails(log), "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "Ver detalles", children: _jsx("i", { className: "bi bi-eye" }) }), _jsx("button", { type: "button", className: "btn btn-sm btn-outline-danger", onClick: () => onDeleteLog(log), "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "Eliminar registro", children: _jsx("i", { className: "bi bi-trash" }) })] }) })] }, log._id));
                        }) })] }), _jsxs("div", { className: "d-flex justify-content-between align-items-center mt-3", children: [_jsxs("div", { className: "text-muted small", children: ["Mostrando ", logs.length, " de ", pagination.total, " registros", pagination.total > 0 && (_jsxs("span", { children: [" (p\u00E1gina ", pagination.page, " de ", pagination.totalPages, ")"] }))] }), renderPagination()] })] }));
}
