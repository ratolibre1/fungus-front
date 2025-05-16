import { Log } from '../../types/Log';
import { formatDateTime } from '../../utils/dateUtils';
import { useEffect } from 'react';

interface LogDetailsModalProps {
  log: Log | null;
  onClose: () => void;
}

export default function LogDetailsModal({ log, onClose }: LogDetailsModalProps) {
  // Usar useEffect para añadir/quitar la clase modal-open al body
  useEffect(() => {
    if (!log) return;

    // Añadir la clase al montar
    document.body.classList.add('modal-open');

    // Agregar un backdrop fuera del componente
    const backdropElement = document.createElement('div');
    backdropElement.className = 'modal-backdrop fade show';
    document.body.appendChild(backdropElement);

    // Limpiar al desmontar
    return () => {
      document.body.classList.remove('modal-open');
      document.body.removeChild(backdropElement);
    };
  }, [log]);

  if (!log) return null;

  // Mostrar el nombre de operación de forma legible
  const operationLabel = {
    'create': 'Creación',
    'update': 'Actualización',
    'delete': 'Eliminación'
  }[log.operation] || log.operation;

  // Mostrar el nombre de colección de forma legible
  const collectionLabel = {
    'product': 'Productos',
    'consumable': 'Insumos',
    'contact': 'Contactos',
    'quotation': 'Cotizaciones',
    'sale': 'Ventas',
    'purchase': 'Compras'
  }[log.collectionType] || log.collectionType;

  // Función para renderizar los detalles según el tipo de operación
  const renderDetails = () => {
    if (!log.details) {
      return <p className="text-muted">No hay detalles disponibles</p>;
    }

    if (log.operation === 'update' && log.details.changes) {
      // Mostrar cambios en formato de antes/después
      return (
        <div className="mt-4">
          <h6 className="mb-3">Cambios realizados:</h6>
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Campo</th>
                  <th>Valor anterior</th>
                  <th>Nuevo valor</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(log.details.changes).map(([field, values]) => {
                  const [oldValue, newValue] = Array.isArray(values) ? values : [null, values];
                  return (
                    <tr key={field}>
                      <td className="fw-bold">{field}</td>
                      <td className="text-danger">
                        {oldValue === null || oldValue === undefined
                          ? <em>No definido</em>
                          : typeof oldValue === 'object'
                            ? JSON.stringify(oldValue)
                            : String(oldValue)}
                      </td>
                      <td className="text-success">
                        {newValue === null || newValue === undefined
                          ? <em>No definido</em>
                          : typeof newValue === 'object'
                            ? JSON.stringify(newValue)
                            : String(newValue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      // Mostrar todos los detalles como una tabla de clave-valor
      return (
        <div className="mt-4">
          <h6 className="mb-3">Detalles del documento:</h6>
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Campo</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(log.details).map(([key, value]) => (
                  <tr key={key}>
                    <td className="fw-bold">{key}</td>
                    <td>
                      {value === null || value === undefined
                        ? <em className="text-muted">No definido</em>
                        : typeof value === 'object'
                          ? <pre className="mb-0" style={{ fontSize: '0.85rem' }}>{JSON.stringify(value, null, 2)}</pre>
                          : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Detalles del registro
              <span className="ms-2 badge" style={{ backgroundColor: '#099347' }}>ID: {log._id}</span>
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
          </div>
          <div className="modal-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="mb-3">
                  <h6 className="text-muted mb-1">Fecha y hora</h6>
                  <p className="mb-0">{formatDateTime(log.createdAt)}</p>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted mb-1">Operación</h6>
                  <p className="mb-0">
                    <span className={`badge ${log.operation === 'create' ? 'bg-success' :
                      log.operation === 'update' ? 'bg-primary' :
                        log.operation === 'delete' ? 'bg-danger' : 'bg-secondary'
                      }`}>
                      {operationLabel}
                    </span>
                  </p>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted mb-1">Colección</h6>
                  <p className="mb-0">{collectionLabel}</p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <h6 className="text-muted mb-1">ID del documento</h6>
                  <p className="mb-0 text-break">{log.documentId}</p>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted mb-1">Usuario</h6>
                  {typeof log.userId === 'object' && log.userId ? (
                    <>
                      <p className="mb-0 fw-bold">{log.userId.name}</p>
                      <p className="mb-0 text-muted small">{log.userId.email}</p>
                      <p className="mb-0 text-muted small">ID: {log.userId._id}</p>
                    </>
                  ) : (
                    <p className="mb-0">ID: {log.userId}</p>
                  )}
                </div>
              </div>
            </div>

            <hr />

            {renderDetails()}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 