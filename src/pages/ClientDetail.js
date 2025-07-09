import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getClientDetails, getClientTransactions } from '../services/clientDetailService';
import { updateClient, getClient } from '../services/clientService';
import { addSupplierRole, removeSupplierRole, removeCustomerRole } from '../services/roleService';
import { formatRut } from '../utils/validators';
import ClientModal from '../components/ClientModal';
import BuyersBackground from '../components/BuyersBackground';
import { generateClientLabelPDF } from '../components/PrintLabel';
import PortalModal from '../components/common/PortalModal';
export default function ClientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clientData, setClientData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSaleDetailModal, setShowSaleDetailModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    // Estado para gestión de roles
    const [showRoleConfirm, setShowRoleConfirm] = useState({ type: null, show: false });
    // Estado para ordenamiento de ventas
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [fullClientData, setFullClientData] = useState(null);
    // Función para cargar los datos del cliente
    const loadClientDetail = async () => {
        if (!id)
            return;
        setLoading(true);
        setError(null);
        try {
            const [detailResponse, transactionsResponse] = await Promise.all([
                getClientDetails(id),
                getClientTransactions(id, 1, 50, 'sale')
            ]);
            setClientData(detailResponse.data);
            setTransactions(transactionsResponse.data.transactions || []);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    // Cargar al montar el componente
    useEffect(() => {
        loadClientDetail();
    }, [id]);
    // Navegar al detalle del proveedor si también es proveedor
    const navigateToSupplierDetail = () => {
        if (clientData?.isSupplier && clientData?.supplierId) {
            navigate(`/proveedor/${clientData.supplierId}`);
        }
    };
    // Función para ordenar las ventas
    const handleSort = (field) => {
        if (sortField === field) {
            // Si ya estamos ordenando por este campo, cambiamos la dirección
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        }
        else {
            // Si cambiamos el campo, ponemos la dirección predeterminada
            setSortField(field);
            setSortDirection('desc'); // Por defecto ordenamos descendentemente (lo más reciente primero)
        }
    };
    // Obtener las ventas ordenadas
    const getSortedPurchases = () => {
        if (!clientData?.purchases)
            return [];
        return [...clientData.purchases].sort((a, b) => {
            let comparison = 0;
            if (sortField === 'date') {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                comparison = dateA - dateB;
            }
            else if (sortField === 'total') {
                comparison = a.total - b.total;
            }
            else if (sortField === 'status') {
                // Usar la misma lógica que el display para obtener el estado correcto
                const fullTransactionA = transactions.find(t => t._id === a._id);
                const fullTransactionB = transactions.find(t => t._id === b._id);
                const statusA = fullTransactionA ? fullTransactionA.status : a.status;
                const statusB = fullTransactionB ? fullTransactionB.status : b.status;
                // Traducir estados para comparación consistente
                const translatedStatusA = getStatusInfo(statusA).text;
                const translatedStatusB = getStatusInfo(statusB).text;
                comparison = translatedStatusA.localeCompare(translatedStatusB);
            }
            else {
                comparison = a[sortField].toString().localeCompare(b[sortField].toString());
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    };
    // Formatear fecha en formato local
    const formatDate = (dateString) => {
        if (!dateString)
            return '-';
        const date = new Date(dateString);
        // Si la fecha es inválida o es 1969 (fecha null convertida a Date)
        if (isNaN(date.getTime()) || date.getFullYear() === 1969) {
            return '-';
        }
        return date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    // Formatear número como precio en CLP
    const formatPrice = (number) => {
        if (number === undefined || number === null || isNaN(number)) {
            return '$0';
        }
        return number.toLocaleString('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        });
    };
    // Mapear estado del backend a texto y color para badges
    const getStatusInfo = (status) => {
        // Los estados pueden venir en inglés del backend o ya traducidos del resumen
        const statusMap = {
            // Estados del backend (inglés)
            'paid': { text: 'Pagada', color: 'bg-success' },
            'pending': { text: 'Pendiente', color: 'bg-warning' },
            'invoiced': { text: 'Facturada', color: 'bg-info' },
            'cancelled': { text: 'Anulada', color: 'bg-danger' },
            // Estados ya traducidos del resumen (español)
            'Pagada': { text: 'Pagada', color: 'bg-success' },
            'Pagado': { text: 'Pagada', color: 'bg-success' },
            'Pendiente': { text: 'Pendiente', color: 'bg-warning' },
            'Facturada': { text: 'Facturada', color: 'bg-info' },
            'Facturado': { text: 'Facturada', color: 'bg-info' },
            'Anulada': { text: 'Anulada', color: 'bg-danger' },
            'Cancelada': { text: 'Anulada', color: 'bg-danger' },
            'Cancelado': { text: 'Anulada', color: 'bg-danger' }
        };
        return statusMap[status] || { text: status, color: 'bg-secondary' };
    };
    // Obtener el ícono de ordenamiento como en otras tablas
    const getSortIcon = (field) => {
        if (!sortField || sortField !== field) {
            return _jsx("i", { className: "bi bi-arrow-down-square ms-1" });
        }
        return sortDirection === 'asc'
            ? _jsx("i", { className: "bi bi-arrow-up-square-fill ms-1" })
            : _jsx("i", { className: "bi bi-arrow-down-square-fill ms-1" });
    };
    // Abrir modal de edición
    const openEditModal = async () => {
        if (!id)
            return;
        try {
            // Obtener datos completos del cliente antes de abrir el modal
            const response = await getClient(id);
            setFullClientData(response.data);
            setShowEditModal(true);
        }
        catch (err) {
            setError(err.message);
        }
    };
    // Cerrar modal de edición
    const closeEditModal = () => {
        setShowEditModal(false);
    };
    // Manejar submit del formulario del modal
    const handleModalSubmit = async (formData) => {
        if (!id)
            return;
        setModalLoading(true);
        setError(null);
        try {
            await updateClient(id, formData);
            // Recargar datos del cliente para reflejar los cambios
            await loadClientDetail();
            closeEditModal();
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setModalLoading(false);
        }
    };
    // Abrir modal de detalle de venta
    const openSaleDetailModal = (sale) => {
        setSelectedTransaction(transactions.find(t => t._id === sale._id) || null);
        setShowSaleDetailModal(true);
    };
    // Cerrar modal de detalle de venta
    const closeSaleDetailModal = () => {
        setSelectedTransaction(null);
        setShowSaleDetailModal(false);
    };
    // Generar PDF de etiqueta directamente
    const handleGeneratePDF = async () => {
        if (!id)
            return;
        try {
            // Obtener datos completos del cliente si no los tenemos
            let clientForPDF = fullClientData;
            if (!clientForPDF) {
                const response = await getClient(id);
                clientForPDF = response.data;
                setFullClientData(clientForPDF);
            }
            generateClientLabelPDF(clientForPDF);
        }
        catch (err) {
            setError(err.message);
        }
    };
    // Funciones para gestión de roles
    const handleAddSupplierRole = async () => {
        if (!id)
            return;
        try {
            await addSupplierRole(id);
            await loadClientDetail(); // Recargar datos
            setShowRoleConfirm({ type: null, show: false });
        }
        catch {
            setError('Error al activar como proveedor');
        }
    };
    const handleRemoveSupplierRole = async () => {
        if (!id)
            return;
        try {
            await removeSupplierRole(id);
            await loadClientDetail(); // Recargar datos  
            setShowRoleConfirm({ type: null, show: false });
        }
        catch {
            setError('Error al quitar rol de proveedor');
        }
    };
    const handleRemoveCustomerRole = async () => {
        if (!id)
            return;
        try {
            await removeCustomerRole(id);
            // Redirigir a lista de clientes ya que se quitó el rol
            navigate('/compradores');
        }
        catch {
            setError('Error al quitar rol de cliente');
        }
    };
    // Función para mostrar confirmación
    const showConfirmation = (type) => {
        setShowRoleConfirm({ type, show: true });
    };
    return (_jsx(Layout, { children: _jsxs("div", { className: "buyers-page-container", children: [_jsx(BuyersBackground, {}), _jsxs("div", { className: "d-flex mb-4", children: [_jsxs("button", { className: "btn btn-outline-secondary me-2", onClick: () => navigate('/compradores'), children: [_jsx("i", { className: "bi bi-arrow-left me-1" }), " Volver a Compradores"] }), clientData?.isSupplier && clientData?.supplierId && (_jsxs("button", { className: "btn btn-outline-primary", onClick: navigateToSupplierDetail, children: [_jsx("i", { className: "bi bi-box-seam-fill me-1" }), " Ver como Proveedor"] }))] }), loading ? (_jsx("div", { className: "d-flex justify-content-center", children: _jsx("div", { className: "spinner-border", style: { color: '#099347' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "Cargando..." }) }) })) : error ? (_jsx("div", { className: "alert alert-danger", children: error })) : clientData ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "card mb-4 border-0 shadow-sm", children: _jsx("div", { className: "card-body", children: _jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-md-8", children: [_jsxs("h2", { className: "mb-3 d-flex align-items-center flex-wrap", children: [clientData.client.name, _jsx("span", { className: "badge rounded-pill bg-success fs-6 ms-2", children: "Comprador" }), clientData.isSupplier && (_jsx("span", { className: "badge rounded-pill bg-primary fs-6 ms-2", children: "Proveedor" })), _jsxs("div", { className: "dropdown ms-2", children: [_jsx("button", { className: "btn btn-sm btn-outline-secondary", type: "button", "data-bs-toggle": "dropdown", "aria-expanded": "false", title: "Gestionar roles", children: _jsx("i", { className: "bi bi-gear" }) }), _jsxs("ul", { className: "dropdown-menu dropdown-menu-end", children: [_jsx("li", { children: _jsx("h6", { className: "dropdown-header", children: "Roles activos" }) }), _jsx("li", { children: _jsxs("span", { className: "dropdown-item-text text-success", children: [_jsx("i", { className: "bi bi-check-circle me-2" }), "Comprador"] }) }), clientData.isSupplier && (_jsx("li", { children: _jsxs("span", { className: "dropdown-item-text text-primary", children: [_jsx("i", { className: "bi bi-check-circle me-2" }), "Proveedor"] }) })), _jsx("li", { children: _jsx("hr", { className: "dropdown-divider" }) }), _jsx("li", { children: _jsx("h6", { className: "dropdown-header", children: "Gestionar roles" }) }), !clientData.isSupplier ? (_jsx("li", { children: _jsxs("button", { className: "dropdown-item", onClick: () => showConfirmation('add-supplier'), children: [_jsx("i", { className: "bi bi-plus-circle me-2 text-success" }), "Activar como Proveedor"] }) })) : (_jsx("li", { children: _jsxs("button", { className: "dropdown-item", onClick: () => showConfirmation('remove-supplier'), children: [_jsx("i", { className: "bi bi-dash-circle me-2 text-warning" }), "Quitar rol de Proveedor"] }) })), clientData.isSupplier && (_jsxs(_Fragment, { children: [_jsx("li", { children: _jsx("hr", { className: "dropdown-divider" }) }), _jsx("li", { children: _jsxs("button", { className: "dropdown-item text-danger", onClick: () => showConfirmation('remove-customer'), children: [_jsx("i", { className: "bi bi-x-circle me-2" }), "Desactivar como Comprador"] }) })] }))] })] })] }), _jsxs("p", { className: "mb-1", children: [_jsx("strong", { children: "RUT:" }), " ", formatRut(clientData.client.rut)] })] }), _jsxs("div", { className: "col-md-4 text-md-end", children: [_jsxs("button", { className: "btn btn-outline-primary me-2", onClick: handleGeneratePDF, children: [_jsx("i", { className: "bi bi-printer me-1" }), " Imprimir Datos"] }), _jsxs("button", { className: "btn btn-success", onClick: openEditModal, children: [_jsx("i", { className: "bi bi-pencil-square me-1" }), " Editar Comprador"] })] })] }) }) }), _jsxs("div", { className: "row mb-4", children: [_jsx("div", { className: "col-md-3", children: _jsx("div", { className: "card border-0 shadow-sm h-100", children: _jsxs("div", { className: "card-body", children: [_jsx("h6", { className: "text-muted mb-2", children: "Total Ventas" }), _jsx("h3", { children: clientData.statistics?.totalPurchases || 0 })] }) }) }), _jsx("div", { className: "col-md-3", children: _jsx("div", { className: "card border-0 shadow-sm h-100", children: _jsxs("div", { className: "card-body", children: [_jsx("h6", { className: "text-muted mb-2", children: "Total Gastado" }), _jsx("h3", { children: clientData.statistics?.totalSpent ? formatPrice(clientData.statistics.totalSpent) : formatPrice(0) })] }) }) }), _jsx("div", { className: "col-md-3", children: _jsx("div", { className: "card border-0 shadow-sm h-100", children: _jsxs("div", { className: "card-body", children: [_jsx("h6", { className: "text-muted mb-2", children: "Ticket Promedio" }), _jsx("h3", { children: clientData.statistics?.averagePurchase ? formatPrice(clientData.statistics.averagePurchase) : formatPrice(0) })] }) }) }), _jsx("div", { className: "col-md-3", children: _jsx("div", { className: "card border-0 shadow-sm h-100", children: _jsxs("div", { className: "card-body", children: [_jsx("h6", { className: "text-muted mb-2", children: "Primera/\u00DAltima Venta" }), _jsx("p", { className: "mb-0", children: clientData.statistics?.firstPurchaseDate ? formatDate(clientData.statistics.firstPurchaseDate) : '-' }), _jsx("p", { className: "mb-0", children: clientData.statistics?.lastPurchaseDate ? formatDate(clientData.statistics.lastPurchaseDate) : '-' })] }) }) })] }), _jsxs("div", { className: "card border-0 shadow-sm mb-4", children: [_jsx("div", { className: "card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center", children: _jsx("h5", { className: "mb-0", children: "Historial de Ventas" }) }), _jsx("div", { className: "card-body", children: _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsxs("th", { style: { cursor: 'pointer' }, onClick: () => handleSort('folio'), children: ["N\u00B0 Folio", getSortIcon('folio')] }), _jsxs("th", { style: { cursor: 'pointer' }, onClick: () => handleSort('date'), children: ["Fecha", getSortIcon('date')] }), _jsxs("th", { style: { cursor: 'pointer' }, onClick: () => handleSort('total'), children: ["Total", getSortIcon('total')] }), _jsxs("th", { style: { cursor: 'pointer' }, onClick: () => handleSort('status'), children: ["Estado", getSortIcon('status')] }), _jsx("th", { className: "text-center", children: "Acciones" })] }) }), _jsx("tbody", { children: getSortedPurchases().length > 0 ? (getSortedPurchases().map(purchase => {
                                                        // Buscar la transacción completa correspondiente
                                                        const fullTransaction = transactions.find(t => t._id === purchase._id);
                                                        const statusToShow = fullTransaction ? fullTransaction.status : purchase.status;
                                                        return (_jsxs("tr", { children: [_jsx("td", { children: purchase.folio }), _jsx("td", { children: formatDate(purchase.date) }), _jsx("td", { children: formatPrice(purchase.total) }), _jsx("td", { children: _jsx("span", { className: `badge ${getStatusInfo(statusToShow).color}`, children: getStatusInfo(statusToShow).text }) }), _jsx("td", { className: "text-center", children: _jsx("button", { className: "btn btn-sm btn-outline-primary", onClick: () => openSaleDetailModal(purchase), title: "Ver detalle de venta", children: _jsx("i", { className: "bi bi-eye" }) }) })] }, purchase._id));
                                                    })) : (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center py-3", children: "No hay ventas registradas" }) })) })] }) }) })] }), clientData.purchases && clientData.purchases.length > 0 && (_jsxs("div", { className: "card border-0 shadow-sm", children: [_jsx("div", { className: "card-header bg-white border-bottom-0", children: _jsx("h5", { className: "mb-0", children: "\u00DAltima Venta (Detalle)" }) }), _jsx("div", { className: "card-body", children: (() => {
                                        const lastTransaction = transactions.find(t => t._id === clientData.purchases[0]._id);
                                        return lastTransaction ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "row mb-3", children: [_jsxs("div", { className: "col-md-4", children: [_jsxs("p", { className: "mb-1", children: [_jsx("strong", { children: "Folio:" }), " ", clientData.purchases[0].folio] }), _jsxs("p", { className: "mb-1", children: [_jsx("strong", { children: "Fecha:" }), " ", formatDate(clientData.purchases[0].date)] })] }), _jsxs("div", { className: "col-md-4", children: [_jsxs("p", { className: "mb-1", children: [_jsx("strong", { children: "Estado:" }), " ", clientData.purchases[0].status] }), _jsxs("p", { className: "mb-1", children: [_jsx("strong", { children: "Total:" }), " ", formatPrice(clientData.purchases[0].total)] })] })] }), _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-sm", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "Producto" }), _jsx("th", { children: "Cantidad" }), _jsx("th", { children: "Precio Unit." }), _jsx("th", { children: "Subtotal" })] }) }), _jsx("tbody", { children: lastTransaction.itemDetails?.map((item, index) => (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { children: [_jsx("strong", { children: item.name }), _jsx("br", {}), _jsxs("small", { className: "text-muted", children: [item.description, " ", item.dimensions && `(${item.dimensions})`] })] }) }), _jsx("td", { children: item.quantity }), _jsx("td", { children: formatPrice(item.unitPrice) }), _jsx("td", { children: formatPrice(item.subtotal || item.quantity * item.unitPrice) })] }, index))) }), _jsxs("tfoot", { children: [_jsxs("tr", { children: [_jsx("td", { colSpan: 3, className: "text-end", children: _jsx("strong", { children: "Neto" }) }), _jsx("td", { children: _jsx("strong", { children: formatPrice(lastTransaction.netAmount) }) })] }), _jsxs("tr", { children: [_jsx("td", { colSpan: 3, className: "text-end", children: _jsx("strong", { children: "IVA (19%)" }) }), _jsx("td", { children: _jsx("strong", { children: formatPrice(lastTransaction.taxAmount) }) })] }), _jsxs("tr", { children: [_jsx("td", { colSpan: 3, className: "text-end", children: _jsx("strong", { children: "Total:" }) }), _jsx("td", { children: _jsx("strong", { children: formatPrice(lastTransaction.totalAmount) }) })] })] })] }) })] })) : (_jsxs("div", { className: "row mb-3", children: [_jsxs("div", { className: "col-md-4", children: [_jsxs("p", { className: "mb-1", children: [_jsx("strong", { children: "Folio:" }), " ", clientData.purchases[0].folio] }), _jsxs("p", { className: "mb-1", children: [_jsx("strong", { children: "Fecha:" }), " ", formatDate(clientData.purchases[0].date)] })] }), _jsxs("div", { className: "col-md-4", children: [_jsxs("p", { className: "mb-1", children: [_jsx("strong", { children: "Estado:" }), " ", clientData.purchases[0].status] }), _jsxs("p", { className: "mb-1", children: [_jsx("strong", { children: "Total:" }), " ", formatPrice(clientData.purchases[0].total)] })] })] }));
                                    })() })] })), showEditModal && fullClientData && (_jsx(ClientModal, { isOpen: showEditModal, modalType: "edit", selectedClient: fullClientData, loading: modalLoading, onClose: closeEditModal, onSubmit: handleModalSubmit })), showSaleDetailModal && selectedTransaction && (_jsxs(PortalModal, { isOpen: true, onClose: closeSaleDetailModal, children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1050 }, onClick: closeSaleDetailModal }), _jsx("div", { className: "modal fade show", style: {
                                        display: 'block',
                                        zIndex: 1055
                                    }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("h5", { className: "modal-title", children: ["Detalles de ", selectedTransaction.documentType === 'sale' ? 'Venta' : 'Compra', " ", selectedTransaction.documentNumber] }), _jsx("button", { type: "button", className: "btn-close", onClick: closeSaleDetailModal, "aria-label": "Cerrar" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "row mb-4", children: [_jsxs("div", { className: "col-md-6", children: [_jsx("h6", { className: "mb-3", children: "Informaci\u00F3n General" }), _jsxs("p", { children: [_jsx("strong", { children: "Fecha:" }), " ", formatDate(selectedTransaction.date)] }), _jsxs("p", { children: [_jsx("strong", { children: "Tipo de documento:" }), " ", _jsx("span", { className: `badge ${selectedTransaction.documentType === 'boleta' ? 'bg-info text-dark' : 'bg-primary'}`, children: selectedTransaction.documentType === 'boleta' ? 'Boleta' : 'Factura' })] }), _jsxs("p", { children: [_jsx("strong", { children: "Estado:" }), " ", _jsx("span", { className: `badge ${getStatusInfo(selectedTransaction.status).color}`, children: getStatusInfo(selectedTransaction.status).text })] }), _jsxs("p", { children: [_jsx("strong", { children: "Correlativo:" }), " ", selectedTransaction.correlative] }), _jsxs("p", { children: [_jsx("strong", { children: "Vendedor:" }), " ", selectedTransaction.userDetails?.name || 'N/A'] })] }), _jsxs("div", { className: "col-md-6", children: [_jsx("h6", { className: "mb-3", children: "Cliente" }), _jsxs("p", { children: [_jsx("strong", { children: "Nombre:" }), " ", clientData.client.name] }), _jsxs("p", { children: [_jsx("strong", { children: "RUT:" }), " ", formatRut(clientData.client.rut)] }), fullClientData?.email && (_jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", fullClientData.email] }))] })] }), _jsx("h6", { className: "mb-3", children: "Detalle de Productos" }), _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-sm table-bordered", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { style: { minWidth: '250px' }, children: "Producto" }), _jsx("th", { className: "text-end", children: "Cantidad" }), _jsx("th", { className: "text-end", children: "Precio Unit." }), _jsx("th", { className: "text-end", children: "Descuento" }), _jsx("th", { className: "text-end", children: "Subtotal" })] }) }), _jsx("tbody", { children: selectedTransaction.itemDetails?.map((item, index) => (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { children: [_jsx("strong", { children: item.name }), _jsx("br", {}), _jsxs("small", { className: "text-muted", children: [item.description, " ", item.dimensions && `(${item.dimensions})`] })] }) }), _jsx("td", { className: "text-end", children: item.quantity }), _jsx("td", { className: "text-end", children: formatPrice(item.unitPrice) }), _jsx("td", { className: "text-end", children: formatPrice(item.discount || 0) }), _jsx("td", { className: "text-end", children: formatPrice(item.subtotal || item.quantity * item.unitPrice) })] }, index))) }), _jsxs("tfoot", { className: "table-light", children: [_jsxs("tr", { children: [_jsx("td", { colSpan: 4, className: "text-end", children: _jsx("strong", { children: "Neto" }) }), _jsx("td", { className: "text-end", children: formatPrice(selectedTransaction.netAmount) })] }), _jsxs("tr", { children: [_jsx("td", { colSpan: 4, className: "text-end", children: _jsx("strong", { children: "IVA (19%)" }) }), _jsx("td", { className: "text-end", children: formatPrice(selectedTransaction.taxAmount) })] }), _jsxs("tr", { children: [_jsx("td", { colSpan: 4, className: "text-end", children: _jsx("strong", { children: "Total" }) }), _jsx("td", { className: "text-end", children: formatPrice(selectedTransaction.totalAmount) })] })] })] }) }), selectedTransaction.observations && (_jsxs("div", { className: "mt-4", children: [_jsx("h6", { className: "mb-3", children: "Observaciones" }), _jsxs("div", { className: "alert alert-light border", role: "alert", children: [_jsx("i", { className: "bi bi-info-circle me-2" }), selectedTransaction.observations] })] }))] }), _jsxs("div", { className: "modal-footer", children: [_jsxs("button", { type: "button", className: "btn btn-outline-primary me-2", onClick: handleGeneratePDF, title: "Generar etiqueta del cliente", children: [_jsx("i", { className: "bi bi-printer me-1" }), " Imprimir Etiqueta"] }), _jsx("button", { type: "button", className: "btn btn-secondary", onClick: closeSaleDetailModal, children: "Cerrar" })] })] }) }) })] })), showRoleConfirm.show && (_jsxs(PortalModal, { isOpen: true, onClose: () => setShowRoleConfirm({ type: null, show: false }), children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1050 }, onClick: () => setShowRoleConfirm({ type: null, show: false }) }), _jsx("div", { className: "modal fade show", style: {
                                        display: 'block',
                                        zIndex: 1055
                                    }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog modal-dialog-centered", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("h5", { className: "modal-title", children: [showRoleConfirm.type === 'add-supplier' && '🔄 Activar como Proveedor', showRoleConfirm.type === 'remove-supplier' && '⚠️ Quitar rol de Proveedor', showRoleConfirm.type === 'remove-customer' && '⚠️ Desactivar como Comprador'] }), _jsx("button", { type: "button", className: "btn-close", onClick: () => setShowRoleConfirm({ type: null, show: false }), "aria-label": "Cerrar" })] }), _jsxs("div", { className: "modal-body", children: [showRoleConfirm.type === 'add-supplier' && (_jsxs("p", { children: [_jsx("strong", { children: clientData?.client.name }), " podr\u00E1 aparecer en cotizaciones y compras como proveedor. Mantendr\u00E1 sus datos de cliente intactos."] })), showRoleConfirm.type === 'remove-supplier' && (_jsxs("p", { children: ["Se quitar\u00E1 el rol de proveedor para ", _jsx("strong", { children: clientData?.client.name }), ". Se mantendr\u00E1 el historial existente pero no aparecer\u00E1 en nuevas compras."] })), showRoleConfirm.type === 'remove-customer' && (_jsxs("p", { className: "text-danger", children: [_jsx("i", { className: "bi bi-exclamation-triangle-fill me-2" }), "Se desactivar\u00E1 ", _jsx("strong", { children: clientData?.client.name }), " como comprador. Se mantendr\u00E1 el historial pero no aparecer\u00E1 en nuevas ventas."] }))] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowRoleConfirm({ type: null, show: false }), children: "Cancelar" }), _jsx("button", { type: "button", className: `btn ${showRoleConfirm.type === 'add-supplier' ? 'btn-success' :
                                                                showRoleConfirm.type === 'remove-supplier' ? 'btn-warning' : 'btn-danger'}`, onClick: () => {
                                                                if (showRoleConfirm.type === 'add-supplier')
                                                                    handleAddSupplierRole();
                                                                if (showRoleConfirm.type === 'remove-supplier')
                                                                    handleRemoveSupplierRole();
                                                                if (showRoleConfirm.type === 'remove-customer')
                                                                    handleRemoveCustomerRole();
                                                            }, children: "Confirmar" })] })] }) }) })] }))] })) : (_jsx("div", { className: "alert alert-warning", children: "No se encontr\u00F3 informaci\u00F3n del cliente" }))] }) }));
}
