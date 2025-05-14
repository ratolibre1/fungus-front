import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getQuotation, updateQuotation, convertToSale } from '../services/quotationService';
import { getClients } from '../services/clientService';
import { getProducts } from '../services/productService';
import { Quotation, QuotationStatus, ConvertToSaleRequest, UpdateQuotationRequest } from '../types/quotation';
import { Client } from '../types/client';
import { Product } from '../types/product';
import QuotationModal from '../components/QuotationModal';
import QuotationsBackground from '../components/QuotationsBackground';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;

export default function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para modal de edición
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  // Datos necesarios para el modal
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Estado para convertir a venta
  const [showConvertModal, setShowConvertModal] = useState<boolean>(false);
  const [convertLoading, setConvertLoading] = useState<boolean>(false);
  const [convertData, setConvertData] = useState<ConvertToSaleRequest>({
    documentType: 'factura',
    documentNumber: 0
  });

  // Estado para cambiar status
  const [statusChangeLoading, setStatusChangeLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const fetchQuotation = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getQuotation(id);
        setQuotation(response.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
    loadModalData();
  }, [id]);

  // Cargar clientes y productos necesarios para el modal
  const loadModalData = async () => {
    setIsLoadingData(true);
    try {
      const [clientsResponse, productsResponse] = await Promise.all([
        getClients(),
        getProducts({})
      ]);
      setClients(clientsResponse.data);
      setProducts(productsResponse.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Fecha no disponible';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CL');
    } catch {
      return 'Fecha inválida';
    }
  };

  // Función para formatear montos
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '$0';

    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  // Obtener texto y color según estado
  const getStatusInfo = (status: QuotationStatus) => {
    switch (status) {
      case 'pending':
        return { text: 'Pendiente', color: '#ffc107' };
      case 'approved':
        return { text: 'Aprobada', color: '#28a745' };
      case 'rejected':
        return { text: 'Rechazada', color: '#dc3545' };
      case 'converted':
        return { text: 'Convertida', color: '#17a2b8' };
      case 'expired':
        return { text: 'Expirada', color: '#6c757d' };
      default:
        return { text: 'Desconocido', color: '#6c757d' };
    }
  };

  // Cambiar estado de la cotización
  const handleStatusChange = async (status: QuotationStatus) => {
    if (!quotation) return;

    setStatusChangeLoading(true);

    try {
      const response = await updateQuotation(quotation._id, { status });
      setQuotation(response.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Manejar cambios en formulario de conversión
  const handleConvertInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConvertData(prev => ({
      ...prev,
      [name]: name === 'documentNumber' ? parseInt(value, 10) : value
    }));
  };

  // Abrir modal para convertir a venta
  const openConvertModal = () => {
    setShowConvertModal(true);
  };

  // Cerrar modal de conversión
  const closeConvertModal = () => {
    setShowConvertModal(false);
  };

  // Convertir a venta
  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotation) return;

    setConvertLoading(true);

    try {
      await convertToSale(quotation._id, convertData);
      // Recargar cotización para mostrar nuevo estado
      const response = await getQuotation(quotation._id);
      setQuotation(response.data);
      closeConvertModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setConvertLoading(false);
    }
  };

  // Abrir modal
  const openModal = (type: ModalType) => {
    setModalType(type);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalType(null);
  };

  // Manejar submit del formulario del modal
  const handleModalSubmit = async (formData: UpdateQuotationRequest) => {
    if (!quotation) return;

    setModalLoading(true);
    setError(null);

    try {
      const response = await updateQuotation(quotation._id, formData);
      setQuotation(response.data);
      closeModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" style={{ color: '#099347' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/cotizaciones')}
        >
          Volver
        </button>
      </Layout>
    );
  }

  if (!quotation) {
    return (
      <Layout>
        <div className="alert alert-warning" role="alert">
          No se encontró la cotización solicitada.
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/cotizaciones')}
        >
          Volver
        </button>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="quotations-page-container">
        <QuotationsBackground />
        {/* Encabezado */}
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
          <h1 className="h2 font-heading" style={{ color: '#099347' }}>
            Cotización N° {quotation.correlative}
          </h1>
          <div>
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => navigate('/cotizaciones')}
            >
              <i className="bi bi-arrow-left me-1"></i> Volver
            </button>
            {quotation.status === 'pending' && (
              <button
                className="btn me-2"
                style={{ backgroundColor: '#099347', color: 'white' }}
                onClick={() => openModal('edit')}
              >
                <i className="bi bi-pencil me-1"></i> Editar
              </button>
            )}
            {quotation.status === 'approved' && (
              <button
                className="btn btn-primary"
                onClick={openConvertModal}
              >
                <i className="bi bi-credit-card me-1"></i> Convertir a Venta
              </button>
            )}
          </div>
        </div>

        {/* Información General */}
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom-0 pt-4">
                <h5 className="card-title mb-0">Información General</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Fecha:</strong> {formatDate(quotation.date)}</p>
                    <p>
                      <strong>Estado:</strong>
                      <span
                        className="badge rounded-pill ms-2"
                        style={{
                          backgroundColor: getStatusInfo(quotation.status).color,
                          color: quotation.status === 'pending' ? 'black' : 'white'
                        }}
                      >
                        {getStatusInfo(quotation.status).text}
                      </span>
                    </p>
                    <p><strong>Creada:</strong> {formatDate(quotation.createdAt)}</p>
                    <p><strong>Actualizada:</strong> {formatDate(quotation.updatedAt)}</p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Cliente:</strong> {
                        quotation.client && typeof quotation.client === 'object' && quotation.client.name
                          ? quotation.client.name
                          : 'Cliente no disponible'
                      }
                    </p>
                    <p>
                      <strong>RUT:</strong> {
                        quotation.client && typeof quotation.client === 'object' && quotation.client.rut
                          ? quotation.client.rut
                          : '-'
                      }
                    </p>
                    <p>
                      <strong>Vendedor:</strong> {
                        quotation.seller && typeof quotation.seller === 'object' && quotation.seller.name
                          ? quotation.seller.name
                          : 'Vendedor no disponible'
                      }
                    </p>
                    {quotation.observations && (
                      <p><strong>Observaciones:</strong> {quotation.observations}</p>
                    )}
                  </div>
                </div>

                {/* Acciones de cambio de estado para cotizaciones pendientes */}
                {quotation.status === 'pending' && (
                  <div className="mt-3 d-flex justify-content-end">
                    <button
                      className="btn btn-success me-2"
                      onClick={() => handleStatusChange('approved')}
                      disabled={statusChangeLoading}
                    >
                      {statusChangeLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-1"></i> Aprobar
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleStatusChange('rejected')}
                      disabled={statusChangeLoading}
                    >
                      <i className="bi bi-x-circle me-1"></i> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detalle de Productos */}
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom-0 pt-4">
                <h5 className="card-title mb-0">Detalle de Productos</h5>
              </div>
              <div className="card-body">
                {quotation.items && quotation.items.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Precio Unitario</th>
                          <th className="text-end">Descuento</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotation.items && quotation.items.map((item) => (
                          <tr key={item._id}>
                            <td>
                              {item.product && typeof item.product === 'object' && item.product.name
                                ? item.product.name
                                : 'Producto no disponible'}
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-end">
                              {item.discount > 0
                                ? `${item.discount}%`
                                : '-'}
                            </td>
                            <td className="text-end">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-group-divider">
                        <tr>
                          <td colSpan={4} className="text-end"><strong>Neto:</strong></td>
                          <td className="text-end">{formatCurrency(quotation.netAmount)}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="text-end"><strong>IVA (19%):</strong></td>
                          <td className="text-end">{formatCurrency(quotation.taxAmount)}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="text-end"><strong>Total:</strong></td>
                          <td className="text-end"><strong>{formatCurrency(quotation.totalAmount)}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    No hay productos en esta cotización.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal para convertir a venta */}
        {showConvertModal && (
          <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Convertir a Venta</h5>
                  <button type="button" className="btn-close" onClick={closeConvertModal}></button>
                </div>
                <form onSubmit={handleConvert}>
                  <div className="modal-body">
                    <p>Está a punto de convertir la cotización N° {quotation.correlative} en una venta.</p>

                    <div className="mb-3">
                      <label htmlFor="documentType" className="form-label">Tipo de Documento</label>
                      <select
                        id="documentType"
                        name="documentType"
                        className="form-select"
                        value={convertData.documentType}
                        onChange={handleConvertInputChange}
                        required
                      >
                        <option value="factura">Factura</option>
                        <option value="boleta">Boleta</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="documentNumber" className="form-label">Número de Documento</label>
                      <input
                        type="number"
                        id="documentNumber"
                        name="documentNumber"
                        className="form-control"
                        value={convertData.documentNumber}
                        onChange={handleConvertInputChange}
                        required
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeConvertModal}>Cancelar</button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={convertLoading}
                    >
                      {convertLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Procesando...
                        </>
                      ) : (
                        'Convertir'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal para Editar */}
        <QuotationModal
          isOpen={modalType !== null}
          modalType={modalType || 'view'} // Valor por defecto para evitar null
          selectedQuotation={quotation}
          loading={modalLoading || isLoadingData}
          clients={clients}
          products={products}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
        />
      </div>
    </Layout>
  );
} 