// Estados y transiciones válidas según especificación backend
export const PURCHASE_STATUSES = {
    PENDING: 'pending',
    RECEIVED: 'received',
    REJECTED: 'rejected'
};
export const VALID_PURCHASE_TRANSITIONS = {
    pending: ['received', 'rejected'],
    received: [], // Estado final
    rejected: [] // Estado final
};
// Utilidades para validaciones
export const canChangePurchaseStatus = (currentStatus, newStatus) => {
    return VALID_PURCHASE_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};
export const getPurchaseStatusColor = (status) => {
    const colors = {
        pending: 'warning',
        received: 'success',
        rejected: 'danger'
    };
    return colors[status] || 'secondary';
};
export const getPurchaseStatusLabel = (status) => {
    const labels = {
        pending: 'Pendiente',
        received: 'Recibida',
        rejected: 'Rechazada'
    };
    return labels[status] || status;
};
