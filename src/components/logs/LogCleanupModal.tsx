import React from 'react';
import PortalModal from '../common/PortalModal';

interface LogCleanupModalProps {
  onClose: () => void;
  onConfirm: (daysToKeep: number) => void;
}

export default function LogCleanupModal({ onClose, onConfirm }: LogCleanupModalProps) {
  const [daysToKeep, setDaysToKeep] = React.useState<number>(30);

  const handleConfirm = () => {
    onConfirm(daysToKeep);
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDaysToKeep(parseInt(e.target.value));
  };

  const getEstimatedDeletions = () => {
    const currentDate = new Date();
    const cutoffDate = new Date(currentDate.getTime() - (daysToKeep * 24 * 60 * 60 * 1000));
    return cutoffDate.toLocaleDateString('es-CL');
  };

  return (
    <PortalModal isOpen={true} onClose={onClose}>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="modal fade show"
        style={{
          display: 'block',
          zIndex: 1055
        }}
        tabIndex={-1}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Limpiar registros antiguos</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Cerrar"
              />
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>¡Atención!</strong> Esta acción no se puede deshacer.
              </div>

              <div className="mb-3">
                <label htmlFor="daysToKeep" className="form-label">
                  Mantener registros de los últimos:
                </label>
                <select
                  id="daysToKeep"
                  className="form-select"
                  value={daysToKeep}
                  onChange={handleDaysChange}
                >
                  <option value={7}>7 días</option>
                  <option value={15}>15 días</option>
                  <option value={30}>30 días</option>
                  <option value={60}>60 días</option>
                  <option value={90}>90 días</option>
                </select>
              </div>

              <p className="text-muted">
                Se eliminarán todos los registros anteriores al <strong>{getEstimatedDeletions()}</strong>.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={handleConfirm}>
                <i className="bi bi-trash me-1"></i> Limpiar registros
              </button>
            </div>
          </div>
        </div>
      </div>
    </PortalModal>
  );
} 