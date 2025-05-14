import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
  getPurchases,
  searchPurchases,
  createPurchase,
  updatePurchase,
  updatePurchaseStatus,
  deletePurchase
} from '../services/purchaseService';
import { Purchase, CreatePurchaseRequest, UpdatePurchaseRequest, PurchaseSearchParams } from '../types/purchase';
import PurchaseModal from '../components/PurchaseModal';
import { Supplier } from '../types/supplier';
import { getSuppliers } from '../services/supplierService';
import PurchasesBackground from '../components/PurchasesBackground';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;

export default function Purchases() {
  // Estados
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSupplier, setFilterSupplier] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Agregar estados para ordenamiento
  const [sortField, setSortField] = useState<keyof Purchase>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Cargar las compras
  const loadPurchases = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPurchases();
      setPurchases(response.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar proveedores para el filtro
  const loadSuppliers = async () => {
    try {
      const response = await getSuppliers();
      setSuppliers(response.data);
    } catch (err) {
      console.error('Error cargando proveedores:', err);
    }
  };

  // Buscar compras
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params: PurchaseSearchParams = {};

    if (searchTerm.trim()) {
      params.term = searchTerm.trim();
    }

    if (filterStatus) {
      params.status = filterStatus as 'pending' | 'completed' | 'canceled';
    }

    if (filterSupplier) {
      params.supplierId = filterSupplier;
    }

    // Si no hay filtros, cargar todo
    if (!params.term && !params.status && !params.supplierId) {
      loadPurchases();
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await searchPurchases(params);
      setPurchases(response.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSearching(false);
    }
  };

  // Resetear búsqueda
  const resetSearch = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterSupplier('');
    loadPurchases();
  };

  // Cargar al montar el componente
  useEffect(() => {
    loadPurchases();
    loadSuppliers();
  }, []);

  // Abrir modal
  const openModal = (type: ModalType, purchase: Purchase | null = null) => {
    setModalType(type);
    setSelectedPurchase(purchase);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalType(null);
    setSelectedPurchase(null);
  };

  // Manejar submit del formulario del modal
  const handleModalSubmit = async (formData: CreatePurchaseRequest | UpdatePurchaseRequest) => {
    setModalLoading(true);
    setError(null);

    try {
      if (modalType === 'create') {
        await createPurchase(formData as CreatePurchaseRequest);
      } else if (modalType === 'edit' && selectedPurchase) {
        await updatePurchase(selectedPurchase._id, formData);
      } else if (modalType === 'delete' && selectedPurchase) {
        await deletePurchase(selectedPurchase._id);
      }

      // Recargar la lista después de la operación
      handleSearch();
      closeModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setModalLoading(false);
    }
  };

  // Manejar cambio de estado de compra
  const handleStatusChange = async (purchase: Purchase, newStatus: 'pending' | 'completed' | 'canceled') => {
    try {
      await updatePurchaseStatus(purchase._id, newStatus);
      // Actualizar la lista después de cambiar el estado
      handleSearch();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Función para manejar ordenamiento
  const handleSort = (field: keyof Purchase) => {
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
  const getSortedPurchases = () => {
    if (!purchases || !Array.isArray(purchases)) {
      return [];
    }

    return [...purchases].sort((a, b) => {
      if (sortField === 'supplier') {
        // Ordenar por nombre de proveedor
        const aValue = a.supplier.name;
        const bValue = b.supplier.name;
        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      } else {
        // Para otros campos
        const aValue = a[sortField] ?? '';
        const bValue = b[sortField] ?? '';

        // Para fechas
        if (sortField === 'createdAt' || sortField === 'updatedAt') {
          return sortDirection === 'asc'
            ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
            : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
        }

        // Para valores normales
        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });
  };

  // Obtener clase CSS para estado
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'completed':
        return 'bg-success text-white';
      case 'canceled':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  // Obtener nombre de estado
  const getStatusName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completada';
      case 'canceled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Layout>
      <div className="purchases-page-container">
        <PurchasesBackground />

        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
          <h1 className="h2 font-heading" style={{ color: '#099347' }}>Compras a Proveedores</h1>
          <button
            className="btn"
            style={{ backgroundColor: '#099347', color: 'white' }}
            onClick={() => openModal('create')}
          >
            <i className="bi bi-plus-circle me-1"></i> Nueva Compra
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSearch} className="row g-3">
              <div className="col-md-4">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por N° documento o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="submit"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-search"></i>
                    )}
                  </button>
                  {(searchTerm || filterStatus || filterSupplier) && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={resetSearch}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className="col-md-4">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="completed">Completada</option>
                  <option value="canceled">Cancelada</option>
                </select>
              </div>

              <div className="col-md-4">
                <select
                  className="form-select"
                  value={filterSupplier}
                  onChange={(e) => setFilterSupplier(e.target.value)}
                >
                  <option value="">Todos los proveedores</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>
        </div>

        {/* Lista de compras */}
        {error && (
          <div className="alert text-white" style={{ backgroundColor: '#dc3545' }} role="alert">
            {error}
          </div>
        )}

        {loading && !error && !isSearching ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border" style={{ color: '#099347' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <>
            {!purchases || purchases.length === 0 ? (
              <div className="alert alert-info" role="alert">
                {searchTerm || filterStatus || filterSupplier ? "No se encontraron compras con esos criterios de búsqueda." : "No hay compras registradas."}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                        Fecha
                        <i className={`bi ms-1 ${sortField === 'createdAt'
                          ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                          : 'bi-arrow-down-square'}`}></i>
                      </th>
                      <th onClick={() => handleSort('supplier')} style={{ cursor: 'pointer' }}>
                        Proveedor
                        <i className={`bi ms-1 ${sortField === 'supplier'
                          ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                          : 'bi-arrow-down-square'}`}></i>
                      </th>
                      <th onClick={() => handleSort('documentNumber')} style={{ cursor: 'pointer' }}>
                        N° Factura
                        <i className={`bi ms-1 ${sortField === 'documentNumber'
                          ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                          : 'bi-arrow-down-square'}`}></i>
                      </th>
                      <th onClick={() => handleSort('totalAmount')} style={{ cursor: 'pointer' }}>
                        Total
                        <i className={`bi ms-1 ${sortField === 'totalAmount'
                          ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                          : 'bi-arrow-down-square'}`}></i>
                      </th>
                      <th>Estado</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedPurchases().map(purchase => (
                      <tr key={purchase._id}>
                        <td>{formatDate(purchase.createdAt)}</td>
                        <td>{purchase.supplier.name}</td>
                        <td>{purchase.documentNumber || '-'}</td>
                        <td>${purchase.totalAmount.toLocaleString('es-CL')}</td>
                        <td>
                          <span className={`badge ${getStatusClass(purchase.status)}`}>
                            {getStatusName(purchase.status)}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => openModal('view', purchase)}
                              title="Ver detalles"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openModal('edit', purchase)}
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => openModal('delete', purchase)}
                              title="Eliminar"
                            >
                              <i className="bi bi-trash"></i>
                            </button>

                            {/* Dropdown para cambio rápido de estado */}
                            <div className="btn-group">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <i className="bi bi-arrow-repeat"></i>
                              </button>
                              <ul className="dropdown-menu">
                                {purchase.status !== 'pending' && (
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleStatusChange(purchase, 'pending')}
                                    >
                                      <i className="bi bi-clock text-warning me-2"></i>
                                      Marcar como Pendiente
                                    </button>
                                  </li>
                                )}
                                {purchase.status !== 'completed' && (
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleStatusChange(purchase, 'completed')}
                                    >
                                      <i className="bi bi-check-circle text-success me-2"></i>
                                      Marcar como Completada
                                    </button>
                                  </li>
                                )}
                                {purchase.status !== 'canceled' && (
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleStatusChange(purchase, 'canceled')}
                                    >
                                      <i className="bi bi-x-circle text-danger me-2"></i>
                                      Marcar como Cancelada
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
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

        {/* Modal para crear/editar/eliminar compras */}
        <PurchaseModal
          show={modalType !== null}
          onHide={closeModal}
          onSubmit={handleModalSubmit}
          purchase={selectedPurchase}
          modalType={modalType || 'view'}
          loading={modalLoading}
        />
      </div>
    </Layout>
  );
} 