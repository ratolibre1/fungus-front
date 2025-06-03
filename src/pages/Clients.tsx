import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  getClients,
  searchClients,
  createClient,
  updateClient,
  deleteClient
} from '../services/clientService';
import { Client, CreateClientRequest, UpdateClientRequest, ClientSearchParams } from '../types/client';
import { formatRut, formatPhone, compareStringsSpanish } from '../utils/validators';
import ClientModal from '../components/ClientModal';
import BuyersBackground from '../components/BuyersBackground';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;

export default function Clients() {
  // Estados
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  // Agregar nuevos estados para ordenamiento
  const [sortField, setSortField] = useState<keyof Client>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Cargar los clientes
  const loadClients = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getClients();
      setClients(response.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar clientes
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchTerm.trim()) {
      // Si no hay término de búsqueda, cargar todos los clientes
      loadClients();
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const params: ClientSearchParams = { term: searchTerm.trim() };
      const response = await searchClients(params);
      setClients(response.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSearching(false);
    }
  };

  // Resetear búsqueda
  const resetSearch = () => {
    setSearchTerm('');
    loadClients();
  };

  // Cargar al montar el componente
  useEffect(() => {
    loadClients();
  }, []);

  // Abrir modal
  const openModal = (type: ModalType, client: Client | null = null) => {
    setModalType(type);
    setSelectedClient(client);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalType(null);
    setSelectedClient(null);
  };

  // Manejar submit del formulario del modal
  const handleModalSubmit = async (formData: CreateClientRequest | UpdateClientRequest) => {
    setModalLoading(true);
    setError(null);

    try {
      if (modalType === 'create') {
        await createClient(formData as CreateClientRequest);
      } else if (modalType === 'edit' && selectedClient) {
        await updateClient(selectedClient._id, formData);
      } else if (modalType === 'delete' && selectedClient) {
        await deleteClient(selectedClient._id);
      }

      // Recargar la lista después de la operación
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        loadClients();
      }

      closeModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setModalLoading(false);
    }
  };

  // Función para manejar ordenamiento
  const handleSort = (field: keyof Client) => {
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
  const getSortedClients = () => {
    return [...clients].sort((a, b) => {
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
      <div className="buyers-page-container">
        <BuyersBackground />
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
          <h1 className="h2 font-heading" style={{ color: '#099347' }}>Compradores</h1>
          <button
            className="btn"
            style={{ backgroundColor: '#099347', color: 'white' }}
            onClick={() => openModal('create')}
          >
            <i className="bi bi-plus-circle me-1"></i> Nuevo Comprador
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSearch} className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre, rut o email..."
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
                  {searchTerm && (
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
            </form>
          </div>
        </div>

        {/* Lista de clientes */}
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
            {clients.length === 0 ? (
              <div className="alert alert-info" role="alert">
                {searchTerm ? "No se encontraron compradores con ese criterio de búsqueda." : "No hay compradores disponibles."}
              </div>
            ) : (
              <div className="card shadow-sm">
                <div className="card-body">
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
                          <th onClick={() => handleSort('rut')} style={{ cursor: 'pointer' }}>
                            RUT
                            <i className={`bi ms-1 ${sortField === 'rut'
                              ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                              : 'bi-arrow-down-square'}`}></i>
                          </th>
                          <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                            Email
                            <i className={`bi ms-1 ${sortField === 'email'
                              ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                              : 'bi-arrow-down-square'}`}></i>
                          </th>
                          <th>Teléfono</th>
                          <th>Dirección</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedClients().map(client => (
                          <tr key={client._id}>
                            <td>
                              {client.needsReview && (
                                <i className="bi bi-exclamation-triangle-fill"
                                  style={{
                                    color: '#ffc107'
                                  }}
                                  title="Requiere revisión"></i>
                              )}
                              {client.isSupplier && (
                                <i className="bi bi-box-seam-fill"
                                  style={{ color: '#099347' }}
                                  title="También es Proveedor"></i>
                              )} {client.name}</td>
                            <td>{formatRut(client.rut)}</td>
                            <td>{client.email}</td>
                            <td>{client.phone ? formatPhone(client.phone) : '-'}</td>
                            <td>{client.address || '-'}</td>
                            <td className="text-center">
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => navigate(`/comprador/${client._id}`)}
                                  title="Ver detalle"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openModal('edit', client)}
                                  title="Editar"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => openModal('delete', client)}
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
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal para Crear/Editar/Ver/Eliminar usando el componente reutilizable */}
        <ClientModal
          isOpen={modalType !== null}
          modalType={modalType || 'view'} // Valor por defecto para evitar null
          selectedClient={selectedClient}
          loading={modalLoading}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
        />
      </div>
    </Layout>
  );
} 