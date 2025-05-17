import { useState, useEffect } from 'react';
import { LogFilters as LogFiltersType } from '../../types/Log';

interface LogFiltersProps {
  filters: LogFiltersType;
  onApplyFilters: (filters: LogFiltersType) => void;
}

export default function LogFilters({ filters, onApplyFilters }: LogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<LogFiltersType>(filters);

  // Actualizar filtros locales cuando cambian los props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    const defaultFilters: LogFiltersType = {
      page: 1,
      limit: 10
    };
    setLocalFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center"
        style={{ backgroundColor: '#f8f9fa', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}>
        <h5 className="mb-0">
          <i className={`bi bi-funnel me-2 ${isOpen ? 'bi-funnel-fill' : 'bi-funnel'}`}></i>
          Filtrar registros
        </h5>
        <button
          className="btn btn-sm"
          style={{ color: '#099347' }}
          type="button"
        >
          <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
      </div>

      <div className={`card-body ${isOpen ? '' : 'd-none'}`}>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 col-lg-3 mb-3">
              <label htmlFor="operation" className="form-label">Operación</label>
              <select
                id="operation"
                name="operation"
                className="form-select"
                value={localFilters.operation || ''}
                onChange={handleInputChange}
              >
                <option value="">Todas las operaciones</option>
                <option value="create">Creación</option>
                <option value="update">Actualización</option>
                <option value="delete">Eliminación</option>
              </select>
            </div>

            <div className="col-md-6 col-lg-3 mb-3">
              <label htmlFor="collection" className="form-label">Colección</label>
              <select
                id="collection"
                name="collection"
                className="form-select"
                value={localFilters.collection || ''}
                onChange={handleInputChange}
              >
                <option value="">Todas las colecciones</option>
                <option value="product">Productos</option>
                <option value="consumable">Insumos</option>
                <option value="contact">Contactos</option>
                <option value="quotation">Cotizaciones</option>
                <option value="sale">Ventas</option>
                <option value="purchase">Compras</option>
              </select>
            </div>

            <div className="col-md-6 col-lg-3 mb-3">
              <label htmlFor="startDate" className="form-label">Fecha inicial</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-control"
                value={localFilters.startDate || ''}
                onChange={handleInputChange}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Fecha de inicio para filtrar logs"
              />
            </div>

            <div className="col-md-6 col-lg-3 mb-3">
              <label htmlFor="endDate" className="form-label">Fecha final</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-control"
                value={localFilters.endDate || ''}
                onChange={handleInputChange}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Fecha final para filtrar logs"
              />
            </div>

            <div className="col-md-6 col-lg-3 mb-3">
              <label htmlFor="documentId" className="form-label">ID de documento</label>
              <input
                type="text"
                id="documentId"
                name="documentId"
                className="form-control"
                value={localFilters.documentId || ''}
                onChange={handleInputChange}
                placeholder="ID del documento"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="ID del documento afectado"
              />
            </div>

            <div className="col-md-6 col-lg-3 mb-3">
              <label htmlFor="userId" className="form-label">ID de usuario</label>
              <input
                type="text"
                id="userId"
                name="userId"
                className="form-control"
                value={localFilters.userId || ''}
                onChange={handleInputChange}
                placeholder="ID del usuario"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="ID del usuario que realizó la acción"
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleReset}
            >
              <i className="bi bi-x-circle me-1"></i> Limpiar filtros
            </button>
            <button
              type="submit"
              className="btn text-white"
              style={{ backgroundColor: '#099347' }}
            >
              <i className="bi bi-funnel-fill me-1"></i> Aplicar filtros
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 