import { useState, useEffect, useCallback } from 'react';
import { getLogs, deleteLog, cleanupLogs } from '../services/logService';
// Estado inicial para paginación
const defaultPagination = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
};
// Filtros por defecto
const defaultFilters = {
    page: 1,
    limit: 10
};
/**
 * Hook personalizado para gestionar logs, incluyendo carga, paginación, filtrado, y eliminación.
 */
export const useLogManagement = () => {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState(defaultPagination);
    const [filters, setFilters] = useState(defaultFilters);
    const [selectedLog, setSelectedLog] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCleanupModal, setShowCleanupModal] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
    // Cargar logs
    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getLogs(filters);
            setLogs(response.data);
            setPagination(response.pagination);
        }
        catch (err) {
            console.error('Error al cargar logs:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar los registros');
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    // Cargar logs al iniciar o cuando cambien los filtros
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs, lastRefreshTime]);
    // Cambiar página
    const handlePageChange = useCallback((page) => {
        setFilters(prev => ({
            ...prev,
            page
        }));
    }, []);
    // Aplicar filtros
    const handleApplyFilters = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);
    // Ver detalles de un log
    const handleViewDetails = useCallback((log) => {
        setSelectedLog(log);
        setShowDetails(true);
    }, []);
    // Cerrar modal de detalles
    const handleCloseDetails = useCallback(() => {
        setShowDetails(false);
        setSelectedLog(null);
    }, []);
    // Confirmar eliminación de un log
    const handleConfirmDelete = useCallback(async (logId) => {
        try {
            await deleteLog(logId);
            // Actualizar la lista después de eliminar
            setLastRefreshTime(Date.now());
        }
        catch (err) {
            console.error('Error al eliminar log:', err);
            throw err;
        }
    }, []);
    // Mostrar modal de eliminación
    const handleShowDeleteModal = useCallback((log) => {
        setSelectedLog(log);
        setShowDeleteModal(true);
    }, []);
    // Cerrar modal de eliminación
    const handleCloseDeleteModal = useCallback(() => {
        setShowDeleteModal(false);
        setSelectedLog(null);
    }, []);
    // Mostrar modal de limpieza
    const handleShowCleanupModal = useCallback(() => {
        setShowCleanupModal(true);
    }, []);
    // Cerrar modal de limpieza
    const handleCloseCleanupModal = useCallback(() => {
        setShowCleanupModal(false);
    }, []);
    // Confirmar limpieza de logs antiguos
    const handleConfirmCleanup = useCallback(async () => {
        try {
            await cleanupLogs();
            // Actualizar la lista después de limpiar
            setLastRefreshTime(Date.now());
        }
        catch (err) {
            console.error('Error al limpiar logs antiguos:', err);
            throw err;
        }
    }, []);
    // Refrescar datos manualmente
    const handleRefresh = useCallback(() => {
        setLastRefreshTime(Date.now());
    }, []);
    return {
        logs,
        pagination,
        filters,
        loading,
        error,
        selectedLog,
        showDetails,
        showDeleteModal,
        showCleanupModal,
        fetchLogs,
        handlePageChange,
        handleApplyFilters,
        handleViewDetails,
        handleCloseDetails,
        handleShowDeleteModal,
        handleCloseDeleteModal,
        handleConfirmDelete,
        handleShowCleanupModal,
        handleCloseCleanupModal,
        handleConfirmCleanup,
        handleRefresh
    };
};
