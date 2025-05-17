import React, { useState, useEffect } from 'react';
import { Sale, SaleSearchParams } from '../types/sale';
import { getSales, deleteSale } from '../services/saleService';
import SaleModal from '../components/SaleModal';
import { CreateSaleRequest, UpdateSaleRequest } from '../types/sale';
import { createSale, updateSale } from '../services/saleService';
import { getClients } from '../services/clientService';
import { Client } from '../types/client';
import Layout from '../components/Layout';
import SalesBackground from '../components/SalesBackground';

const SalesPage: React.FC = () => {
  // Estados principales
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  // Estados para el modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | 'view'>('create');
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  // Estados para filtros
  const [searchParams, setSearchParams] = useState<SaleSearchParams>({
    term: '',
    clientId: '',
    startDate: '',
    endDate: ''
  });

  // Estado para búsqueda en curso
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Cargar ventas y clientes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [salesResponse, clientsResponse] = await Promise.all([
          getSales(),
          getClients()
        ]);
        setSales(salesResponse.data);
        setFilteredSales(salesResponse.data);
        setClients(clientsResponse.data);
      } catch (err) {
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros a las ventas
  useEffect(() => {
    if (!sales.length) return;

    let result = [...sales];

    // Filtrar por término de búsqueda (correlativo, número de documento)
    if (searchParams.term) {
      const term = searchParams.term.toLowerCase();
      result = result.filter(sale =>
        sale.correlative.toString().includes(term) ||
        sale.documentNumber.toString().toLowerCase().includes(term) ||
        sale.client.name.toLowerCase().includes(term) ||
        (sale.observations && sale.observations.toLowerCase().includes(term))
      );
    }

    // Filtrar por cliente
    if (searchParams.clientId) {
      result = result.filter(sale => sale.client._id === searchParams.clientId);
    }

    // Filtrar por rango de fechas
    if (searchParams.startDate && searchParams.endDate) {
      const startDate = new Date(searchParams.startDate).getTime();
      const endDate = new Date(searchParams.endDate).getTime();

      result = result.filter(sale => {
        const saleDate = new Date(sale.date).getTime();
        return saleDate >= startDate && saleDate <= endDate;
      });
    }

    setFilteredSales(result);
  }, [sales, searchParams]);

  // Manejar cambios en los filtros
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar búsqueda
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSearching(true);
    try {
      const response = await getSales(searchParams);
      setSales(response.data);
      setFilteredSales(response.data);
    } catch (err) {
      setError('Error al buscar ventas. Por favor, intenta de nuevo.');
      console.error('Error buscando ventas:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Resetear filtros
  const resetFilters = () => {
    setSearchParams({
      term: '',
      clientId: '',
      startDate: '',
      endDate: ''
    });

    // Recargar todos los datos
    const loadSales = async () => {
      setLoading(true);
      try {
        const response = await getSales();
        setSales(response.data);
        setFilteredSales(response.data);
      } catch (error) {
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
        console.error('Error al resetear filtros:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  };

  // Abrir modal para crear venta
  const handleCreateSale = () => {
    setCurrentSale(null);
    setModalType('create');
    setShowModal(true);
  };

  // Abrir modal para editar venta
  const handleEditSale = (sale: Sale) => {
    setCurrentSale(sale);
    setModalType('edit');
    setShowModal(true);
  };

  // Abrir modal para ver detalles de venta
  const handleViewSale = (sale: Sale) => {
    setCurrentSale(sale);
    setModalType('view');
    setShowModal(true);
  };

  // Abrir modal para eliminar venta
  const handleDeleteSale = (sale: Sale) => {
    setCurrentSale(sale);
    setModalType('delete');
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Manejar envío del formulario de modal
  const handleSubmitSale = async (formData: CreateSaleRequest | UpdateSaleRequest) => {
    setModalLoading(true);
    try {
      if (modalType === 'create') {
        await createSale(formData as CreateSaleRequest);
      } else if (modalType === 'edit' && currentSale) {
        await updateSale(currentSale._id, formData as UpdateSaleRequest);
      } else if (modalType === 'delete' && currentSale) {
        await deleteSale(currentSale._id);
      }

      // Recargar datos
      const salesResponse = await getSales();
      setSales(salesResponse.data);
      setFilteredSales(salesResponse.data);

      // Cerrar modal
      setShowModal(false);
    } catch (err) {
      console.error('Error procesando venta:', err);
      setError('Error al procesar la venta. Por favor, intenta de nuevo.');
    } finally {
      setModalLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  // Traducir tipo de documento
  const getDocumentTypeName = (type: string) => {
    return type === 'factura' ? 'Factura' : 'Boleta';
  };

  return (
    <Layout>
      <div className="sales-page-container">
        <SalesBackground />

        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
          <h1 className="h2 font-heading" style={{ color: '#099347' }}>Ventas a Clientes</h1>
          <button
            className="btn"
            style={{ backgroundColor: '#099347', color: 'white' }}
            onClick={handleCreateSale}
          >
            <i className="bi bi-plus-circle me-1"></i> Nueva Venta
          </button>
        </div>

        {error && (
          <div className="alert text-white" style={{ backgroundColor: '#dc3545' }} role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {/* Filtros - Solo mostrar si hay ventas */}
        {!loading && filteredSales.length > 0 && (
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSearch} className="row g-3">
                <div className="col-md-4 mb-2 mb-md-0">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por N° correlativo o cliente..."
                      name="term"
                      value={searchParams.term}
                      onChange={handleSearchChange}
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
                    {(searchParams.term || searchParams.clientId || searchParams.startDate || searchParams.endDate) && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={resetFilters}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="col-md-3 mb-2 mb-md-0">
                  <select
                    className="form-select"
                    name="clientId"
                    value={searchParams.clientId}
                    onChange={handleSearchChange}
                  >
                    <option value="">Todos los clientes</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2 mb-2 mb-md-0">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="Desde"
                    name="startDate"
                    value={searchParams.startDate}
                    onChange={handleSearchChange}
                  />
                </div>

                <div className="col-md-2 mb-2 mb-md-0">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="Hasta"
                    name="endDate"
                    value={searchParams.endDate}
                    onChange={handleSearchChange}
                  />
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border" style={{ color: '#099347' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="alert alert-info">
            {searchParams.term || searchParams.clientId || searchParams.startDate || searchParams.endDate ?
              "No se encontraron ventas que coincidan con los filtros aplicados." :
              "No hay ventas registradas."}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th>Correlativo</th>
                  <th>Documento</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Neto</th>
                  <th>IVA</th>
                  <th>Total</th>
                  <th>Vendedor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale._id}>
                    <td>{sale.correlative}</td>
                    <td>
                      {getDocumentTypeName(sale.documentType)} {sale.documentNumber}
                    </td>
                    <td>{formatDate(sale.date)}</td>
                    <td>{sale.client.name}</td>
                    <td>{formatCurrency(sale.netAmount)}</td>
                    <td>{formatCurrency(sale.taxAmount)}</td>
                    <td>{formatCurrency(sale.totalAmount)}</td>
                    <td>{sale.seller?.name || '-'}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewSale(sale)}
                          title="Ver detalles"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleEditSale(sale)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteSale(sale)}
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

        <SaleModal
          show={showModal}
          onHide={handleCloseModal}
          onSubmit={handleSubmitSale}
          sale={currentSale}
          modalType={modalType}
          loading={modalLoading}
        />
      </div>
    </Layout>
  );
};

export default SalesPage; 