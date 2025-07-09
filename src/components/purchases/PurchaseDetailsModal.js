import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { getPurchaseStatusLabel, getPurchaseStatusColor } from '../../types/purchase';
import { formatCurrency, formatCurrencyNoDecimals } from '../../utils/validators';
import PortalModal from '../common/PortalModal';
export default function PurchaseDetailsModal({ purchase, onClose, onEdit }) {
    if (!purchase)
        return null;
    // Formatear fecha sin horario (solo día/mes/año)
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('es-CL', options);
    };
    // Función para formatear el tipo de documento
    const formatDocumentType = (documentType) => {
        switch (documentType) {
            case 'boleta':
                return _jsx("span", { className: "badge bg-info text-dark", children: "Boleta" });
            case 'factura':
                return _jsx("span", { className: "badge bg-primary", children: "Factura" });
            default:
                return _jsx("span", { className: "badge bg-secondary", children: documentType });
        }
    };
    // Obtener badge del estado
    const statusBadge = (status) => {
        return (_jsx("span", { className: `badge bg-${getPurchaseStatusColor(status)}`, children: getPurchaseStatusLabel(status) }));
    };
    // Manejar click en nombre del proveedor para ir a detalle del proveedor
    const handleProviderClick = () => {
        if (typeof purchase.counterparty === 'object' && purchase.counterparty._id) {
            // Navegar a la página de detalle del proveedor
            window.location.href = `/proveedor/${purchase.counterparty._id}`;
        }
    };
    // Obtener nombre del usuario comprador
    const getUserName = () => {
        return typeof purchase.user === 'object' ? purchase.user.name : purchase.user;
    };
    return (_jsxs(PortalModal, { isOpen: true, onClose: onClose, children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1050 }, onClick: onClose }), _jsx("div", { className: "modal fade show", style: {
                    display: 'block',
                    zIndex: 1055
                }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("h5", { className: "modal-title", children: ["Detalles de Compra ", purchase.documentNumber] }), _jsx("button", { type: "button", className: "btn-close", onClick: onClose, "aria-label": "Cerrar" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "row mb-4", children: [_jsxs("div", { className: "col-md-6", children: [_jsx("h6", { className: "mb-3", children: "Informaci\u00F3n General" }), _jsxs("p", { children: [_jsx("strong", { children: "Fecha:" }), " ", formatDate(purchase.date)] }), _jsxs("p", { children: [_jsx("strong", { children: "Tipo de documento:" }), " ", formatDocumentType(purchase.documentType)] }), _jsxs("p", { children: [_jsx("strong", { children: "Estado:" }), " ", statusBadge(purchase.status)] }), _jsxs("p", { children: [_jsx("strong", { children: "Correlativo:" }), " ", purchase.correlative] }), _jsxs("p", { children: [_jsx("strong", { children: "Comprador:" }), " ", getUserName()] })] }), _jsxs("div", { className: "col-md-6", children: [_jsx("h6", { className: "mb-3", children: "Proveedor" }), typeof purchase.counterparty === 'object' ? (_jsxs(_Fragment, { children: [_jsxs("p", { children: [_jsx("strong", { children: "Nombre:" }), ' ', _jsx("button", { type: "button", className: "btn btn-link p-0 text-decoration-underline", style: { fontSize: 'inherit', color: '#0d6efd' }, onClick: handleProviderClick, title: "Ver detalles del proveedor", children: purchase.counterparty.name })] }), purchase.counterparty.rut && (_jsxs("p", { children: [_jsx("strong", { children: "RUT:" }), " ", purchase.counterparty.rut] })), purchase.counterparty.email && (_jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", purchase.counterparty.email] })), purchase.counterparty.phone && (_jsxs("p", { children: [_jsx("strong", { children: "Tel\u00E9fono:" }), " ", purchase.counterparty.phone] })), purchase.counterparty.address && (_jsxs("p", { children: [_jsx("strong", { children: "Direcci\u00F3n:" }), " ", purchase.counterparty.address] }))] })) : (_jsxs("p", { children: [_jsx("strong", { children: "ID Proveedor:" }), " ", purchase.counterparty] }))] })] }), _jsx("h6", { className: "mb-3", children: "Detalle de Productos" }), _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-sm table-bordered", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { style: { minWidth: '250px' }, children: "Producto" }), _jsx("th", { className: "text-end", children: "Cantidad" }), _jsx("th", { className: "text-end", children: "Precio Unit." }), _jsx("th", { className: "text-end", children: "Descuento" }), _jsx("th", { className: "text-end", children: "Subtotal" })] }) }), _jsx("tbody", { children: purchase.items.map((item, index) => (_jsxs("tr", { children: [_jsx("td", { children: typeof item.itemDetail === 'object' ? (_jsxs("div", { children: [_jsx("strong", { children: item.itemDetail.name }), _jsx("br", {}), _jsxs("small", { className: "text-muted", children: [item.itemDetail.description, item.itemDetail.dimensions && ` (${item.itemDetail.dimensions})`] })] })) : (_jsxs("span", { className: "text-muted", children: ["ID: ", item.itemDetail] })) }), _jsx("td", { className: "text-end", children: item.quantity }), _jsx("td", { className: "text-end", children: formatCurrency(item.unitPrice) }), _jsx("td", { className: "text-end", children: formatCurrencyNoDecimals(item.discount) }), _jsx("td", { className: "text-end", children: formatCurrencyNoDecimals(item.subtotal) })] }, item._id || index))) }), _jsxs("tfoot", { className: "table-light", children: [_jsxs("tr", { children: [_jsx("td", { colSpan: 4, className: "text-end", children: _jsx("strong", { children: "Neto" }) }), _jsx("td", { className: "text-end", children: formatCurrencyNoDecimals(purchase.netAmount) })] }), _jsxs("tr", { children: [_jsx("td", { colSpan: 4, className: "text-end", children: _jsx("strong", { children: "IVA (19%)" }) }), _jsx("td", { className: "text-end", children: formatCurrencyNoDecimals(purchase.taxAmount) })] }), _jsxs("tr", { children: [_jsx("td", { colSpan: 4, className: "text-end", children: _jsx("strong", { children: "Total" }) }), _jsx("td", { className: "text-end", children: formatCurrencyNoDecimals(purchase.totalAmount) })] })] })] }) }), purchase.observations && (_jsxs("div", { className: "mt-4", children: [_jsx("h6", { className: "mb-3", children: "Observaciones" }), _jsxs("div", { className: "alert alert-light border", role: "alert", children: [_jsx("i", { className: "bi bi-info-circle me-2" }), purchase.observations] })] }))] }), _jsxs("div", { className: "modal-footer", children: [onEdit && (_jsxs("button", { type: "button", className: "btn btn-primary me-2", onClick: onEdit, children: [_jsx("i", { className: "bi bi-pencil-square me-1" }), "Editar"] })), _jsx("button", { type: "button", className: "btn btn-secondary", onClick: onClose, children: "Cerrar" })] })] }) }) })] }));
}
