import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getClientDetails } from '../services/clientDetailService';
import { updateClient, getClient } from '../services/clientService';
import { ClientDetailData, Purchase } from '../types/clientDetail';
import { Client, CreateClientRequest, UpdateClientRequest } from '../types/client';
import { formatRut } from '../utils/validators';
import ClientModal from '../components/ClientModal';
import BuyersBackground from '../components/BuyersBackground';
import PrintLabel from '../components/PrintLabel';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [clientData, setClientData] = useState<ClientDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showPrintLabel, setShowPrintLabel] = useState<boolean>(false);

  // Estado para ordenamiento de ventas
  const [sortField, setSortField] = useState<keyof Purchase>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [fullClientData, setFullClientData] = useState<Client | null>(null);

  // Función para cargar los datos del cliente
  const loadClientDetail = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getClientDetails(id);
      setClientData(response.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    loadClientDetail();
  }, [id]);

  // Navegar al detalle del proveedor si también es proveedor
  const navigateToSupplierDetail = () => {
    if (clientData?.isSupplier && clientData?.supplierId) {
      navigate(`/proveedor/${clientData.supplierId}`);
    }
  };

  // Función para ordenar las ventas
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

  // Obtener las ventas ordenadas
  const getSortedPurchases = () => {
    if (!clientData?.purchases) return [];

    return [...clientData.purchases].sort((a, b) => {
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
  const formatPrice = (number: number) => {
    return number.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    });
  };

  // Definir clases para ordenamiento
  const getSortClass = (field: keyof Purchase) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  };

  // Abrir modal de edición
  const openEditModal = async () => {
    if (!id) return;

    try {
      // Obtener datos completos del cliente antes de abrir el modal
      const response = await getClient(id);
      setFullClientData(response.data);
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
  const handleModalSubmit = async (formData: CreateClientRequest | UpdateClientRequest) => {
    if (!id) return;

    setModalLoading(true);
    setError(null);

    try {
      await updateClient(id, formData);

      // Recargar datos del cliente para reflejar los cambios
      await loadClientDetail();

      closeEditModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setModalLoading(false);
    }
  };

  // Mostrar modal de impresión
  const openPrintLabel = async () => {
    if (!id) return;

    try {
      // Obtener datos completos del cliente antes de abrir el modal de impresión
      if (!fullClientData) {
        const response = await getClient(id);
        setFullClientData(response.data);
      }
      setShowPrintLabel(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Cerrar modal de impresión
  const closePrintLabel = () => {
    setShowPrintLabel(false);
  };

  return (
    <Layout>
      <div className="buyers-page-container">
        <BuyersBackground />
        {/* Botón para volver */}
        <div className="d-flex mb-4">
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => navigate('/compradores')}
          >
            <i className="bi bi-arrow-left me-1"></i> Volver a Compradores
          </button>

          {/* Botón para ir al detalle de proveedor si también es proveedor */}
          {clientData?.isSupplier && clientData?.supplierId && (
            <button
              className="btn btn-outline-primary"
              onClick={navigateToSupplierDetail}
            >
              <i className="bi bi-box-seam-fill me-1"></i> Ver como Proveedor
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
        ) : clientData ? (
          <>
            {/* Información básica del cliente */}
            <div className="card mb-4 border-0 shadow-sm">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <h2 className="mb-3">{clientData.client.name} <span className="badge rounded-pill bg-success fs-6">Comprador</span></h2>
                    <p className="mb-1">
                      <strong>RUT:</strong> {formatRut(clientData.client.rut)}
                    </p>
                    {/* Aquí puedes agregar más datos del cliente si los tienes */}
                  </div>
                  <div className="col-md-4 text-md-end">
                    <button
                      className="btn btn-success me-2"
                      onClick={openEditModal}
                    >
                      <i className="bi bi-pencil-square me-1"></i> Editar Cliente
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      onClick={openPrintLabel}
                    >
                      <i className="bi bi-printer me-1"></i> Imprimir Datos
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas del cliente */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Total Ventas</h6>
                    <h3>{clientData.statistics.totalPurchases}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Total Gastado</h6>
                    <h3>{formatPrice(clientData.statistics.totalSpent)}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Ticket Promedio</h6>
                    <h3>{formatPrice(clientData.statistics.averagePurchase)}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Primera/Última Venta</h6>
                    <p className="mb-0">{formatDate(clientData.statistics.firstPurchaseDate)}</p>
                    <p className="mb-0">{formatDate(clientData.statistics.lastPurchaseDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Historial de ventas */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Historial de Ventas</h5>
                {/* Botón de Nueva Venta temporalmente removido
                <div>
                  <button className="btn btn-sm btn-success">
                    <i className="bi bi-plus-circle me-1"></i> Nueva Venta
                  </button>
                </div>
                */}
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
                          {sortField === 'folio' && (
                            <i className={`bi ${getSortClass('folio')} ms-1`}></i>
                          )}
                        </th>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('date')}
                        >
                          Fecha
                          {sortField === 'date' && (
                            <i className={`bi ${getSortClass('date')} ms-1`}></i>
                          )}
                        </th>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('total')}
                        >
                          Total
                          {sortField === 'total' && (
                            <i className={`bi ${getSortClass('total')} ms-1`}></i>
                          )}
                        </th>
                        <th
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSort('status')}
                        >
                          Estado
                          {sortField === 'status' && (
                            <i className={`bi ${getSortClass('status')} ms-1`}></i>
                          )}
                        </th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedPurchases().length > 0 ? (
                        getSortedPurchases().map(purchase => (
                          <tr key={purchase._id}>
                            <td>{purchase.folio}</td>
                            <td>{formatDate(purchase.date)}</td>
                            <td>{formatPrice(purchase.total)}</td>
                            <td>
                              <span className={`badge ${purchase.status === 'Pagado' ? 'bg-success' :
                                purchase.status === 'Pendiente' ? 'bg-warning' :
                                  'bg-danger'
                                }`}>
                                {purchase.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => navigate(`/ventas/${purchase._id}`)}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-3">
                            No hay ventas registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Detalle de la última venta */}
            {clientData.purchases.length > 0 && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom-0">
                  <h5 className="mb-0">Última Venta (Detalle)</h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <p className="mb-1"><strong>Folio:</strong> {clientData.purchases[0].folio}</p>
                      <p className="mb-1"><strong>Fecha:</strong> {formatDate(clientData.purchases[0].date)}</p>
                    </div>
                    <div className="col-md-4">
                      <p className="mb-1"><strong>Estado:</strong> {clientData.purchases[0].status}</p>
                      <p className="mb-1"><strong>Total:</strong> {formatPrice(clientData.purchases[0].total)}</p>
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
                        {clientData.purchases[0].items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.product}</td>
                            <td>{item.quantity}</td>
                            <td>{formatPrice(item.unitPrice)}</td>
                            <td>{formatPrice(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                          <td><strong>{formatPrice(clientData.purchases[0].total)}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Modal para editar cliente */}
            {showEditModal && fullClientData && (
              <ClientModal
                isOpen={showEditModal}
                modalType="edit"
                selectedClient={fullClientData}
                loading={modalLoading}
                onClose={closeEditModal}
                onSubmit={handleModalSubmit}
              />
            )}

            {/* Modal para imprimir etiqueta */}
            {fullClientData && (
              <PrintLabel
                client={fullClientData}
                isOpen={showPrintLabel}
                onClose={closePrintLabel}
              />
            )}
          </>
        ) : (
          <div className="alert alert-warning">No se encontró información del cliente</div>
        )}
      </div>
    </Layout>
  );
} 