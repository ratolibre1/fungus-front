import React, { useState, useEffect } from 'react';
import { Quotation, DocumentType } from '../../types/quotation';
import { Client } from '../../types/client';
import { Product } from '../../types/product';
import { Consumable } from '../../types/consumable';
import { getClients } from '../../services/clientService';
import { getProducts } from '../../services/productService';
import { getConsumables } from '../../services/consumableService';
import { previewQuotation } from '../../services/quotationService';

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
  itemType: 'product' | 'consumable';
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
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const ClientSearchSelector: React.FC<ClientSearchProps> = ({ clients, value, onChange, disabled, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.rut.toLowerCase().includes(searchTerm.toLowerCase())
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

  const formatClientDisplay = (client: Client) => {
    return `${client.name} - ${client.rut}`;
  };

  return (
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
            zIndex: 1060,
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

            <div className="list-group list-group-flush" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredClients.length === 0 ? (
                <div className="list-group-item text-center text-muted py-3">
                  <i className="bi bi-search me-2"></i>
                  No se encontraron clientes
                </div>
              ) : (
                filteredClients.map(client => (
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
          style={{ zIndex: 1059 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

// Componente de búsqueda para productos/consumibles
interface ProductSearchProps {
  products: Product[];
  consumables: Consumable[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const ProductSearchSelector: React.FC<ProductSearchProps> = ({
  products,
  consumables,
  value,
  onChange,
  disabled,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Combinar productos y consumibles
  const allItems = [
    ...products.map(p => ({ ...p, type: 'product' as const })),
    ...consumables.map(c => ({ ...c, type: 'consumable' as const }))
  ];

  const filteredItems = allItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItem = allItems.find(i => i._id === value);

  const handleSelect = (itemId: string) => {
    onChange(itemId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
  };

  const formatItemDisplay = (item: Product | Consumable) => {
    const dimensions = 'dimensions' in item && item.dimensions ? ` (${item.dimensions})` : '';
    return `${item.name} - ${item.description}${dimensions}`;
  };

  const formatItemDisplayJSX = (item: Product | Consumable) => {
    const dimensions = 'dimensions' in item && item.dimensions ? ` (${item.dimensions})` : '';
    return (
      <span>
        <strong>{item.name}</strong> -
        <small className="text-muted"> {item.description}{dimensions}</small>
      </span>
    );
  };

  return (
    <div className="position-relative">
      <div className="input-group">
        <input
          type="text"
          className={`form-control ${error ? 'is-invalid' : ''}`}
          placeholder="Buscar producto o consumible..."
          value={selectedItem ? formatItemDisplay(selectedItem) : searchTerm}
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
                  placeholder="Buscar productos o consumibles..."
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
              {filteredItems.length === 0 ? (
                <div className="list-group-item text-center text-muted py-3">
                  <i className="bi bi-search me-2"></i>
                  No se encontraron resultados
                </div>
              ) : (
                <>
                  {/* Productos */}
                  {filteredItems.filter(item => item.type === 'product').length > 0 && (
                    <>
                      <div className="list-group-item bg-light py-1">
                        <small className="text-muted fw-bold">PRODUCTOS</small>
                      </div>
                      {filteredItems
                        .filter(item => item.type === 'product')
                        .map(item => (
                          <button
                            key={`product_${item._id}`}
                            type="button"
                            className={`list-group-item list-group-item-action py-2 ${value === item._id ? 'active' : ''}`}
                            onClick={() => handleSelect(item._id)}
                          >
                            {formatItemDisplayJSX(item)}
                          </button>
                        ))}
                    </>
                  )}

                  {/* Consumibles */}
                  {filteredItems.filter(item => item.type === 'consumable').length > 0 && (
                    <>
                      <div className="list-group-item bg-light py-1">
                        <small className="text-muted fw-bold">CONSUMIBLES</small>
                      </div>
                      {filteredItems
                        .filter(item => item.type === 'consumable')
                        .map(item => (
                          <button
                            key={`consumable_${item._id}`}
                            type="button"
                            className={`list-group-item list-group-item-action py-2 ${value === item._id ? 'active' : ''}`}
                            onClick={() => handleSelect(item._id)}
                          >
                            {formatItemDisplayJSX(item)}
                          </button>
                        ))}
                    </>
                  )}
                </>
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
  const [products, setProducts] = useState<Product[]>([]);
  const [consumables, setConsumables] = useState<Consumable[]>([]);
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

  // Cargar clientes, productos y consumibles
  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [clientsRes, productsRes, consumablesRes] = await Promise.all([
        getClients(), // Sin parámetros
        getProducts({}), // Con objeto vacío
        getConsumables({}) // Con objeto vacío
      ]);

      setClients(clientsRes.data);
      setProducts(productsRes.data);
      setConsumables(consumablesRes.data);
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
        itemType: 'product', // Por defecto, luego se puede determinar
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
    if (formData.items.length === 0 || !formData.documentType) return;

    const validItems = formData.items.filter(item => item.item && item.quantity > 0);
    if (validItems.length === 0) return;

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
          itemType: 'product',
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
  };

  // Actualizar item
  const updateItem = (index: number, field: keyof QuotationItemForm, value: string | number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      // Si se cambia el item, buscar su nombre y tipo
      if (field === 'item' && value) {
        const product = products.find(p => p._id === value);
        const consumable = consumables.find(c => c._id === value);

        if (product) {
          newItems[index].itemType = 'product';
          newItems[index].itemName = product.name;
          newItems[index].unitPrice = product.netPrice || 0;
        } else if (consumable) {
          newItems[index].itemType = 'consumable';
          newItems[index].itemName = consumable.name;
          newItems[index].unitPrice = consumable.netPrice || 0;
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

  // Formatear precio
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Usar datos del preview si están disponibles, sino calcular localmente
  const totalsToShow = previewData || calculateTotals();

  if (!isOpen) return null;

  return (
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
                          value={formData.counterparty}
                          onChange={(value) => setFormData(prev => ({ ...prev, counterparty: value }))}
                          disabled={loading}
                          error={errors.counterparty}
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
                                      consumables={consumables}
                                      value={item.item}
                                      onChange={(value) => updateItem(index, 'item', value)}
                                      disabled={loading}
                                      error={errors[`item_${index}_item`]}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className={`form-control ${errors[`item_${index}_quantity`] ? 'is-invalid' : ''}`}
                                      value={item.quantity}
                                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                      min="1"
                                      disabled={loading}
                                    />
                                    {errors[`item_${index}_quantity`] && (
                                      <div className="text-danger small">{errors[`item_${index}_quantity`]}</div>
                                    )}
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className={`form-control ${errors[`item_${index}_unitPrice`] ? 'is-invalid' : ''}`}
                                      value={item.unitPrice}
                                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                      min="0"
                                      disabled={loading}
                                    />
                                    {errors[`item_${index}_unitPrice`] && (
                                      <div className="text-danger small">{errors[`item_${index}_unitPrice`]}</div>
                                    )}
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className={`form-control ${errors[`item_${index}_discount`] ? 'is-invalid' : ''}`}
                                      value={item.discount}
                                      onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                      min="0"
                                      disabled={loading}
                                    />
                                    {errors[`item_${index}_discount`] && (
                                      <div className="text-danger small">{errors[`item_${index}_discount`]}</div>
                                    )}
                                  </td>
                                  <td className="text-end">
                                    <strong>{formatPrice(item.subtotal)}</strong>
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
                                    <td className="text-end"><strong>{formatPrice(totalsToShow.netAmount)}</strong></td>
                                  </tr>
                                  <tr>
                                    <td><strong>IVA ({(formData.taxRate * 100).toFixed(0)}%):</strong></td>
                                    <td className="text-end"><strong>{formatPrice(totalsToShow.taxAmount)}</strong></td>
                                  </tr>
                                  <tr className="table-success">
                                    <td><strong>Total:</strong></td>
                                    <td className="text-end"><strong>{formatPrice(totalsToShow.totalAmount)}</strong></td>
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
    </>
  );
} 