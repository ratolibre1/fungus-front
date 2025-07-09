import React, { useState, useEffect } from 'react';
import PortalModal from '../common/PortalModal';
import { Purchase, DocumentType } from '../../types/purchase';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../../types/supplier';
import { Client } from '../../types/client';
import { Consumable, CreateConsumableRequest } from '../../types/consumable';
import { getSuppliers, createSupplier } from '../../services/supplierService';
import { getClients } from '../../services/clientService';
import { addSupplierRole } from '../../services/roleService';
import { getConsumables, createConsumable } from '../../services/consumableService';
import { previewPurchase } from '../../services/purchaseService';
import { compareStringsSpanish, formatCurrencyNoDecimals } from '../../utils/validators';
import SupplierModal from '../SupplierModal';

interface PurchaseFormData {
  counterparty: string;
  documentType: DocumentType;
  date: string;
  items: PurchaseItemForm[];
  taxRate: number;
  observations: string;
}

interface PurchaseItemForm {
  item: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

// Interfaz para envío a la API - formato simplificado actualizado
interface PurchaseSubmitData {
  documentType: DocumentType;
  counterparty: string;
  items: {
    item: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  date?: string;
  taxRate?: number;
  observations?: string;
}

interface PurchaseFormModalProps {
  purchase?: Purchase | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: PurchaseSubmitData) => void;
  loading?: boolean;
}

// Componente de búsqueda para proveedores
interface SupplierSearchProps {
  suppliers: Supplier[];
  clients: Client[];
  value: string;
  onChange: (value: string) => void;
  onSupplierCreated?: (supplier: Supplier) => void;
  disabled?: boolean;
  error?: string;
}

const SupplierSearchSelector: React.FC<SupplierSearchProps> = ({
  suppliers,
  clients,
  value,
  onChange,
  onSupplierCreated,
  disabled,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [addingRole, setAddingRole] = useState(false);

  // Estados para SupplierModal
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierModalLoading, setSupplierModalLoading] = useState(false);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.rut.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => compareStringsSpanish(a.name, b.name));

  // Buscar en clientes que coincidan con el término de búsqueda
  const potentialClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.rut.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(client =>
    // Excluir si ya existe como proveedor
    !suppliers.some(supplier => supplier.rut === client.rut)
  );

  const selectedSupplier = suppliers.find(s => s._id === value);

