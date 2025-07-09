import React, { useState, useEffect } from 'react';
import { Quotation, DocumentType } from '../../types/quotation';
import { Client, CreateClientRequest, UpdateClientRequest } from '../../types/client';
import { Supplier } from '../../types/supplier';
import { Product, CreateProductRequest } from '../../types/product';
import { getClients, createClient } from '../../services/clientService';
import { getSuppliers } from '../../services/supplierService';
import { addCustomerRole } from '../../services/roleService';
import { getProducts, createProduct } from '../../services/productService';
import { previewQuotation } from '../../services/quotationService';
import { compareStringsSpanish, formatCurrencyNoDecimals } from '../../utils/validators';
import ClientModal from '../ClientModal';
import PortalModal from '../common/PortalModal';

interface QuotationFormData {
  counterparty: string;
  documentType: DocumentType;
  validUntil: string;
  items: QuotationItemForm[];
  taxRate: number;
  observations: string;
}

interface QuotationItemForm {
  item: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

// Interfaz para envío a la API - formato simplificado actualizado
interface QuotationSubmitData {
  documentType: DocumentType;
  counterparty: string;
  validUntil?: string;
  items: {
    item: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  taxRate?: number;
  observations?: string;
}

interface QuotationFormModalProps {
  quotation?: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: QuotationSubmitData) => void;
  loading?: boolean;
}

// Componente de búsqueda para clientes
interface ClientSearchProps {
  clients: Client[];
  suppliers: Supplier[];
  value: string;
  onChange: (value: string) => void;
  onClientCreated?: (client: Client) => void;
  disabled?: boolean;
  error?: string;
}

const ClientSearchSelector: React.FC<ClientSearchProps> = ({
  clients,
  suppliers,
  value,
  onChange,
  onClientCreated,
  disabled,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [addingRole, setAddingRole] = useState(false);

  // Estados para ClientModal
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientModalLoading, setClientModalLoading] = useState(false);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.rut.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => compareStringsSpanish(a.name, b.name));

  // Buscar en proveedores que coincidan con el término de búsqueda
  const potentialSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.rut.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(supplier =>
    // Excluir si ya existe como cliente
    !clients.some(client => client.rut === supplier.rut)
  );

  const selectedClient = clients.find(c => c._id === value);

