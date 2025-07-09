// Estados y transiciones válidas según especificación backend
export const SALE_STATUSES = {
    PENDING: 'pending',
    INVOICED: 'invoiced',
    PAID: 'paid'
};
export const VALID_SALE_TRANSITIONS = {
    pending: ['invoiced'],
    invoiced: ['paid'],
    paid: [] // Estado final
};
// Utilidades para validaciones
export const canChangeSaleStatus = (currentStatus, newStatus) => {
    return VALID_SALE_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};
export const getSaleStatusColor = (status) => {
    const colors = {
        pending: 'warning',
        invoiced: 'primary',
        paid: 'success'
    };
    return colors[status] || 'secondary';
};
export const getSaleStatusLabel = (status) => {
    const labels = {
        pending: 'Pendiente',
        invoiced: 'Facturada',
        paid: 'Pagada'
    };
    return labels[status] || status;
};
