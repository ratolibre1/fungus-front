import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SuppliesBackground from '../components/SuppliesBackground';
import {
  getConsumables,
  createConsumable,
  updateConsumable,
  deleteConsumable
} from '../services/consumableService';
import { Consumable, CreateConsumableRequest, UpdateConsumableRequest } from '../types/consumable';
import { compareStringsSpanish } from '../utils/validators';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;

export default function Consumables() {
  // Estados
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConsumable, setSelectedConsumable] = useState<Consumable | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);

  // Necesitamos permitir entrada parcial durante la edición
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({
    netPrice: '',
    stock: ''
  });

  // Agregar nuevos estados para ordenamiento
  const [sortField, setSortField] = useState<keyof Consumable>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Agregar estado para validación de formulario
  const [isFormValid, setIsFormValid] = useState(false);

  // Formulario
  const [formData, setFormData] = useState<CreateConsumableRequest | UpdateConsumableRequest>({
    name: '',
    description: '',
    netPrice: 0,
    stock: null
  });

  // Cargar los consumibles
  const loadConsumables = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getConsumables({});
      setConsumables(response.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    loadConsumables();
  }, []);

  // Validar el formulario cuando cambia
  useEffect(() => {
    // Para crear/editar insumo se necesita al menos nombre y precio
    const hasName = Boolean(formData.name && formData.name.trim() !== '');
    const hasPrice = typeof formData.netPrice === 'number' && formData.netPrice > 0;

    // Establecer la validez del formulario según los requisitos
    setIsFormValid((modalType === 'create' || modalType === 'edit') && hasName && hasPrice);
  }, [formData, modalType]);

  // Abrir modal
  const openModal = (type: ModalType, consumable: Consumable | null = null) => {
    setModalType(type);
    setSelectedConsumable(consumable);

    // Reiniciar la validación del formulario
    setIsFormValid(type === 'delete');

    if (type === 'create') {
      setFormData({
        name: '',
        description: '',
        netPrice: 0,
        stock: null
      });

      // Inicializar los campos de entrada vacíos
      setInputValues({
        netPrice: '',
        stock: ''
      });
    } else if (type === 'edit' && consumable) {
      // Asegurarse de tener un insumo válido con todas sus propiedades
      console.log('openModal edit - insumo seleccionado:', consumable);

      // Limpiar primero los valores para evitar mezclas
      setInputValues({
        netPrice: '',
        stock: ''
      });

      // Crear una copia nueva del objeto formData para evitar referencias
      const newFormData = {
        name: consumable.name || '',
        description: consumable.description || '',
        netPrice: typeof consumable.netPrice === 'number' ? consumable.netPrice : 0,
        stock: typeof consumable.stock === 'number' ? consumable.stock : null
      };

      console.log('openModal edit - formData inicializado:', newFormData);
      setFormData(newFormData);

      // Formatear y establecer los valores de input DESPUÉS de setFormData
      // para asegurar que se use el valor más reciente
      setTimeout(() => {
        const formattedValues = {
          netPrice: formatInputNumber(newFormData.netPrice),
          stock: formatInputNumber(newFormData.stock)
        };
        console.log('openModal edit - inputValues formateados:', formattedValues);
        setInputValues(formattedValues);
      }, 0);

      // Validar el formulario para edición
      const hasName = Boolean(consumable.name && consumable.name.trim() !== '');
      const hasPrice = typeof consumable.netPrice === 'number' && consumable.netPrice > 0;
      setIsFormValid(hasName && hasPrice);
    }
  };

  // Cerrar modal
  const closeModal = () => {
    setModalType(null);
    setSelectedConsumable(null);
  };

  // Manejar cambios en los campos de texto
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en el formulario para campos numéricos
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Guardar el valor exactamente como se escribió
    setInputValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Sólo intentar convertir a número si tiene un formato válido
    // Esto permite valores parciales como "1234," durante la edición
    if (value === '' || value === '-' || value === ',' || value === '.' || value.endsWith(',') || value.endsWith('.')) {
      // Para valores parciales/vacíos, guardar valores diferentes dependiendo del campo
      setFormData(prev => ({
        ...prev,
        [name]: name === 'stock' && value === '' ? null : 0
      }));
    } else {
      // Para valores completos que se pueden convertir a número
      const numericValue = value.replace(',', '.');
      const parsedValue = Number(numericValue);

      if (!isNaN(parsedValue)) {
        setFormData(prev => ({
          ...prev,
          [name]: parsedValue
        }));
      }
    }
  };

  // Validar input numérico para rechazar 'e' y múltiples comas
  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas de navegación y edición
    const navigationKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (navigationKeys.includes(e.key)) {
      return;
    }

    // Permitir números
    if (/[0-9]/.test(e.key)) {
      return;
    }

    // Permitir guión solo al principio y si no hay ya uno
    if (e.key === '-') {
      if (e.currentTarget.selectionStart === 0 && !e.currentTarget.value.includes('-')) {
        return;
      }
      e.preventDefault();
      return;
    }

    // Manejar punto y coma como decimales
    if (e.key === '.' || e.key === ',') {
      // Si ya hay un punto o una coma, no permitir otro
      if (e.currentTarget.value.includes('.') || e.currentTarget.value.includes(',')) {
        e.preventDefault();
        return;
      }
      return;
    }

    // Bloquear cualquier otra tecla
    e.preventDefault();
  };

  // Formatear número para mostrar en el input
  const formatInputNumber = (value: number | null): string => {
    // Depuración
    console.log(`formatInputNumber recibido: valor=${value}, tipo=${typeof value}`);

    // Si value no es un número o es undefined/null, retornar vacío
    if (value === null || value === undefined || isNaN(Number(value))) {
      console.log('formatInputNumber: valor inválido, retornando vacío');
      return '';
    }

    // Solo retornar vacío si es exactamente cero, no para valores "falsy"
    if (value === 0) {
      console.log('formatInputNumber: valor es cero, retornando vacío');
      return '';
    }

    // Convertir a string con coma decimal
    const formattedValue = value.toString().replace('.', ',');
    console.log(`formatInputNumber: valor formateado=${formattedValue}`);
    return formattedValue;
  };

  // Manejar submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (modalType === 'create') {
        await createConsumable(formData as CreateConsumableRequest);
      } else if (modalType === 'edit' && selectedConsumable) {
        await updateConsumable(selectedConsumable._id, formData);
      } else if (modalType === 'delete' && selectedConsumable) {
        await deleteConsumable(selectedConsumable._id);
      }

      loadConsumables();
      closeModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Formatear precio para mostrar en la UI con decimales cuando existan
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      // El número de decimales será entre 0 y 2, dependiendo si tiene decimales
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Función para manejar ordenamiento
  const handleSort = (field: keyof Consumable) => {
    if (sortField === field) {
      // Si ya estamos ordenando por este campo, cambiar dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es un nuevo campo, ordenar ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Función para obtener datos ordenados
  const getSortedConsumables = () => {
    return [...consumables].sort((a, b) => {
      const aValue = a[sortField] ?? '';
      const bValue = b[sortField] ?? '';

      // Si los valores son strings, usamos el ordenamiento español
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? compareStringsSpanish(aValue, bValue)
          : compareStringsSpanish(bValue, aValue);
      }

      // Para valores que no son strings, usamos el ordenamiento estándar
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  return (
    <Layout>
      <div className="supplies-page-container">
        <SuppliesBackground />
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
          <h1 className="h2 font-heading" style={{ color: '#099347' }}>Insumos</h1>
          <button
            className="btn"
            style={{ backgroundColor: '#099347', color: 'white' }}
            onClick={() => openModal('create')}
          >
            <i className="bi bi-plus-circle me-1"></i> Nuevo Insumo
          </button>
        </div>

        {/* Lista de insumos */}
        {error && (
          <div className="alert text-white" style={{ backgroundColor: '#dc3545' }} role="alert">
            {error}
          </div>
        )}

        {loading && !error ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border" style={{ color: '#099347' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <>
            {consumables.length === 0 ? (
              <div className="alert alert-info" role="alert">
                No hay insumos disponibles.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                        Nombre
                        <i className={`bi ms-1 ${sortField === 'name'
                          ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                          : 'bi-arrow-down-square'}`}></i>
                      </th>
                      <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                        Descripción
                        <i className={`bi ms-1 ${sortField === 'description'
                          ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                          : 'bi-arrow-down-square'}`}></i>
                      </th>
                      <th className="text-end" onClick={() => handleSort('netPrice')} style={{ cursor: 'pointer' }}>
                        Precio
                        <i className={`bi ms-1 ${sortField === 'netPrice'
                          ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                          : 'bi-arrow-down-square'}`}></i>
                      </th>
                      <th className="text-center" onClick={() => handleSort('stock')} style={{ cursor: 'pointer' }}>
                        Stock
                        <i className={`bi ms-1 ${sortField === 'stock'
                          ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                          : 'bi-arrow-down-square'}`}></i>
                      </th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedConsumables().map(consumable => (
                      <tr key={consumable._id}>
                        <td>{consumable.name}</td>
                        <td>{consumable.description}</td>
                        <td className="text-end">{formatPrice(consumable.netPrice)}</td>
                        <td className="text-center">
                          <span className={`badge ${consumable.stock === 0 ? 'bg-danger' : (consumable.stock ? 'bg-success' : 'bg-secondary')}`}>
                            {consumable.stock !== null ? consumable.stock : ''}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openModal('edit', consumable)}
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => openModal('delete', consumable)}
                              title="Eliminar"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Modal para Crear/Editar/Ver/Eliminar */}
        {modalType && (
          <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalType === 'create' && 'Nuevo Insumo'}
                    {modalType === 'edit' && 'Editar Insumo'}
                    {modalType === 'delete' && '¿Eliminar Insumo?'}
                    {modalType === 'view' && 'Detalles del Insumo'}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  {modalType === 'create' || modalType === 'edit' ? (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Nombre <span style={{ color: '#dc3545' }}>*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleTextChange}
                          required
                          placeholder="Ej: Filtros de jeringa"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Descripción</label>
                        <textarea
                          className="form-control"
                          name="description"
                          value={formData.description}
                          onChange={handleTextChange}
                          placeholder="Ej: Filtros estériles de 0.22 micras"
                          rows={3}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Precio neto <span style={{ color: '#dc3545' }}>*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          name="netPrice"
                          value={inputValues.netPrice}
                          onChange={handleNumericChange}
                          onKeyDown={handleNumericKeyDown}
                          required
                          placeholder="Ej: 2500"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Stock</label>
                        <input
                          type="text"
                          className="form-control"
                          name="stock"
                          value={inputValues.stock}
                          onChange={handleNumericChange}
                          onKeyDown={handleNumericKeyDown}
                          placeholder="Ej: 30"
                        />
                      </div>
                    </form>
                  ) : modalType === 'delete' ? (
                    <p>¿Estás seguro de que deseas eliminar <strong>{selectedConsumable?.name}</strong>?</p>
                  ) : (
                    <div>
                      <p><strong>Nombre:</strong> {selectedConsumable?.name}</p>
                      <p><strong>Descripción:</strong> {selectedConsumable?.description || 'Sin descripción'}</p>
                      <p><strong>Precio:</strong> {selectedConsumable && formatPrice(selectedConsumable.netPrice)}</p>
                      <p><strong>Stock:</strong> {selectedConsumable && selectedConsumable.stock !== null ? `${selectedConsumable.stock} unidades` : 'No especificado'}</p>
                      <p><strong>Tipo:</strong> {selectedConsumable?.itemType || 'No especificado'}</p>
                      <p><strong>Creado:</strong> {selectedConsumable && new Date(selectedConsumable.createdAt).toLocaleDateString()}</p>
                      <p><strong>Actualizado:</strong> {selectedConsumable && new Date(selectedConsumable.updatedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    {modalType === 'view' ? 'Cerrar' : 'Cancelar'}
                  </button>
                  {modalType !== 'view' && (
                    <button
                      type="button"
                      className={`btn ${modalType === 'delete' ? 'btn-danger' : ''}`}
                      style={modalType !== 'delete' ? { backgroundColor: '#099347', color: 'white' } : {}}
                      onClick={handleSubmit}
                      disabled={loading || ((modalType === 'create' || modalType === 'edit') && !isFormValid)}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Procesando...
                        </>
                      ) : (
                        modalType === 'create' ? 'Crear' :
                          modalType === 'edit' ? 'Guardar cambios' :
                            'Eliminar'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 