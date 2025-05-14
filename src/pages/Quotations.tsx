import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  getQuotations,
  deleteQuotation,
  updateQuotation,
  createQuotation
} from '../services/quotationService';
import { getClients } from '../services/clientService';
import { getProducts } from '../services/productService';
import { Quotation, QuotationStatus, CreateQuotationRequest, UpdateQuotationRequest } from '../types/quotation';
import { Client } from '../types/client';
import { Product } from '../types/product';
import QuotationModal from '../components/QuotationModal';
import QuotationsBackground from '../components/QuotationsBackground';
import { compareStringsSpanish } from '../utils/validators';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;

export default function Quotations() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para ordenamiento
  const [sortField, setSortField] = useState<keyof Quotation>('correlative');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // Más recientes primero

  // Estados para el modal de cotización
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  // Datos necesarios para el modal
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Cargar cotizaciones
  const loadQuotations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getQuotations();

      // Asegurarse de que response.data sea un array 
      if (response.success && response.data) {
        setQuotations(Array.isArray(response.data) ? response.data : []);
      } else {
        // Si no hay datos o no es un array, inicializar con array vacío
        setQuotations([]);
      }
    } catch (err) {
      setError((err as Error).message);
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Cargar al montar el componente
  useEffect(() => {
    loadQuotations();
    loadModalData();
  }, []);

  // Función para manejar ordenamiento
  const handleSort = (field: keyof Quotation) => {
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
  const getSortedQuotations = () => {
    if (!quotations || quotations.length === 0) {
      return [];
    }

    return [...quotations].sort((a, b) => {
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

  // Abrir modal
  const openModal = (type: ModalType, quotation: Quotation | null = null) => {
    console.log('Abriendo modal:', type, quotation);
    setModalType(type);
    setSelectedQuotation(quotation);

    // Verificar que efectivamente se cargan los datos necesarios para el modal
    if (type === 'edit' && !isLoadingData && clients.length === 0) {
      loadModalData();
    }
  };

  // Cerrar modal
  const closeModal = () => {
    setModalType(null);
    setSelectedQuotation(null);
  };

  // Manejar submit del formulario del modal
  const handleModalSubmit = async (formData: CreateQuotationRequest | UpdateQuotationRequest) => {
    setModalLoading(true);
    setError(null);

    try {
      if (modalType === 'create') {
        await createQuotation(formData as CreateQuotationRequest);
      } else if (modalType === 'edit' && selectedQuotation) {
        await updateQuotation(selectedQuotation._id, formData as UpdateQuotationRequest);
      } else if (modalType === 'delete' && selectedQuotation) {
        await deleteQuotation(selectedQuotation._id);
      }

      loadQuotations(); // Recargar la lista
      closeModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setModalLoading(false);
    }
  };

  // Función para ir a la página de detalle
  const goToDetail = (id: string) => {
    navigate(`/cotizacion/${id}`);
  };

  // Función para cambiar estado (simple, sin modal)
  const changeStatus = async (id: string, status: QuotationStatus) => {
    try {
      await updateQuotation(id, { status });
      loadQuotations(); // Recargar la lista
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Layout>
      <div className="quotations-page-container">
        <QuotationsBackground />
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
          <h1 className="h2 font-heading" style={{ color: '#099347' }}>Cotizaciones</h1>
          <button
            className="btn"
            style={{ backgroundColor: '#099347', color: 'white' }}
            onClick={() => openModal('create')}
          >
            <i className="bi bi-plus-circle me-1"></i> Nueva Cotización
          </button>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Contenido principal */}
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border" style={{ color: '#099347' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (!quotations || !Array.isArray(quotations) || quotations.length === 0) ? (
          <div className="alert alert-info" role="alert">
            No hay cotizaciones disponibles.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th onClick={() => handleSort('correlative')} style={{ cursor: 'pointer' }}>
                    N° Cotización
                    <i className={`bi ms-1 ${sortField === 'correlative'
                      ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                      : 'bi-arrow-down-square'}`}></i>
                  </th>
                  <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                    Fecha
                    <i className={`bi ms-1 ${sortField === 'date'
                      ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                      : 'bi-arrow-down-square'}`}></i>
                  </th>
                  <th onClick={() => handleSort('client')} style={{ cursor: 'pointer' }}>
                    Cliente
                    <i className={`bi ms-1 ${sortField === 'client'
                      ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                      : 'bi-arrow-down-square'}`}></i>
                  </th>
                  <th onClick={() => handleSort('totalAmount')} style={{ cursor: 'pointer' }}>
                    Total
                    <i className={`bi ms-1 ${sortField === 'totalAmount'
                      ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                      : 'bi-arrow-down-square'}`}></i>
                  </th>
                  <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                    Estado
                    <i className={`bi ms-1 ${sortField === 'status'
                      ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                      : 'bi-arrow-down-square'}`}></i>
                  </th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {getSortedQuotations().map(quotation => (
                  <tr key={quotation._id}>
                    <td>{quotation.correlative}</td>
                    <td>{quotation.date ? formatDate(quotation.date) : 'Fecha no disponible'}</td>
                    <td>
                      {quotation.client && typeof quotation.client === 'object' && quotation.client.name
                        ? quotation.client.name
                        : 'Cliente no disponible'}
                    </td>
                    <td>{quotation.totalAmount ? formatCurrency(quotation.totalAmount) : '$0'}</td>
                    <td>
                      <span
                        className="badge rounded-pill"
                        style={{
                          backgroundColor: getStatusInfo(quotation.status).color,
                          color: quotation.status === 'pending' ? 'black' : 'white'
                        }}
                      >
                        {getStatusInfo(quotation.status).text}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group" style={{ gap: '4px' }}>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            goToDetail(quotation._id);
                          }}
                          title="Ver detalle"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        {quotation.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                changeStatus(quotation._id, 'approved');
                              }}
                              title="Aprobar"
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openModal('edit', quotation);
                              }}
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openModal('delete', quotation);
                          }}
                          title="Eliminar"
                          disabled={quotation.status === 'converted'}
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

        {/* Modal para Crear/Editar/Eliminar */}
        <QuotationModal
          isOpen={modalType !== null}
          modalType={modalType || 'view'} // Valor por defecto para evitar null
          selectedQuotation={selectedQuotation}
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