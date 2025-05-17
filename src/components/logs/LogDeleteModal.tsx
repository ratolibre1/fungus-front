import { useState } from 'react';
import { Log } from '../../types/Log';
import { formatDate } from '../../utils/dateUtils';

interface LogDeleteModalProps {
  log: Log | null;
  onClose: () => void;
  onConfirm: (logId: string) => Promise<void>;
}

export default function LogDeleteModal({ log, onClose, onConfirm }: LogDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!log) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(log._id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el registro');
    } finally {
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

    return <span className={`badge bg-${style}`}>{label}</span>;
  };

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirmar eliminación</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Cerrar"
            ></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <p>
              ¿Estás seguro de que deseas eliminar este registro de actividad?
              <br />
              <span className="text-danger">Esta acción no se puede deshacer.</span>
            </p>

            <div className="card bg-light mt-3">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">Detalles del registro</h6>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>ID:</span>
                    <span className="text-truncate" style={{ maxWidth: '200px' }}>{log._id}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>Fecha:</span>
                    <span>{formatDate(log.createdAt)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>Operación:</span>
                    {operationBadge()}
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>Colección:</span>
                    <span>{log.collectionType}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Eliminando...
                </>
              ) : (
                <>
                  <i className="bi bi-trash-fill me-1"></i>
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 