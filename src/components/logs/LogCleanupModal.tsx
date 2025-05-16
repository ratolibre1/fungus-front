import { useState } from 'react';

interface LogCleanupModalProps {
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function LogCleanupModal({ onClose, onConfirm }: LogCleanupModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al limpiar los registros antiguos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Limpiar registros antiguos</h5>
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

            <div className="alert alert-warning" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Atención:</strong> Esta acción eliminará todos los registros de actividad más antiguos que 90 días.
            </div>

            <p>
              La limpieza de registros antiguos ayuda a mantener el rendimiento del sistema y reduce el almacenamiento de datos históricos innecesarios.
            </p>

            <p className="fw-bold text-danger">
              Esta acción no se puede deshacer.
            </p>
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
              className="btn btn-warning"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : (
                <>
                  <i className="bi bi-trash-fill me-1"></i>
                  Limpiar registros antiguos
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 