  const handleSelect = (supplierId: string) => {
    onChange(supplierId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
  };

  // Abrir SupplierModal para crear nuevo proveedor
  const handleCreateNewSupplier = () => {
    setIsOpen(false);
    setShowSupplierModal(true);
  };

  // Manejar creación desde SupplierModal
  const handleSupplierModalSubmit = async (formData: CreateSupplierRequest | UpdateSupplierRequest) => {
    setSupplierModalLoading(true);
    try {
      // En modo create, formData será siempre CreateSupplierRequest
      const response = await createSupplier(formData as CreateSupplierRequest);
      if (response.success) {
        onChange(response.data._id);
        setShowSupplierModal(false);
        setSearchTerm('');
        if (onSupplierCreated) {
          onSupplierCreated(response.data);
        }
      }
    } catch (error) {
      console.error('Error creando proveedor:', error);
    } finally {
      setSupplierModalLoading(false);
    }
  };

  // Agregar rol de proveedor a un cliente existente usando addSupplierRole
  const handleAddSupplierRole = async (client: Client) => {
    setAddingRole(true);
    try {
      const response = await addSupplierRole(client._id);
      if (response.success) {
        // Crear el objeto proveedor basado en el cliente para agregarlo localmente
        const newSupplier: Supplier = {
          _id: client._id, // Usar el mismo ID del cliente
          name: client.name,
          rut: client.rut,
          email: client.email,
          phone: client.phone,
          address: client.address || '',
          isCustomer: true,
          needsReview: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        onChange(client._id);
        setIsOpen(false);
        setSearchTerm('');
        if (onSupplierCreated) {
          onSupplierCreated(newSupplier);
        }
      }
    } catch (error) {
      console.error('Error agregando rol de proveedor:', error);
    } finally {
      setAddingRole(false);
    }
  };

  const formatSupplierDisplay = (supplier: Supplier) => {
    return `${supplier.name} - ${supplier.rut}`;
  };

  return (
    <>
      <div className="position-relative">
        <div className="input-group">
          <input
            type="text"
            className={`form-control ${error ? 'is-invalid' : ''}`}
            placeholder="Buscar proveedor por nombre o RUT..."
            value={selectedSupplier ? formatSupplierDisplay(selectedSupplier) : searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
          />
          {value && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleClear}
              disabled={disabled}
              title="Limpiar selección"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          </button>
        </div>

        {isOpen && (
          <div
            className="position-fixed mt-1 bg-white"
            style={{
              zIndex: 1070,
              minWidth: '300px',
              maxWidth: '500px',
              left: 'auto',
              right: 'auto'
            }}
          >
            <div className="card shadow-lg">
              {/* Barra de búsqueda dentro del dropdown */}
              <div className="card-header bg-success text-white p-2">
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar proveedores por nombre o RUT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </div>

              <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {/* Proveedores encontrados */}
                {filteredSuppliers.map(supplier => (
                  <button
                    key={supplier._id}
                    type="button"
                    className={`list-group-item list-group-item-action ${value === supplier._id ? 'active' : ''}`}
                    onClick={() => handleSelect(supplier._id)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        <strong>{supplier.name}</strong> - <small className="text-muted">{supplier.rut}</small>
                      </span>
                    </div>
                  </button>
                ))}

                {/* Clientes que podrían ser agregados como proveedores */}
                {searchTerm && potentialClients.length > 0 && (
                  <>
                    <div className="list-group-item bg-light text-muted small">
                      <i className="bi bi-info-circle me-1"></i>
                      Contactos existentes como clientes:
                    </div>
                    {potentialClients.map(client => (
                      <div key={`client-${client._id}`} className="list-group-item bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{client.name}</strong> - <small className="text-muted">{client.rut}</small>
                            <br />
                            <small className="text-muted">
                              <i className="bi bi-people me-1"></i>
                              Existe como cliente
                            </small>
                          </div>
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleAddSupplierRole(client)}
                            disabled={addingRole}
                          >
                            {addingRole ? (
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            ) : (
                              <i className="bi bi-arrow-up-right-circle me-1"></i>
                            )}
                            Agregar como proveedor
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Opción para crear nuevo proveedor */}
                {filteredSuppliers.length === 0 && potentialClients.length === 0 && searchTerm && (
                  <div className="list-group-item text-center py-3">
                    <i className="bi bi-search me-2 text-muted"></i>
                    <div className="text-muted mb-2">No se encontraron proveedores</div>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleCreateNewSupplier}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Crear nuevo proveedor
                    </button>
                  </div>
                )}

                {/* Mensaje cuando no hay término de búsqueda */}
                {!searchTerm && filteredSuppliers.length === 0 && (
                  <div className="list-group-item text-center text-muted py-3">
                    <i className="bi bi-search me-2"></i>
                    Escribe para buscar proveedores
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overlay para cerrar el dropdown */}
        {isOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1069 }}
            onClick={() => setIsOpen(false)}
          />
        )}

        {error && <div className="invalid-feedback">{error}</div>}
      </div>

      {/* SupplierModal para crear nuevo proveedor */}
      <SupplierModal
        isOpen={showSupplierModal}
        modalType="create"
        selectedSupplier={null}
        loading={supplierModalLoading}
        onClose={() => setShowSupplierModal(false)}
        onSubmit={handleSupplierModalSubmit}
      />
    </>
  );
};

// Componente de búsqueda para insumos (consumibles)
interface ConsumableSearchProps {
  consumables: Consumable[];
  value: string;
  onChange: (value: string) => void;
  onConsumableCreated?: (consumable: Consumable) => void;
  onConsumableSelected?: (consumableId: string, consumable: Consumable) => void;
  onClear?: () => void;
  disabled?: boolean;
  error?: string;
}

const ConsumableSearchSelector: React.FC<ConsumableSearchProps> = ({
  consumables,
  value,
  onChange,
  onConsumableCreated,
  onConsumableSelected,
  onClear,
  disabled,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Estados para modal de crear insumo
  const [showConsumableModal, setShowConsumableModal] = useState(false);
  const [creatingConsumable, setCreatingConsumable] = useState(false);
  const [consumableFormData, setConsumableFormData] = useState<CreateConsumableRequest>({
    name: '',
    description: '',
    netPrice: 0,
    stock: null
  });

  const filteredConsumables = consumables.filter(consumable =>
    consumable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consumable.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => compareStringsSpanish(a.name, b.name));

  const selectedConsumable = consumables.find(c => c._id === value);

  const handleSelect = (consumableId: string) => {
    const consumable = consumables.find(c => c._id === consumableId);
    onChange(consumableId);
    if (consumable && onConsumableSelected) {
      onConsumableSelected(consumableId, consumable);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleCreateNewConsumable = () => {
    setConsumableFormData({
      name: searchTerm,
      description: '',
      netPrice: 0,
      stock: null
    });
    setIsOpen(false);
    setShowConsumableModal(true);
  };

  const handleCreateConsumable = async () => {
    if (!consumableFormData.name || !consumableFormData.netPrice) return;

    setCreatingConsumable(true);
    try {
      const response = await createConsumable(consumableFormData);
      if (response.success) {
        // Primero agregar a la lista
        if (onConsumableCreated) {
          onConsumableCreated(response.data);
        }

        // Luego seleccionarlo automáticamente
        onChange(response.data._id);
        if (onConsumableSelected) {
          onConsumableSelected(response.data._id, response.data);
        }

        setShowConsumableModal(false);
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Error creando insumo:', error);
    } finally {
      setCreatingConsumable(false);
    }
  };

  const handleConsumableFormChange = (field: keyof CreateConsumableRequest, value: string | number | null) => {
    setConsumableFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatConsumableDisplay = (consumable: Consumable) => {
    return `${consumable.name} - ${consumable.description}`;
  };

  const formatConsumableDisplayJSX = (consumable: Consumable) => {
    return (
      <div>
        <strong>{consumable.name}</strong>
        <br />
        <small className="text-muted">
          {consumable.description}
        </small>
      </div>
    );
  };

  return (
    <>
      <div className="position-relative">
        <div className="input-group">
          <input
            type="text"
            className={`form-control ${error ? 'is-invalid' : ''}`}
            placeholder="Buscar insumo..."
            value={selectedConsumable ? formatConsumableDisplay(selectedConsumable) : searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
          />
          {value && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleClear}
              disabled={disabled}
              title="Limpiar selección"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          </button>
        </div>

        {isOpen && (
          <div
            className="position-fixed mt-1 bg-white"
            style={{
              zIndex: 1070,
              minWidth: '400px',
              maxWidth: '600px',
              left: 'auto',
              right: 'auto'
            }}
          >
            <div className="card shadow-lg">
              {/* Barra de búsqueda dentro del dropdown */}
              <div className="card-header bg-success text-white p-2">
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar insumos por nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </div>

              <div className="list-group list-group-flush" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {filteredConsumables.length === 0 ? (
                  <div className="list-group-item text-center py-3">
                    <div className="text-muted mb-3">
                      <i className="bi bi-search me-2"></i>
                      No se encontraron insumos
                    </div>
                    {searchTerm && (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={handleCreateNewConsumable}
                        disabled={disabled}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Crear nuevo insumo
                      </button>
                    )}
                  </div>
                ) : (
                  filteredConsumables.map(consumable => (
                    <button
                      key={consumable._id}
                      type="button"
                      className={`list-group-item list-group-item-action ${value === consumable._id ? 'active' : ''}`}
                      onClick={() => handleSelect(consumable._id)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>{formatConsumableDisplayJSX(consumable)}</div>
                        <small className="text-muted">${consumable.netPrice}</small>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overlay para cerrar el dropdown */}
        {isOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1069 }}
            onClick={() => setIsOpen(false)}
          />
        )}

        {error && <div className="invalid-feedback">{error}</div>}
      </div>

      {/* Modal de crear insumo */}
      {showConsumableModal && (
        <PortalModal isOpen={true} onClose={() => setShowConsumableModal(false)}>
          {/* Backdrop */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1080 }}
            onClick={() => setShowConsumableModal(false)}
          />

          {/* Modal */}
          <div
            className="modal fade show"
            style={{
              display: 'block',
              zIndex: 1085
            }}
            tabIndex={-1}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Nuevo Insumo</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowConsumableModal(false)}
                    disabled={creatingConsumable}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre <span style={{ color: '#dc3545' }}>*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={consumableFormData.name}
                      onChange={(e) => handleConsumableFormChange('name', e.target.value)}
                      placeholder="Ej: Filtros de jeringa"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      value={consumableFormData.description}
                      onChange={(e) => handleConsumableFormChange('description', e.target.value)}
                      placeholder="Ej: Filtros estériles de 0.22 micras"
                      rows={3}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Precio neto <span style={{ color: '#dc3545' }}>*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      value={consumableFormData.netPrice}
                      onChange={(e) => handleConsumableFormChange('netPrice', Number(e.target.value))}
                      placeholder="Ej: 2500"
                      min="0"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={consumableFormData.stock || ''}
                      onChange={(e) => handleConsumableFormChange('stock', e.target.value ? Number(e.target.value) : null)}
                      placeholder="Ej: 30"
                      min="0"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowConsumableModal(false)}
                    disabled={creatingConsumable}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleCreateConsumable}
                    disabled={creatingConsumable || !consumableFormData.name || !consumableFormData.netPrice}
                  >
                    {creatingConsumable ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Crear insumo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PortalModal>
      )}
    </>
  );
};

export default function PurchaseFormModal({
  purchase,
  isOpen,
  onClose,
  onSubmit,
  loading = false
}: PurchaseFormModalProps) {
  // Estados para datos maestros
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Estados del formulario
  const [formData, setFormData] = useState<PurchaseFormData>({
    counterparty: '',
    documentType: 'factura',
    date: new Date().toISOString().split('T')[0],
    items: [],
    taxRate: 0.19,
    observations: ''
  });

  // Estados para UI
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Estados para preview y cálculos en tiempo real
  const [previewData, setPreviewData] = useState<{
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Estados para manejar inputs numéricos con comas decimales
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  // Cargar datos iniciales
  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [suppliersResponse, clientsResponse, consumablesResponse] = await Promise.all([
        getSuppliers(),
        getClients(),
        getConsumables()
      ]);

      setSuppliers(suppliersResponse.data);
      setClients(clientsResponse.data);
      setConsumables(consumablesResponse.data);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Poblar formulario cuando se está editando
  const populateFormData = (purchase: Purchase) => {
    const items: PurchaseItemForm[] = purchase.items.map(item => ({
      item: typeof item.itemDetail === 'object' ? item.itemDetail._id : item.itemDetail,
      itemName: typeof item.itemDetail === 'object' ? item.itemDetail.name : 'Item no encontrado',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      subtotal: item.subtotal
    }));

    setFormData({
      counterparty: typeof purchase.counterparty === 'object' ? purchase.counterparty._id : purchase.counterparty,
      documentType: purchase.documentType,
      date: purchase.date.split('T')[0],
      items,
      taxRate: purchase.taxRate,
      observations: purchase.observations || ''
    });
  };

  // Función para calcular preview en tiempo real
  const calculatePreview = async () => {
    if (formData.items.length === 0 || !formData.documentType) {
      // Si no hay items, limpiar totales
      setPreviewData({
        netAmount: 0,
        taxAmount: 0,
        totalAmount: 0
      });
      return;
    }

    const validItems = formData.items.filter(item => item.item && item.quantity > 0);
    if (validItems.length === 0) {
      // Si no hay items válidos, limpiar totales
      setPreviewData({
        netAmount: 0,
        taxAmount: 0,
        totalAmount: 0
      });
      return;
    }

    setLoadingPreview(true);
    try {
      const previewRequest = {
        documentType: formData.documentType,
        items: validItems.map(item => ({
          item: item.item,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount > 0 ? item.discount : undefined
        })),
        taxRate: formData.taxRate
      };

      const response = await previewPurchase(previewRequest);
      setPreviewData({
        netAmount: response.data.netAmount,
        taxAmount: response.data.taxAmount,
        totalAmount: response.data.totalAmount
      });
    } catch (error) {
      console.error('Error calculando preview:', error);
      setPreviewData(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Efectos
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (purchase && isOpen) {
      populateFormData(purchase);
    } else if (isOpen) {
      // Resetear formulario para nueva compra
      setFormData({
        counterparty: '',
        documentType: 'factura',
        date: new Date().toISOString().split('T')[0],
        items: [],
        taxRate: 0.19,
        observations: ''
      });
      setErrors({});
      setPreviewData(null);
    }
  }, [purchase, isOpen]);

  // Calcular preview cuando cambian items o tipo de documento
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculatePreview();
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [formData.items, formData.documentType, formData.taxRate]);

  // Manejar agregar item
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item: '',
          itemName: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          subtotal: 0
        }
      ]
    }));
  };

  // Manejar eliminar item
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));

    // Limpiar los inputValues para ese índice y reorganizar los demás
    setInputValues(prev => {
      const newInputValues = { ...prev };

      // Eliminar los valores del índice actual
      delete newInputValues[`quantity_${index}`];
      delete newInputValues[`unitPrice_${index}`];
      delete newInputValues[`discount_${index}`];

      // Reorganizar los índices superiores (moverlos hacia abajo)
      Object.keys(newInputValues).forEach(key => {
        const match = key.match(/^(quantity|unitPrice|discount)_(\d+)$/);
        if (match) {
          const field = match[1];
          const currentIndex = parseInt(match[2]);
          if (currentIndex > index) {
            const newKey = `${field}_${currentIndex - 1}`;
            newInputValues[newKey] = newInputValues[key];
            delete newInputValues[key];
          }
        }
      });

      return newInputValues;
    });
  };

  // Manejar actualización de item
  const updateItem = (index: number, field: keyof PurchaseItemForm, value: string | number, consumableData?: Consumable) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      // Si se cambia el item, buscar su nombre y precio
      if (field === 'item') {
        if (value) {
          // Si se selecciona un insumo
          // Usar consumableData si se proporciona, sino buscar en la lista
          const selectedConsumable = consumableData || consumables.find(c => c._id === value);
          if (selectedConsumable) {
            newItems[index].itemName = selectedConsumable.name;
            newItems[index].unitPrice = selectedConsumable.netPrice || 0;
            // Si no hay cantidad, poner 1 por defecto
            if (!newItems[index].quantity || newItems[index].quantity === 0) {
              newItems[index].quantity = 1;
            }
          }
        } else {
          // Si se limpia el insumo, limpiar todos los valores
          newItems[index].itemName = '';
          newItems[index].unitPrice = 0;
          newItems[index].quantity = 0;
          newItems[index].discount = 0;
          newItems[index].subtotal = 0;
        }
      }

      // Recalcular subtotal siempre que cambie item, quantity, unitPrice o discount
      if (['item', 'quantity', 'unitPrice', 'discount'].includes(field)) {
        const item = newItems[index];
        const subtotalBeforeDiscount = item.quantity * item.unitPrice;
        newItems[index].subtotal = Math.max(0, subtotalBeforeDiscount - item.discount);
      }

      return { ...prev, items: newItems };
    });

    // Si se limpia el insumo, también limpiar los inputValues
    if (field === 'item' && !value) {
      setInputValues(prev => {
        const newInputValues = { ...prev };
        delete newInputValues[`quantity_${index}`];
        delete newInputValues[`unitPrice_${index}`];
        delete newInputValues[`discount_${index}`];
        return newInputValues;
      });
    }

    // Limpiar errores específicos cuando se corrige el campo
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };

      if (field === 'item' && value) {
        delete newErrors[`item_${index}_item`];
      }
      if (field === 'quantity' && Number(value) > 0) {
        delete newErrors[`item_${index}_quantity`];
      }
      if (field === 'unitPrice' && Number(value) >= 0) {
        delete newErrors[`item_${index}_unitPrice`];
      }
      if (field === 'discount' && Number(value) >= 0) {
        delete newErrors[`item_${index}_discount`];
      }

      return newErrors;
    });
  };

  // Calcular totales localmente como fallback
  const calculateTotals = () => {
    const netAmount = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = netAmount * formData.taxRate;
    const totalAmount = netAmount + taxAmount;
    return { netAmount, taxAmount, totalAmount };
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.counterparty) {
      newErrors.counterparty = 'El proveedor es requerido';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un item';
    }

    // Validar cada item
    formData.items.forEach((item, index) => {
      if (!item.item) {
        newErrors[`item_${index}_item`] = 'Debe seleccionar un insumo';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'La cantidad debe ser mayor a 0';
      }
      if (item.unitPrice < 0) {
        newErrors[`item_${index}_unitPrice`] = 'El precio no puede ser negativo';
      }
      if (item.discount < 0) {
        newErrors[`item_${index}_discount`] = 'El descuento no puede ser negativo';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convertir fechas agregando horario de 12:00 (mediodía)
    const dateWithTime = formData.date ? `${formData.date}T12:00:00.000Z` : '';

    // Preparar datos para envío - formato simplificado para la nueva API
    const submitData: PurchaseSubmitData = {
      documentType: formData.documentType,
      counterparty: formData.counterparty,
      items: formData.items.map(item => {
        const apiItem: {
          item: string;
          quantity: number;
          unitPrice: number;
          discount?: number;
        } = {
          item: item.item,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        };

        // Solo enviar discount si es mayor que 0
        if (item.discount > 0) {
          apiItem.discount = item.discount;
        }

        return apiItem;
      }),
      date: dateWithTime,
      taxRate: formData.taxRate || undefined,
      observations: formData.observations || undefined
    };

    onSubmit(submitData);
  };

  // Usar datos del preview si están disponibles, sino calcular localmente
  const totalsToShow = previewData || calculateTotals();

  // Formatear número para mostrar en el input
  const formatInputNumber = (value: number | null): string => {
    // Si value no es un número o es undefined/null, retornar vacío
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '';
    }

    // Solo retornar vacío si es exactamente cero, no para valores "falsy"
    if (value === 0) {
      return '';
    }

    // Convertir a string con coma decimal
    const formattedValue = value.toString().replace('.', ',');
    return formattedValue;
  };

  // Manejar cambios en campos numéricos con soporte para comas
  const handleNumericChange = (index: number, field: keyof PurchaseItemForm, value: string) => {
    const inputKey = `${field}_${index}`;

    // Guardar el valor exactamente como se escribió
    setInputValues(prev => ({
      ...prev,
      [inputKey]: value
    }));

    // Sólo intentar convertir a número si tiene un formato válido
    // Esto permite valores parciales como "1234," durante la edición
    if (value === '' || value === '-' || value === ',' || value === '.' || value.endsWith(',') || value.endsWith('.')) {
      // Para valores parciales/vacíos, guardar cero
      updateItem(index, field, 0);
    } else {
      // Para valores completos que se pueden convertir a número
      const numericValue = value.replace(',', '.');
      const parsedValue = Number(numericValue);

      if (!isNaN(parsedValue)) {
        updateItem(index, field, parsedValue);
      }
    }
  };

  // Validar input numérico
  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentValue = e.currentTarget.value;

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
      if (e.currentTarget.selectionStart === 0 && !currentValue.includes('-')) {
        return;
      }
      e.preventDefault();
      return;
    }

    // Manejar punto y coma como decimales
    if (e.key === '.' || e.key === ',') {
      // Si ya hay un punto o una coma, no permitir otro
      if (currentValue.includes('.') || currentValue.includes(',')) {
        e.preventDefault();
        return;
      }
      return;
    }

    // Bloquear cualquier otra tecla
    e.preventDefault();
  };

  // Manejar cuando se crea un nuevo proveedor
  const handleSupplierCreated = (newSupplier: Supplier) => {
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const handleConsumableCreated = (newConsumable: Consumable) => {
    setConsumables(prev => [...prev, newConsumable]);
  };

  if (!isOpen) return null;

  return (
    <PortalModal isOpen={isOpen} onClose={onClose}>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="modal fade show"
        style={{
          display: 'block',
          zIndex: 1055
        }}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {purchase ? 'Editar Compra' : 'Nueva Compra'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
                aria-label="Cerrar"
              />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {loadingData ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" style={{ color: '#099347' }} role="status">
                      <span className="visually-hidden">Cargando datos...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Información general */}
                    <div className="row mb-4">
                      <div className="col-md-4">
                        <label htmlFor="counterparty" className="form-label">Proveedor *</label>
                        <SupplierSearchSelector
                          suppliers={suppliers}
                          clients={clients}
                          value={formData.counterparty}
                          onChange={(value) => setFormData(prev => ({ ...prev, counterparty: value }))}
                          disabled={loading}
                          error={errors.counterparty}
                          onSupplierCreated={handleSupplierCreated}
                        />
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="documentType" className="form-label">Tipo de Documento *</label>
                        <select
                          id="documentType"
                          className="form-select"
                          value={formData.documentType}
                          onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value as DocumentType }))}
                          disabled={loading}
                        >
                          <option value="factura">
                            <i className="bi bi-receipt me-2"></i>
                            Factura
                          </option>
                          <option value="boleta">
                            <i className="bi bi-file-earmark me-2"></i>
                            Boleta
                          </option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="date" className="form-label">Fecha *</label>
                        <input
                          type="date"
                          id="date"
                          className="form-control"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-12">
                        <label htmlFor="observations" className="form-label">Observaciones</label>
                        <textarea
                          id="observations"
                          className="form-control"
                          rows={3}
                          value={formData.observations}
                          onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                          disabled={loading}
                          placeholder="Observaciones adicionales para la compra..."
                        />
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Items de la Compra</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={addItem}
                          disabled={loading}
                        >
                          <i className="bi bi-plus-lg me-1"></i> Agregar Item
                        </button>
                      </div>

                      {errors.items && (
                        <div className="alert alert-danger">{errors.items}</div>
                      )}

                      {formData.items.length === 0 ? (
                        <div className="alert alert-info text-center">
                          <i className="bi bi-info-circle me-2"></i>
                          No hay items agregados. Haga clic en "Agregar Item" para comenzar.
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead className="table-light">
                              <tr>
                                <th style={{ minWidth: '200px' }}>Insumo *</th>
                                <th style={{ width: '100px' }}>Cantidad *</th>
                                <th style={{ width: '120px' }}>Precio Unit. *</th>
                                <th style={{ width: '120px' }}>Descuento</th>
                                <th style={{ width: '120px' }}>Subtotal</th>
                                <th style={{ width: '60px' }}>Acción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {formData.items.map((item, index) => (
                                <tr key={index}>
                                  <td>
                                    <ConsumableSearchSelector
                                      consumables={consumables}
                                      value={item.item}
                                      onChange={(value) => updateItem(index, 'item', value)}
                                      onConsumableCreated={handleConsumableCreated}
                                      onConsumableSelected={(consumableId, consumable) => updateItem(index, 'item', consumableId, consumable)}
                                      onClear={() => updateItem(index, 'item', '')}
                                      disabled={loading}
                                      error={errors[`item_${index}_item`]}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className={`form-control ${errors[`item_${index}_quantity`] ? 'is-invalid' : ''}`}
                                      value={inputValues[`quantity_${index}`] !== undefined ? inputValues[`quantity_${index}`] : formatInputNumber(item.quantity)}
                                      onChange={(e) => handleNumericChange(index, 'quantity', e.target.value)}
                                      onKeyDown={handleNumericKeyDown}
                                      disabled={loading}
                                      placeholder="Ej: 5"
                                    />
                                    {errors[`item_${index}_quantity`] && (
                                      <div className="text-danger small">{errors[`item_${index}_quantity`]}</div>
                                    )}
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className={`form-control ${errors[`item_${index}_unitPrice`] ? 'is-invalid' : ''}`}
                                      value={inputValues[`unitPrice_${index}`] !== undefined ? inputValues[`unitPrice_${index}`] : formatInputNumber(item.unitPrice)}
                                      onChange={(e) => handleNumericChange(index, 'unitPrice', e.target.value)}
                                      onKeyDown={handleNumericKeyDown}
                                      disabled={loading}
                                      placeholder="Ej: 2500"
                                    />
                                    {errors[`item_${index}_unitPrice`] && (
                                      <div className="text-danger small">{errors[`item_${index}_unitPrice`]}</div>
                                    )}
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className={`form-control ${errors[`item_${index}_discount`] ? 'is-invalid' : ''}`}
                                      value={inputValues[`discount_${index}`] !== undefined ? inputValues[`discount_${index}`] : formatInputNumber(item.discount)}
                                      onChange={(e) => handleNumericChange(index, 'discount', e.target.value)}
                                      onKeyDown={handleNumericKeyDown}
                                      disabled={loading}
                                      placeholder="Ej: 500"
                                    />
                                    {errors[`item_${index}_discount`] && (
                                      <div className="text-danger small">{errors[`item_${index}_discount`]}</div>
                                    )}
                                  </td>
                                  <td className="text-end">
                                    <strong>{formatCurrencyNoDecimals(item.subtotal)}</strong>
                                  </td>
                                  <td className="text-center">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => removeItem(index)}
                                      disabled={loading}
                                      title="Eliminar item"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Totales de referencia */}
                    {formData.items.length > 0 && (
                      <div className="card bg-light mt-3">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6 offset-md-6">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0">Totales</h6>
                                {loadingPreview && (
                                  <div className="spinner-border spinner-border-sm text-success" role="status">
                                    <span className="visually-hidden">Calculando...</span>
                                  </div>
                                )}
                              </div>
                              <table className="table table-sm mb-0">
                                <tbody>
                                  <tr>
                                    <td><strong>Neto:</strong></td>
                                    <td className="text-end"><strong>{formatCurrencyNoDecimals(totalsToShow.netAmount)}</strong></td>
                                  </tr>
                                  <tr>
                                    <td><strong>IVA ({(formData.taxRate * 100).toFixed(0)}%):</strong></td>
                                    <td className="text-end"><strong>{formatCurrencyNoDecimals(totalsToShow.taxAmount)}</strong></td>
                                  </tr>
                                  <tr className="table-success">
                                    <td><strong>Total:</strong></td>
                                    <td className="text-end"><strong>{formatCurrencyNoDecimals(totalsToShow.totalAmount)}</strong></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading || loadingData}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {purchase ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      {purchase ? 'Actualizar Compra' : 'Crear Compra'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PortalModal>
  );
} 