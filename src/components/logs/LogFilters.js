import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export default function LogFilters({ filters, onApplyFilters }) {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);
    // Actualizar filtros locales cuando cambian los props
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onApplyFilters(localFilters);
    };
    const handleReset = () => {
        const defaultFilters = {
            page: 1,
            limit: 10
        };
        setLocalFilters(defaultFilters);
        onApplyFilters(defaultFilters);
    };
    return (_jsxs("div", { className: "card mb-4", children: [_jsxs("div", { className: "card-header d-flex justify-content-between align-items-center", style: { backgroundColor: '#f8f9fa', cursor: 'pointer' }, onClick: () => setIsOpen(!isOpen), children: [_jsxs("h5", { className: "mb-0", children: [_jsx("i", { className: `bi bi-funnel me-2 ${isOpen ? 'bi-funnel-fill' : 'bi-funnel'}` }), "Filtrar registros"] }), _jsx("button", { className: "btn btn-sm", style: { color: '#099347' }, type: "button", children: _jsx("i", { className: `bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}` }) })] }), _jsx("div", { className: `card-body ${isOpen ? '' : 'd-none'}`, children: _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-md-6 col-lg-3 mb-3", children: [_jsx("label", { htmlFor: "operation", className: "form-label", children: "Operaci\u00F3n" }), _jsxs("select", { id: "operation", name: "operation", className: "form-select", value: localFilters.operation || '', onChange: handleInputChange, children: [_jsx("option", { value: "", children: "Todas las operaciones" }), _jsx("option", { value: "create", children: "Creaci\u00F3n" }), _jsx("option", { value: "update", children: "Actualizaci\u00F3n" }), _jsx("option", { value: "delete", children: "Eliminaci\u00F3n" })] })] }), _jsxs("div", { className: "col-md-6 col-lg-3 mb-3", children: [_jsx("label", { htmlFor: "collection", className: "form-label", children: "Colecci\u00F3n" }), _jsxs("select", { id: "collection", name: "collection", className: "form-select", value: localFilters.collection || '', onChange: handleInputChange, children: [_jsx("option", { value: "", children: "Todas las colecciones" }), _jsx("option", { value: "product", children: "Productos" }), _jsx("option", { value: "consumable", children: "Insumos" }), _jsx("option", { value: "contact", children: "Contactos" }), _jsx("option", { value: "quotation", children: "Cotizaciones" }), _jsx("option", { value: "sale", children: "Ventas" }), _jsx("option", { value: "purchase", children: "Compras" })] })] }), _jsxs("div", { className: "col-md-6 col-lg-3 mb-3", children: [_jsx("label", { htmlFor: "startDate", className: "form-label", children: "Fecha inicial" }), _jsx("input", { type: "date", id: "startDate", name: "startDate", className: "form-control", value: localFilters.startDate || '', onChange: handleInputChange, "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "Fecha de inicio para filtrar logs" })] }), _jsxs("div", { className: "col-md-6 col-lg-3 mb-3", children: [_jsx("label", { htmlFor: "endDate", className: "form-label", children: "Fecha final" }), _jsx("input", { type: "date", id: "endDate", name: "endDate", className: "form-control", value: localFilters.endDate || '', onChange: handleInputChange, "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "Fecha final para filtrar logs" })] }), _jsxs("div", { className: "col-md-6 col-lg-3 mb-3", children: [_jsx("label", { htmlFor: "documentId", className: "form-label", children: "ID de documento" }), _jsx("input", { type: "text", id: "documentId", name: "documentId", className: "form-control", value: localFilters.documentId || '', onChange: handleInputChange, placeholder: "ID del documento", "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "ID del documento afectado" })] }), _jsxs("div", { className: "col-md-6 col-lg-3 mb-3", children: [_jsx("label", { htmlFor: "userId", className: "form-label", children: "ID de usuario" }), _jsx("input", { type: "text", id: "userId", name: "userId", className: "form-control", value: localFilters.userId || '', onChange: handleInputChange, placeholder: "ID del usuario", "data-bs-toggle": "tooltip", "data-bs-placement": "top", title: "ID del usuario que realiz\u00F3 la acci\u00F3n" })] })] }), _jsxs("div", { className: "d-flex justify-content-end gap-2 mt-3", children: [_jsxs("button", { type: "button", className: "btn btn-outline-secondary", onClick: handleReset, children: [_jsx("i", { className: "bi bi-x-circle me-1" }), " Limpiar filtros"] }), _jsxs("button", { type: "submit", className: "btn text-white", style: { backgroundColor: '#099347' }, children: [_jsx("i", { className: "bi bi-funnel-fill me-1" }), " Aplicar filtros"] })] })] }) })] }));
}