  const handleSelect = (clientId: string) => {
    onChange(clientId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
  };

  // Abrir ClientModal para crear nuevo cliente
  const handleCreateNewClient = () => {
    setIsOpen(false);
    setShowClientModal(true);
  };

  // Manejar creación desde ClientModal
  const handleClientModalSubmit = async (formData: CreateClientRequest | UpdateClientRequest) => {
    setClientModalLoading(true);
    try {
      // En modo create, formData será siempre CreateClientRequest
      const response = await createClient(formData as CreateClientRequest);
      if (response.success) {
        onChange(response.data._id);
        setShowClientModal(false);
        setSearchTerm('');
        if (onClientCreated) {
          onClientCreated(response.data);
        }
      }
    } catch (error) {
      console.error('Error creando cliente:', error);
    } finally {
      setClientModalLoading(false);
    }
  };

  // Agregar rol de cliente a un proveedor existente usando addCustomerRole
  const handleAddClientRole = async (supplier: Supplier) => {
    setAddingRole(true);
    try {
      const response = await addCustomerRole(supplier._id);
      if (response.success) {
        // Crear el objeto cliente basado en el proveedor para agregarlo localmente
        const newClient: Client = {
          _id: supplier._id, // Usar el mismo ID del proveedor
          name: supplier.name,
          rut: supplier.rut,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address || '',
          isCustomer: true,
          isSupplier: true,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        onChange(supplier._id);
        setIsOpen(false);
        setSearchTerm('');
        if (onClientCreated) {
          onClientCreated(newClient);
        }
      }
    } catch (error) {
      console.error('Error agregando rol de cliente:', error);
    } finally {
      setAddingRole(false);
    }
  };

  const formatClientDisplay = (client: Client) => {
    return `${client.name} - ${client.rut}`;
  };

  return (
    <>
      <div className="position-relative">
        <div className="input-group">
          <input
            type="text"
            className={`form-control ${error ? 'is-invalid' : ''}`}
            placeholder="Buscar cliente por nombre o RUT..."
            value={selectedClient ? formatClientDisplay(selectedClient) : searchTerm}
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
                    placeholder="Buscar clientes por nombre o RUT..."
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
                {/* Clientes encontrados */}
                {filteredClients.map(client => (
                  <button
                    key={client._id}
                    type="button"
                    className={`list-group-item list-group-item-action ${value === client._id ? 'active' : ''}`}
                    onClick={() => handleSelect(client._id)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        <strong>{client.name}</strong> - <small className="text-muted">{client.rut}</small>
                      </span>
                    </div>
                  </button>
                ))}

                {/* Proveedores que podrían ser agregados como clientes */}
                {searchTerm && potentialSuppliers.length > 0 && (
                  <>
                    <div className="list-group-item bg-light text-muted small">
                      <i className="bi bi-info-circle me-1"></i>
                      Contactos existentes como proveedores:
                    </div>
                    {potentialSuppliers.map(supplier => (
                      <div key={`supplier-${supplier._id}`} className="list-group-item bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{supplier.name}</strong> - <small className="text-muted">{supplier.rut}</small>
                            <br />
                            <small className="text-muted">
                              <i className="bi bi-truck me-1"></i>
                              Existe como proveedor
                            </small>
                          </div>
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleAddClientRole(supplier)}
                            disabled={addingRole}
                          >
                            {addingRole ? (
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            ) : (
                              <i className="bi bi-arrow-up-right-circle me-1"></i>
                            )}
                            Agregar como cliente
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Opción para crear nuevo cliente */}
                {filteredClients.length === 0 && potentialSuppliers.length === 0 && searchTerm && (
                  <div className="list-group-item text-center py-3">
                    <i className="bi bi-search me-2 text-muted"></i>
                    <div className="text-muted mb-2">No se encontraron clientes</div>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleCreateNewClient}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Crear nuevo cliente
                    </button>
                  </div>
                )}

                {/* Mensaje cuando no hay término de búsqueda */}
                {!searchTerm && filteredClients.length === 0 && (
                  <div className="list-group-item text-center text-muted py-3">
                    <i className="bi bi-search me-2"></i>
                    Escribe para buscar clientes
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
            style={{ zIndex: 1059 }}
            onClick={() => setIsOpen(false)}
          />
        )}

        {error && <div className="invalid-feedback">{error}</div>}
      </div>

      {/* ClientModal para crear nuevo cliente */}
      <ClientModal
        isOpen={showClientModal}
        modalType="create"
        selectedClient={null}
        loading={clientModalLoading}
        onClose={() => setShowClientModal(false)}
        onSubmit={handleClientModalSubmit}
      />
    </>
  );
};

// Componente de búsqueda para productos (solo productos, no consumibles)
interface ProductSearchProps {
  products: Product[];
  value: string;
  onChange: (value: string) => void;
  onProductCreated?: (product: Product) => void;
  onProductSelected?: (productId: string, product: Product) => void;
  onClear?: () => void;
  disabled?: boolean;
  error?: string;
}

const ProductSearchSelector: React.FC<ProductSearchProps> = ({
  products,
  value,
  onChange,
  onProductCreated,
  onProductSelected,
  onClear,
  disabled,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Estados para modal de crear producto
  const [showProductModal, setShowProductModal] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productFormData, setProductFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    netPrice: 0,
    stock: null,
    dimensions: ''
  });

  // Solo usar productos (sin consumibles)
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => compareStringsSpanish(a.name, b.name));

  const selectedProduct = products.find(p => p._id === value);

  const handleSelect = (productId: string) => {
    const product = products.find(p => p._id === productId);
    onChange(productId);
    if (product && onProductSelected) {
      onProductSelected(productId, product);
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

  const handleCreateNewProduct = () => {
    setProductFormData({
      name: searchTerm,
      description: '',
      netPrice: 0,
      stock: null,
      dimensions: ''
    });
    setIsOpen(false);
    setShowProductModal(true);
  };

  const handleCreateProduct = async () => {
    if (!productFormData.name || !productFormData.netPrice) return;

    setCreatingProduct(true);
    try {
      const response = await createProduct(productFormData);
      if (response.success) {
        // Primero agregar a la lista
        if (onProductCreated) {
          onProductCreated(response.data);
        }

        // Luego seleccionarlo automáticamente
        onChange(response.data._id);
        if (onProductSelected) {
          onProductSelected(response.data._id, response.data);
        }

        setShowProductModal(false);
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Error creando producto:', error);
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleProductFormChange = (field: keyof CreateProductRequest, value: string | number | null) => {
    setProductFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatProductDisplay = (product: Product) => {
    const dimensions = product.dimensions ? ` (${product.dimensions})` : '';
    return `${product.name} - ${product.description}${dimensions}`;
  };

  const formatProductDisplayJSX = (product: Product) => {
    const dimensions = product.dimensions ? ` (${product.dimensions})` : '';
    return (
      <span>
        <strong>{product.name}</strong> -
        <small className="text-muted"> {product.description}{dimensions}</small>
      </span>
    );
  };

  return (
    <>
      <div className="position-relative">
        <div className="input-group">
          <input
            type="text"
            className={`form-control ${error ? 'is-invalid' : ''}`}
            placeholder="Buscar producto..."
            value={selectedProduct ? formatProductDisplay(selectedProduct) : searchTerm}
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
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </div>

              <div className="list-group list-group-flush" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {filteredProducts.length === 0 ? (
                  <div className="list-group-item text-center py-3">
                    <div className="text-muted mb-3">
                      <i className="bi bi-search me-2"></i>
                      No se encontraron productos
                    </div>
                    {searchTerm && (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={handleCreateNewProduct}
                        disabled={disabled}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Crear nuevo producto
                      </button>
                    )}
                  </div>
                ) : (
                  filteredProducts.map(product => (
                    <button
                      key={`product_${product._id}`}
                      type="button"
                      className={`list-group-item list-group-item-action py-2 ${value === product._id ? 'active' : ''}`}
                      onClick={() => handleSelect(product._id)}
                    >
                      {formatProductDisplayJSX(product)}
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

      {/* Modal de crear producto */}
      {showProductModal && (
        <PortalModal isOpen={true} onClose={() => setShowProductModal(false)}>
          {/* Backdrop */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1080 }}
            onClick={() => setShowProductModal(false)}
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
                  <h5 className="modal-title">Nuevo Producto</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowProductModal(false)}
                    disabled={creatingProduct}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre <span style={{ color: '#dc3545' }}>*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={productFormData.name}
                      onChange={(e) => handleProductFormChange('name', e.target.value)}
                      placeholder="Ej: Microdosis de psilocibina"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      value={productFormData.description}
                      onChange={(e) => handleProductFormChange('description', e.target.value)}
                      placeholder="Ej: Microdosis de 0.1g de psilocibina"
                      rows={3}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Precio neto <span style={{ color: '#dc3545' }}>*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      value={productFormData.netPrice}
                      onChange={(e) => handleProductFormChange('netPrice', Number(e.target.value))}
                      placeholder="Ej: 15000"
                      min="0"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={productFormData.stock || ''}
                      onChange={(e) => handleProductFormChange('stock', e.target.value ? Number(e.target.value) : null)}
                      placeholder="Ej: 50"
                      min="0"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dimensiones</label>
                    <input
                      type="text"
                      className="form-control"
                      value={productFormData.dimensions}
                      onChange={(e) => handleProductFormChange('dimensions', e.target.value)}
                      placeholder="Ej: 10ml"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowProductModal(false)}
                    disabled={creatingProduct}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleCreateProduct}
                    disabled={creatingProduct || !productFormData.name || !productFormData.netPrice}
                  >
                    {creatingProduct ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Crear producto
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

export default function QuotationFormModal({
  quotation,
  isOpen,
  onClose,
  onSubmit,
  loading = false
}: QuotationFormModalProps) {
  // Estados del formulario - usando solo fechas (sin horario)
  const [formData, setFormData] = useState<QuotationFormData>({
    counterparty: '',
    documentType: 'factura',
    validUntil: '',
    items: [],
    taxRate: 0.19,
    observations: '',
  });

  // Estados para opciones de select
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Cargar datos cuando se edita una cotización
  useEffect(() => {
    if (quotation && isOpen) {
      populateFormData(quotation);
    } else if (isOpen) {
      // Resetear formulario para nueva cotización
      setFormData({
        counterparty: '',
        documentType: 'factura',
        validUntil: '',
        items: [],
        taxRate: 0.19,
        observations: '',
      });
    }
  }, [quotation, isOpen]);

  // Cargar clientes, proveedores y productos (sin consumibles)
  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [clientsRes, suppliersRes, productsRes] = await Promise.all([
        getClients(), // Sin parámetros
        getSuppliers(), // Cargar proveedores
        getProducts({}) // Con objeto vacío
      ]);

      setClients(clientsRes.data);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Poblar formulario con datos de cotización existente
  const populateFormData = (quotation: Quotation) => {
    const formItems: QuotationItemForm[] = quotation.items.map(item => {
      const itemDetail = typeof item.itemDetail === 'object' ? item.itemDetail : null;

      return {
        item: typeof item.itemDetail === 'string' ? item.itemDetail : itemDetail?._id || '',
        itemName: itemDetail?.name || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal
      };
    });

    setFormData({
      counterparty: typeof quotation.counterparty === 'string'
        ? quotation.counterparty
        : quotation.counterparty._id,
      documentType: quotation.documentType,
      validUntil: quotation.validUntil ? quotation.validUntil.slice(0, 10) : '',
      items: formItems,
      taxRate: quotation.taxRate || 0.19,
      observations: quotation.description || '',
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

      const response = await previewQuotation(previewRequest);
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

  // Calcular preview cuando cambian items o tipo de documento
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculatePreview();
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [formData.items, formData.documentType, formData.taxRate]);

  // Agregar nuevo item
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

  // Eliminar item
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

  // Actualizar item
  const updateItem = (index: number, field: keyof QuotationItemForm, value: string | number, productData?: Product) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      // Si se cambia el item, buscar su nombre y tipo
      if (field === 'item') {
        if (value) {
          // Si se selecciona un producto
          // Usar productData si se proporciona, sino buscar en la lista
          const product = productData || products.find(p => p._id === value);
          if (product) {
            newItems[index].itemName = product.name;
            newItems[index].unitPrice = product.netPrice || 0;
            // Si no hay cantidad, poner 1 por defecto
            if (!newItems[index].quantity || newItems[index].quantity === 0) {
              newItems[index].quantity = 1;
            }
          }
        } else {
          // Si se limpia el producto, limpiar todos los valores
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

    // Si se limpia el producto, también limpiar los inputValues
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

  // Calcular totales para mostrar como referencia en la UI
  const calculateTotals = () => {
    const netAmount = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = netAmount * formData.taxRate;
    const totalAmount = netAmount + taxAmount;

    return { netAmount, taxAmount, totalAmount };
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.counterparty) {
      newErrors.counterparty = 'El cliente es requerido';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un item';
    }

    formData.items.forEach((item, index) => {
      if (!item.item) {
        newErrors[`item_${index}_item`] = 'Debe seleccionar un producto';
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
    const dateWithTime = formData.validUntil ? `${formData.validUntil}T12:00:00.000Z` : '';

    // Preparar datos para envío - formato simplificado para la nueva API
    const submitData: QuotationSubmitData = {
      documentType: formData.documentType,
      counterparty: formData.counterparty,
      validUntil: dateWithTime,
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
  const handleNumericChange = (index: number, field: keyof QuotationItemForm, value: string) => {
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

  // Manejar cuando se crea un cliente nuevo
  const handleClientCreated = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
  };

  const handleProductCreated = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
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
                {quotation ? 'Editar Cotización' : 'Nueva Cotización'}
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
                        <label htmlFor="counterparty" className="form-label">Cliente *</label>
                        <ClientSearchSelector
                          clients={clients}
                          suppliers={suppliers}
                          value={formData.counterparty}
                          onChange={(value) => setFormData(prev => ({ ...prev, counterparty: value }))}
                          disabled={loading}
                          error={errors.counterparty}
                          onClientCreated={handleClientCreated}
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
                        <label htmlFor="validUntil" className="form-label">Válido Hasta *</label>
                        <input
                          type="date"
                          id="validUntil"
                          className={`form-control ${errors.validUntil ? 'is-invalid' : ''}`}
                          value={formData.validUntil}
                          onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                          disabled={loading}
                        />
                        {errors.validUntil && <div className="invalid-feedback">{errors.validUntil}</div>}
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
                          placeholder="Observaciones adicionales para la cotización..."
                        />
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Items de la Cotización</h6>
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
                                <th style={{ minWidth: '200px' }}>Producto/Consumible *</th>
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
                                    <ProductSearchSelector
                                      products={products}
                                      value={item.item}
                                      onChange={(value) => updateItem(index, 'item', value)}
                                      onProductCreated={handleProductCreated}
                                      onProductSelected={(productId, product) => updateItem(index, 'item', productId, product)}
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
                                      placeholder="Ej: 15990"
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
                                      placeholder="Ej: 1000"
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
                      {quotation ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      {quotation ? 'Actualizar Cotización' : 'Crear Cotización'}
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