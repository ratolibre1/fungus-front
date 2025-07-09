import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import PortalModal from '../common/PortalModal';
import { formatDate } from '../../utils/dateUtils';
export default function LogDeleteModal({ log, onClose, onConfirm }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    if (!log)
        return null;
    const handleConfirm = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await onConfirm(log._id);
            onClose();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar el registro');
        }
        finally {
            setIsLoading(false);
        }
    };
    // Mostrar etiqueta de operación con color
    const operationBadge = () => {
        const operation = log.operation;
        const style = {
            create: 'success',
            update: 'primary',
            delete: 'danger'
        }[operation] || 'secondary';
        const label = {
            create: 'Creación',
            update: 'Actualización',
            delete: 'Eliminación'
        }[operation] || operation;
        return _jsx("span", { className: `badge bg-${style}`, children: label });
    };
    return (_jsxs(PortalModal, { isOpen: true, onClose: onClose, children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1050 }, onClick: onClose }), _jsx("div", { className: "modal fade show", style: {
                    display: 'block',
                    zIndex: 1055
                }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h5", { className: "modal-title", children: "Confirmar eliminaci\u00F3n" }), _jsx("button", { type: "button", className: "btn-close", onClick: onClose, disabled: isLoading, "aria-label": "Cerrar" })] }), _jsxs("div", { className: "modal-body", children: [error && (_jsxs("div", { className: "alert alert-danger", role: "alert", children: [_jsx("i", { className: "bi bi-exclamation-triangle-fill me-2" }), error] })), _jsxs("p", { children: ["\u00BFEst\u00E1s seguro de que deseas eliminar este registro de actividad?", _jsx("br", {}), _jsx("span", { className: "text-danger", children: "Esta acci\u00F3n no se puede deshacer." })] }), _jsx("div", { className: "card bg-light mt-3", children: _jsxs("div", { className: "card-body", children: [_jsx("h6", { className: "card-subtitle mb-2 text-muted", children: "Detalles del registro" }), _jsxs("ul", { className: "list-group list-group-flush", children: [_jsxs("li", { className: "list-group-item d-flex justify-content-between align-items-center", children: [_jsx("span", { children: "ID:" }), _jsx("span", { className: "text-truncate", style: { maxWidth: '200px' }, children: log._id })] }), _jsxs("li", { className: "list-group-item d-flex justify-content-between align-items-center", children: [_jsx("span", { children: "Fecha:" }), _jsx("span", { children: formatDate(log.createdAt) })] }), _jsxs("li", { className: "list-group-item d-flex justify-content-between align-items-center", children: [_jsx("span", { children: "Operaci\u00F3n:" }), operationBadge()] }), _jsxs("li", { className: "list-group-item d-flex justify-content-between align-items-center", children: [_jsx("span", { children: "Colecci\u00F3n:" }), _jsx("span", { children: log.collectionType })] })] })] }) })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: onClose, disabled: isLoading, children: "Cancelar" }), _jsx("button", { type: "button", className: "btn btn-danger", onClick: handleConfirm, disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), "Eliminando..."] })) : (_jsxs(_Fragment, { children: [_jsx("i", { className: "bi bi-trash-fill me-1" }), "Eliminar"] })) })] })] }) }) })] }));
}
