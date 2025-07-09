import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import PortalModal from '../common/PortalModal';
export default function LogCleanupModal({ onClose, onConfirm }) {
    const [daysToKeep, setDaysToKeep] = React.useState(30);
    const handleConfirm = () => {
        onConfirm(daysToKeep);
    };
    const handleDaysChange = (e) => {
        setDaysToKeep(parseInt(e.target.value));
    };
    const getEstimatedDeletions = () => {
        const currentDate = new Date();
        const cutoffDate = new Date(currentDate.getTime() - (daysToKeep * 24 * 60 * 60 * 1000));
        return cutoffDate.toLocaleDateString('es-CL');
    };
    return (_jsxs(PortalModal, { isOpen: true, onClose: onClose, children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1050 }, onClick: onClose }), _jsx("div", { className: "modal fade show", style: {
                    display: 'block',
                    zIndex: 1055
                }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h5", { className: "modal-title", children: "Limpiar registros antiguos" }), _jsx("button", { type: "button", className: "btn-close", onClick: onClose, "aria-label": "Cerrar" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "alert alert-warning", children: [_jsx("i", { className: "bi bi-exclamation-triangle-fill me-2" }), _jsx("strong", { children: "\u00A1Atenci\u00F3n!" }), " Esta acci\u00F3n no se puede deshacer."] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: "daysToKeep", className: "form-label", children: "Mantener registros de los \u00FAltimos:" }), _jsxs("select", { id: "daysToKeep", className: "form-select", value: daysToKeep, onChange: handleDaysChange, children: [_jsx("option", { value: 7, children: "7 d\u00EDas" }), _jsx("option", { value: 15, children: "15 d\u00EDas" }), _jsx("option", { value: 30, children: "30 d\u00EDas" }), _jsx("option", { value: 60, children: "60 d\u00EDas" }), _jsx("option", { value: 90, children: "90 d\u00EDas" })] })] }), _jsxs("p", { className: "text-muted", children: ["Se eliminar\u00E1n todos los registros anteriores al ", _jsx("strong", { children: getEstimatedDeletions() }), "."] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: onClose, children: "Cancelar" }), _jsxs("button", { type: "button", className: "btn btn-danger", onClick: handleConfirm, children: [_jsx("i", { className: "bi bi-trash me-1" }), " Limpiar registros"] })] })] }) }) })] }));
}
