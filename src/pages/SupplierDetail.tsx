import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getSupplierDetails, getSupplierTransactions } from '../services/supplierDetailService';
import { updateSupplier, getSupplier } from '../services/supplierService';
import { SupplierDetailData, Purchase, Transaction } from '../types/supplierDetail';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../types/supplier';
import { formatRut } from '../utils/validators';
import SupplierModal from '../components/SupplierModal';
import SuppliersBackground from '../components/SuppliersBackground';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [supplierData, setSupplierData] = useState<SupplierDetailData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showPurchaseDetailModal, setShowPurchaseDetailModal] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Estado para ordenamiento de compras
  const [sortField, setSortField] = useState<keyof Purchase>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [fullSupplierData, setFullSupplierData] = useState<Supplier | null>(null);

  // Función para cargar los datos del proveedor
  const loadSupplierDetail = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const [detailResponse, transactionsResponse] = await Promise.all([
        getSupplierDetails(id),
        getSupplierTransactions(id, 1, 50)
      ]);

      setSupplierData(detailResponse.data);
      setTransactions(transactionsResponse.data.transactions || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    loadSupplierDetail();
  }, [id]);

  // Función para ordenar las compras
  const handleSort = (field: keyof Purchase) => {
    if (sortField === field) {
      // Si ya estamos ordenando por este campo, cambiamos la dirección
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Si cambiamos el campo, ponemos la dirección predeterminada
      setSortField(field);
      setSortDirection('desc'); // Por defecto ordenamos descendentemente (lo más reciente primero)
    }
  };

  // Obtener las compras ordenadas
  const getSortedPurchases = () => {
    if (!supplierData?.purchases) return [];

    return [...supplierData.purchases].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        comparison = dateA - dateB;
      } else if (sortField === 'total') {
        comparison = a.total - b.total;
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else {
        comparison = a[sortField].toString().localeCompare(b[sortField].toString());
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Formatear fecha en formato local
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    // Si la fecha es inválida o es 1969 (fecha null convertida a Date)
    if (isNaN(date.getTime()) || date.getFullYear() === 1969) {
      return '-';
    }

    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear número como precio en CLP
  const formatPrice = (number: number | undefined | null) => {
    if (number === undefined || number === null || isNaN(number)) {
      return '$0';
    }
    return number.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    });
  };

  // Mapear estado del backend a texto y color para badges
  const getStatusInfo = (status: string) => {
    // Los estados pueden venir en inglés del backend o ya traducidos del resumen
    const statusMap = {
      // Estados del backend (inglés)
      'paid': { text: 'Pagada', color: 'bg-success' },
      'pending': { text: 'Pendiente', color: 'bg-warning' },
      'invoiced': { text: 'Facturada', color: 'bg-info' },
      'cancelled': { text: 'Anulada', color: 'bg-danger' },
      // Estados ya traducidos del resumen (español)
      'Pagada': { text: 'Pagada', color: 'bg-success' },
      'Pagado': { text: 'Pagada', color: 'bg-success' },
      'Pendiente': { text: 'Pendiente', color: 'bg-warning' },
      'Facturada': { text: 'Facturada', color: 'bg-info' },
      'Facturado': { text: 'Facturada', color: 'bg-info' },
      'Anulada': { text: 'Anulada', color: 'bg-danger' },
      'Cancelada': { text: 'Anulada', color: 'bg-danger' },
      'Cancelado': { text: 'Anulada', color: 'bg-danger' }
    };

    return statusMap[status] || { text: status, color: 'bg-secondary' };
  };

  // Obtener el ícono de ordenamiento como en otras tablas
  const getSortIcon = (field: keyof Purchase) => {
    if (!sortField || sortField !== field) {
      return <i className="bi bi-arrow-down-square ms-1"></i>;
    }

    return sortDirection === 'asc'
      ? <i className="bi bi-arrow-up-square-fill ms-1"></i>
      : <i className="bi bi-arrow-down-square-fill ms-1"></i>;
  };

  // Abrir modal de edición
  const openEditModal = async () => {
    if (!id) return;

    try {
      // Obtener datos completos del proveedor antes de abrir el modal
      const response = await getSupplier(id);
      setFullSupplierData(response.data);
      setShowEditModal(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Cerrar modal de edición
  const closeEditModal = () => {
    setShowEditModal(false);
  };

  // Manejar submit del formulario del modal
  const handleModalSubmit = async (formData: CreateSupplierRequest | UpdateSupplierRequest) => {
    if (!id) return;

    setModalLoading(true);
    setError(null);

    try {
      await updateSupplier(id, formData);

      // Recargar datos del proveedor para reflejar los cambios
      await loadSupplierDetail();

      closeEditModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setModalLoading(false);
    }
  };

  // Abrir modal de detalle de compra
  const openPurchaseDetailModal = (purchase: Purchase) => {
    setSelectedTransaction(transactions.find(t => t._id === purchase._id) || null);
    setShowPurchaseDetailModal(true);
  };

  // Cerrar modal de detalle de compra
  const closePurchaseDetailModal = () => {
    setSelectedTransaction(null);
    setShowPurchaseDetailModal(false);
  };

  // Navegar al detalle del cliente si también es cliente
  const navigateToClientDetail = () => {
    if (supplierData?.isCustomer && supplierData?.customerId) {
      navigate(`/comprador/${supplierData.customerId}`);
    }
  };

  return (
    <Layout>
      <div className="suppliers-page-container">
        <SuppliersBackground />
        {/* Botón para volver */}
        <div className="d-flex mb-4">
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => navigate('/proveedores')}
          >
            <i className="bi bi-arrow-left me-1"></i> Volver a Proveedores
          </button>

          {/* Botón para ir al detalle de cliente si también es cliente */}
          {supplierData?.isCustomer && supplierData?.customerId && (
            <button
              className="btn btn-outline-primary"
              onClick={navigateToClientDetail}
            >
              <i className="bi bi-people-fill me-1"></i> Ver como Comprador
            </button>
          )}
        </div>

        {loading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" style={{ color: '#099347' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : supplierData ? (
          <>
            {/* Información básica del proveedor */}
            <div className="card mb-4 border-0 shadow-sm">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <h2 className="mb-3">{supplierData.supplier.name} <span className="badge rounded-pill bg-success fs-6">Proveedor</span></h2>
                    <p className="mb-1">
                      <strong>RUT:</strong> {formatRut(supplierData.supplier.rut)}
                    </p>
                    {/* Aquí puedes agregar más datos del proveedor si los tienes */}
                  </div>
                  <div className="col-md-4 text-md-end">
                    <button
                      className="btn btn-success"
                      onClick={openEditModal}
                    >
                      <i className="bi bi-pencil-square me-1"></i> Editar Proveedor
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas del proveedor */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Total Compras</h6>
                    <h3>{supplierData.statistics?.totalPurchases || 0}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Total Gastado</h6>
                    <h3>{supplierData.statistics?.totalPaid ? formatPrice(supplierData.statistics.totalPaid) : formatPrice(0)}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Ticket Promedio</h6>
                    <h3>{supplierData.statistics?.averagePurchase ? formatPrice(supplierData.statistics.averagePurchase) : formatPrice(0)}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Primera/Última Compra</h6>
                    <p className="mb-0">{supplierData.statistics?.firstPurchaseDate ? formatDate(supplierData.statistics.firstPurchaseDate) : '-'}</p>
                    <p className="mb-0">{supplierData.statistics?.lastPurchaseDate ? formatDate(supplierData.statistics.lastPurchaseDate) : '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Historial de compras */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Historial de Compras</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('folio')}
                        >
                          N° Folio
                          {getSortIcon('folio')}
                        </th>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('date')}
                        >
                          Fecha
                          {getSortIcon('date')}
                        </th>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('total')}
                        >
                          Total
                          {getSortIcon('total')}
                        </th>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('status')}
                        >
                          Estado
                          {getSortIcon('status')}
                        </th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedPurchases().length > 0 ? (
                        getSortedPurchases().map(purchase => {
                          // Buscar la transacción completa correspondiente
                          const fullTransaction = transactions.find(t => t._id === purchase._id);
                          const statusToShow = fullTransaction ? fullTransaction.status : purchase.status;

                          return (
                            <tr key={purchase._id}>
                              <td>{purchase.folio}</td>
                              <td>{formatDate(purchase.date)}</td>
                              <td>{formatPrice(purchase.total)}</td>
                              <td>
                                <span className={`badge ${getStatusInfo(statusToShow as string).color}`}>
                                  {getStatusInfo(statusToShow as string).text}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openPurchaseDetailModal(purchase)}
                                  title="Ver detalle de compra"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-3">
                            No hay compras registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Detalle de la última compra */}
            {supplierData.purchases && supplierData.purchases.length > 0 && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom-0">
                  <h5 className="mb-0">Última Compra (Detalle)</h5>
                </div>
                <div className="card-body">
                  {(() => {
                    const lastTransaction = transactions.find(t => t._id === supplierData.purchases[0]._id);
                    return lastTransaction ? (
                      <>
                        <div className="row mb-3">
                          <div className="col-md-4">
                            <p className="mb-1"><strong>Folio:</strong> {supplierData.purchases[0]?.folio}</p>
                            <p className="mb-1"><strong>Fecha:</strong> {formatDate(supplierData.purchases[0]?.date)}</p>
                          </div>
                          <div className="col-md-4">
                            <p className="mb-1"><strong>Estado:</strong> {getStatusInfo(supplierData.purchases[0]?.status).text}</p>
                            <p className="mb-1"><strong>Total:</strong> {formatPrice(supplierData.purchases[0]?.total || 0)}</p>
                          </div>
                        </div>

                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead className="table-light">
                              <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lastTransaction.itemDetails?.map((item, index) => (
                                <tr key={index}>
                                  <td>
                                    <div>
                                      <strong>{item.name}</strong>
                                      <br />
                                      <small className="text-muted">
                                        {item.description} {item.dimensions && `(${item.dimensions})`}
                                      </small>
                                    </div>
                                  </td>
                                  <td>{item.quantity}</td>
                                  <td>{formatPrice(item.unitPrice)}</td>
                                  <td>{formatPrice((item as any).subtotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan={3} className="text-end"><strong>Neto</strong></td>
                                <td><strong>{formatPrice(lastTransaction.netAmount)}</strong></td>
                              </tr>
                              <tr>
                                <td colSpan={3} className="text-end"><strong>IVA (19%)</strong></td>
                                <td><strong>{formatPrice(lastTransaction.taxAmount)}</strong></td>
                              </tr>
                              <tr>
                                <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                                <td><strong>{formatPrice(lastTransaction.totalAmount)}</strong></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <p className="mb-1"><strong>Folio:</strong> {supplierData.purchases[0]?.folio}</p>
                          <p className="mb-1"><strong>Fecha:</strong> {formatDate(supplierData.purchases[0]?.date)}</p>
                        </div>
                        <div className="col-md-4">
                          <p className="mb-1"><strong>Estado:</strong> {getStatusInfo(supplierData.purchases[0]?.status).text}</p>
                          <p className="mb-1"><strong>Total:</strong> {formatPrice(supplierData.purchases[0]?.total || 0)}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Modal para editar proveedor */}
            {showEditModal && fullSupplierData && (
              <SupplierModal
                isOpen={showEditModal}
                modalType="edit"
                selectedSupplier={fullSupplierData}
                loading={modalLoading}
                onClose={closeEditModal}
                onSubmit={handleModalSubmit}
              />
            )}

            {/* Modal para detalle de compra */}
            {showPurchaseDetailModal && selectedTransaction && (
              <>
                {/* Backdrop del modal */}
                <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>

                {/* Modal */}
                <div
                  className="modal fade show"
                  style={{
                    display: 'block',
                    zIndex: 1055,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                  tabIndex={-1}
                >
                  <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          Detalles de Compra {selectedTransaction.documentNumber}
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={closePurchaseDetailModal}
                          aria-label="Cerrar"
                        />
                      </div>
                      <div className="modal-body">
                        {/* Información general */}
                        <div className="row mb-4">
                          <div className="col-md-6">
                            <h6 className="mb-3">Información General</h6>
                            <p><strong>Fecha:</strong> {formatDate(selectedTransaction.date)}</p>
                            <p><strong>Tipo de documento:</strong> <span className={`badge ${selectedTransaction.documentType === 'boleta' ? 'bg-info text-dark' : 'bg-primary'}`}>
                              {selectedTransaction.documentType === 'boleta' ? 'Boleta' : 'Factura'}
                            </span>
                            </p>
                            <p><strong>Estado:</strong> <span className={`badge ${getStatusInfo(selectedTransaction.status).color}`}>
                              {getStatusInfo(selectedTransaction.status).text}
                            </span>
                            </p>
                            <p><strong>Correlativo:</strong> {selectedTransaction.correlative}</p>
                            <p><strong>Comprador:</strong> {selectedTransaction.userDetails?.name || 'N/A'}</p>
                          </div>
                          <div className="col-md-6">
                            <h6 className="mb-3">Proveedor</h6>
                            <p><strong>Nombre:</strong> {supplierData.supplier.name}</p>
                            <p><strong>RUT:</strong> {formatRut(supplierData.supplier.rut)}</p>
                            {selectedTransaction.userDetails?.email && (
                              <p><strong>Email:</strong> {selectedTransaction.userDetails.email}</p>
                            )}
                          </div>
                        </div>

                        {/* Tabla de items */}
                        <h6 className="mb-3">Detalle de Productos</h6>
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered">
                            <thead className="table-light">
                              <tr>
                                <th style={{ minWidth: '250px' }}>Producto</th>
                                <th className="text-end">Cantidad</th>
                                <th className="text-end">Precio Unit.</th>
                                <th className="text-end">Descuento</th>
                                <th className="text-end">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedTransaction.itemDetails?.map((item, index) => (
                                <tr key={index}>
                                  <td>
                                    <div>
                                      <strong>{item.name}</strong>
                                      <br />
                                      <small className="text-muted">
                                        {item.description} {item.dimensions && `(${item.dimensions})`}
                                      </small>
                                    </div>
                                  </td>
                                  <td className="text-end">{item.quantity}</td>
                                  <td className="text-end">{formatPrice(item.unitPrice)}</td>
                                  <td className="text-end">{formatPrice((item as any).discount || 0)}</td>
                                  <td className="text-end">{formatPrice((item as any).subtotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="table-light">
                              <tr>
                                <td colSpan={4} className="text-end"><strong>Neto</strong></td>
                                <td className="text-end">{formatPrice(selectedTransaction.netAmount)}</td>
                              </tr>
                              <tr>
                                <td colSpan={4} className="text-end"><strong>IVA (19%)</strong></td>
                                <td className="text-end">{formatPrice(selectedTransaction.taxAmount)}</td>
                              </tr>
                              <tr>
                                <td colSpan={4} className="text-end"><strong>Total</strong></td>
                                <td className="text-end">{formatPrice(selectedTransaction.totalAmount)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>

                        {/* Observaciones */}
                        {(selectedTransaction as any).observations && (
                          <div className="mt-4">
                            <h6 className="mb-3">Observaciones</h6>
                            <div className="alert alert-light border" role="alert">
                              <i className="bi bi-info-circle me-2"></i>
                              {(selectedTransaction as any).observations}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={closePurchaseDetailModal}
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="alert alert-warning">No se encontró información del proveedor</div>
        )}
      </div>
    </Layout>
  );
} 