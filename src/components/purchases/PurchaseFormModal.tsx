import React, { useState, useEffect } from 'react';
import PortalModal from '../common/PortalModal';
import { Purchase, DocumentType } from '../../types/purchase';
import { Supplier } from '../../types/supplier';
import { Consumable } from '../../types/consumable';
import { getSuppliers } from '../../services/supplierService';
import { getConsumables } from '../../services/consumableService';
import { previewPurchase } from '../../services/purchaseService';

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
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const SupplierSearchSelector: React.FC<SupplierSearchProps> = ({ suppliers, value, onChange, disabled, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.rut.toLowerCase().includes(searchTerm.toLowerCase())
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

  const formatSupplierDisplay = (supplier: Supplier) => {
    return `${supplier.name} - ${supplier.rut}`;
  };

  return (
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

            <div className="list-group list-group-flush" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredSuppliers.length === 0 ? (
                <div className="list-group-item text-center text-muted py-3">
                  <i className="bi bi-search me-2"></i>
                  No se encontraron proveedores
                </div>
              ) : (
                filteredSuppliers.map(supplier => (
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

// Componente de búsqueda para insumos (consumibles)
interface ConsumableSearchProps {
  consumables: Consumable[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const ConsumableSearchSelector: React.FC<ConsumableSearchProps> = ({
  consumables,
  value,
  onChange,
  disabled,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredConsumables = consumables.filter(consumable =>
    consumable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consumable.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConsumable = consumables.find(c => c._id === value);

  const handleSelect = (consumableId: string) => {
    onChange(consumableId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
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
            zIndex: 1060,
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
                <div className="list-group-item text-center text-muted py-3">
                  <i className="bi bi-search me-2"></i>
                  No se encontraron insumos
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
          style={{ zIndex: 1059 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {error && <div className="invalid-feedback">{error}</div>}
    </div>
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

  // Estados para validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estados para preview en tiempo real
  const [previewData, setPreviewData] = useState<{
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Cargar datos iniciales
  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [suppliersResponse, consumablesResponse] = await Promise.all([
        getSuppliers(),
        getConsumables()
      ]);

      setSuppliers(suppliersResponse.data);
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

  // Calcular preview en tiempo real
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

      const response = await previewPurchase(previewRequest);

      if (response.success) {
        setPreviewData({
          netAmount: response.data.netAmount,
          taxAmount: response.data.taxAmount,
          totalAmount: response.data.totalAmount
        });
      }
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
  };

  // Manejar actualización de item
  const updateItem = (index: number, field: keyof PurchaseItemForm, value: string | number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      // Si se cambia el item, buscar su nombre y precio
      if (field === 'item' && value) {
        const selectedConsumable = consumables.find(c => c._id === value);
        if (selectedConsumable) {
          newItems[index].itemName = selectedConsumable.name;
          newItems[index].unitPrice = selectedConsumable.netPrice || 0;
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