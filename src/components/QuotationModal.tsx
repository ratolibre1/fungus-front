import { useEffect, useState } from 'react';
import {
  Quotation,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  CreateQuotationItem
} from '../types/quotation';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;

interface Product {
  _id: string;
  name: string;
  description: string;
  netPrice: number;
}

interface Client {
  _id: string;
  name: string;
  rut: string;
  email: string;
  phone: string;
  address?: string;
}

interface QuotationModalProps {
  isOpen: boolean;
  modalType: ModalType;
  selectedQuotation: Quotation | null;
  loading: boolean;
  clients: Client[];
  products: Product[];
  onClose: () => void;
  onSubmit: (formData: CreateQuotationRequest | UpdateQuotationRequest) => Promise<void>;
}

export default function QuotationModal({
  isOpen,
  modalType,
  selectedQuotation,
  loading,
  clients,
  products,
  onClose,
  onSubmit
}: QuotationModalProps) {
  // Estado para errores de validación
  const [validationErrors, setValidationErrors] = useState<{
    client: string | null;
    items: string | null;
  }>({
    client: null,
    items: null
  });

  // Formulario
  const [formData, setFormData] = useState<CreateQuotationRequest>({
    client: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    netAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
    observations: ''
  });

  // Estado para seguimiento de productos seleccionados
  const [selectedItems, setSelectedItems] = useState<CreateQuotationItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');

  // Estados auxiliares para agregar productos
  const [currentProductId, setCurrentProductId] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);
  const [currentUnitPrice, setCurrentUnitPrice] = useState<number>(0);
  const [currentDiscount, setCurrentDiscount] = useState<number>(0);
  const [currentSubtotal, setCurrentSubtotal] = useState<number>(0);

  // Estado para validación de formulario
  const [isFormValid, setIsFormValid] = useState(false);

  // Inicializar el formulario cuando cambia la cotización seleccionada o el tipo de modal
  useEffect(() => {
    console.log('Modal Props:', { isOpen, modalType, selectedQuotation });

    setValidationErrors({
      client: null,
      items: null
    });

    if (modalType === 'create') {
      setFormData({
        client: '',
        date: new Date().toISOString().split('T')[0],
        items: [],
        netAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
        observations: ''
      });
      setSelectedItems([]);
      setSelectedClient('');
    } else if ((modalType === 'edit' || modalType === 'view') && selectedQuotation) {
      const clientId = typeof selectedQuotation.client === 'object'
        ? selectedQuotation.client._id
        : selectedQuotation.client;

      // Formatear fecha para input date (YYYY-MM-DD)
      const formattedDate = new Date(selectedQuotation.date)
        .toISOString()
        .split('T')[0];

      setSelectedClient(clientId);

      // Procesar items
      const processedItems: CreateQuotationItem[] = selectedQuotation.items
        ? selectedQuotation.items.map(item => ({
          product: typeof item.product === 'object' ? item.product._id : item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          subtotal: item.subtotal
        }))
        : [];

      setSelectedItems(processedItems);

      setFormData({
        client: clientId,
        date: formattedDate,
        items: processedItems,
        netAmount: selectedQuotation.netAmount,
        taxAmount: selectedQuotation.taxAmount,
        totalAmount: selectedQuotation.totalAmount,
        observations: selectedQuotation.observations
      });
    }
  }, [modalType, selectedQuotation]);

  // Validar el formulario cuando cambia
  useEffect(() => {
    if (modalType !== 'create' && modalType !== 'edit') return;

    // Resetear errores de validación
    setValidationErrors({
      client: null,
      items: null
    });

    // Validaciones
    const hasClient = Boolean(formData.client && formData.client.trim() !== '');
    const hasItems = formData.items.length > 0;

    if (!hasClient) {
      setValidationErrors(prev => ({
        ...prev,
        client: 'Debes seleccionar un cliente'
      }));
    }

    if (!hasItems) {
      setValidationErrors(prev => ({
        ...prev,
        items: 'Debes agregar al menos un producto'
      }));
    }

    // Establecer validez del formulario
    setIsFormValid(hasClient && hasItems);
  }, [formData, modalType]);

  // Calcular subtotal al cambiar cantidad, precio o descuento
  useEffect(() => {
    const baseAmount = currentQuantity * currentUnitPrice;
    const discountAmount = baseAmount * (currentDiscount / 100);
    const newSubtotal = baseAmount - discountAmount;
    setCurrentSubtotal(newSubtotal);
  }, [currentQuantity, currentUnitPrice, currentDiscount]);

  // Función para agregar un producto a la cotización
  const addProduct = () => {
    if (!currentProductId || currentQuantity <= 0 || currentUnitPrice <= 0) return;

    const newItem: CreateQuotationItem = {
      product: currentProductId,
      quantity: currentQuantity,
      unitPrice: currentUnitPrice,
      discount: currentDiscount,
      subtotal: currentSubtotal
    };

    const updatedItems = [...selectedItems, newItem];
    setSelectedItems(updatedItems);

    // Actualizar formData con el nuevo item y recalcular totales
    const netAmount = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = netAmount * 0.19; // 19% IVA en Chile

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      netAmount,
      taxAmount,
      totalAmount: netAmount + taxAmount
    }));

    // Resetear campos
    setCurrentProductId('');
    setCurrentQuantity(1);
    setCurrentUnitPrice(0);
    setCurrentDiscount(0);
    setCurrentSubtotal(0);
  };

  // Función para eliminar un producto de la cotización
  const removeProduct = (index: number) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updatedItems);

    // Recalcular totales
    const netAmount = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = netAmount * 0.19; // 19% IVA

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      netAmount,
      taxAmount,
      totalAmount: netAmount + taxAmount
    }));
  };

  // Manejar cambio de cliente
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    setSelectedClient(clientId);
    setFormData(prev => ({
      ...prev,
      client: clientId
    }));
  };

  // Manejar selección de producto
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    setCurrentProductId(productId);

    // Autocompletar el precio unitario con el precio del producto
    if (productId) {
      const selectedProduct = products.find(p => p._id === productId);
      if (selectedProduct) {
        setCurrentUnitPrice(selectedProduct.netPrice);
      }
    } else {
      setCurrentUnitPrice(0);
    }
  };

  // Manejar cambios en campos numéricos
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseFloat(value) || 0;

    switch (name) {
      case 'quantity':
        setCurrentQuantity(numberValue);
        break;
      case 'unitPrice':
        setCurrentUnitPrice(numberValue);
        break;
      case 'discount':
        setCurrentDiscount(numberValue);
        break;
      default:
        break;
    }
  };

  // Manejar cambios en otros campos de texto
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // Formatear moneda
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '$0';

    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  // Encontrar nombre de producto por ID
  const getProductName = (productId: string | null | undefined) => {
    if (!productId) return 'Producto no disponible';

    const product = products.find(p => p._id === productId);
    return product ? product.name : 'Producto no disponible';
  };

  // Encontrar nombre de cliente por ID
  const getClientName = (clientId: string | null | undefined) => {
    if (!clientId) return 'Cliente no disponible';

    const client = clients.find(c => c._id === clientId);
    return client ? client.name : 'Cliente no disponible';
  };

  // Función para aumentar la cantidad de un producto en la tabla
  const increaseQuantity = (index: number) => {
    const updatedItems = [...selectedItems];
    updatedItems[index].quantity += 1;

    // Recalcular el subtotal para este item
    const item = updatedItems[index];
    const baseAmount = item.quantity * item.unitPrice;
    const discountAmount = baseAmount * (item.discount / 100);
    item.subtotal = baseAmount - discountAmount;

    setSelectedItems(updatedItems);

    // Recalcular totales
    const netAmount = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = netAmount * 0.19; // 19% IVA

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      netAmount,
      taxAmount,
      totalAmount: netAmount + taxAmount
    }));
  };

  // Función para disminuir la cantidad de un producto en la tabla
  const decreaseQuantity = (index: number) => {
    const updatedItems = [...selectedItems];

    // No permitir cantidades menores a 1
    if (updatedItems[index].quantity <= 1) return;

    updatedItems[index].quantity -= 1;

    // Recalcular el subtotal para este item
    const item = updatedItems[index];
    const baseAmount = item.quantity * item.unitPrice;
    const discountAmount = baseAmount * (item.discount / 100);
    item.subtotal = baseAmount - discountAmount;

    setSelectedItems(updatedItems);

    // Recalcular totales
    const netAmount = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = netAmount * 0.19; // 19% IVA

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      netAmount,
      taxAmount,
      totalAmount: netAmount + taxAmount
    }));
  };

  if (!isOpen) {
    console.log('Modal cerrado porque isOpen es:', isOpen);
    return null;
  }

  console.log('Modal abierto con tipo:', modalType);
  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {modalType === 'create' && 'Nueva Cotización'}
              {modalType === 'edit' && 'Editar Cotización'}
              {modalType === 'delete' && '¿Eliminar Cotización?'}
              {modalType === 'view' && 'Detalles de Cotización'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {modalType === 'create' || modalType === 'edit' ? (
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Cliente <span style={{ color: '#dc3545' }}>*</span></label>
                    <select
                      className="form-select"
                      name="client"
                      value={selectedClient}
                      onChange={handleClientChange}
                      required
                      disabled={modalType === 'edit'} // No permitir cambiar el cliente en edición
                    >
                      <option value="">Seleccionar cliente</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>
                          {client.name} ({client.rut})
                        </option>
                      ))}
                    </select>
                    {validationErrors.client && (
                      <small className="text-danger">{validationErrors.client}</small>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Fecha <span style={{ color: '#dc3545' }}>*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={formData.date}
                      onChange={handleTextChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Observaciones</label>
                  <textarea
                    className="form-control"
                    name="observations"
                    value={formData.observations || ''}
                    onChange={handleTextChange}
                    rows={2}
                  />
                </div>

                <h6 className="mt-4 mb-3">Agregar Productos</h6>

                <div className="row mb-3 g-2 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label">Producto</label>
                    <select
                      className="form-select"
                      value={currentProductId}
                      onChange={handleProductChange}
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} ({formatCurrency(product.netPrice)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Cantidad</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={currentQuantity || ''}
                      onChange={handleNumberChange}
                      min="1"
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Precio Unitario</label>
                    <input
                      type="number"
                      className="form-control"
                      name="unitPrice"
                      value={currentUnitPrice || ''}
                      onChange={handleNumberChange}
                      min="0"
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Descuento %</label>
                    <input
                      type="number"
                      className="form-control"
                      name="discount"
                      value={currentDiscount || ''}
                      onChange={handleNumberChange}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="btn btn-success w-100"
                      onClick={addProduct}
                      disabled={!currentProductId || currentQuantity <= 0 || currentUnitPrice <= 0}
                    >
                      <i className="bi bi-plus-lg"></i> Agregar
                    </button>
                  </div>
                </div>

                {validationErrors.items && (
                  <div className="mb-3">
                    <small className="text-danger">{validationErrors.items}</small>
                  </div>
                )}

                {/* Lista de productos agregados */}
                {selectedItems.length > 0 ? (
                  <div className="table-responsive mb-3">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Precio</th>
                          <th className="text-end">Descuento</th>
                          <th className="text-end">Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((item, index) => (
                          <tr key={index}>
                            <td>{getProductName(item.product)}</td>
                            <td className="text-center">
                              <div className="quantity-control">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => decreaseQuantity(index)}
                                  disabled={item.quantity <= 1}
                                  title="Disminuir cantidad"
                                >
                                  <i className="bi bi-dash"></i>
                                </button>
                                <span className="quantity-value">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => increaseQuantity(index)}
                                  title="Aumentar cantidad"
                                >
                                  <i className="bi bi-plus"></i>
                                </button>
                              </div>
                            </td>
                            <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-end">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                            <td className="text-end">{formatCurrency(item.subtotal)}</td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeProduct(index)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-group-divider">
                        <tr>
                          <td colSpan={4} className="text-end"><strong>Neto:</strong></td>
                          <td className="text-end">{formatCurrency(formData.netAmount)}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="text-end"><strong>IVA (19%):</strong></td>
                          <td className="text-end">{formatCurrency(formData.taxAmount)}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="text-end"><strong>Total:</strong></td>
                          <td className="text-end"><strong>{formatCurrency(formData.totalAmount)}</strong></td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    No hay productos agregados a la cotización.
                  </div>
                )}
              </form>
            ) : modalType === 'delete' ? (
              <p>¿Estás seguro de que deseas eliminar la cotización N° {selectedQuotation?.correlative}?</p>
            ) : (
              <div>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p><strong>N° Cotización:</strong> {selectedQuotation?.correlative}</p>
                    <p><strong>Fecha:</strong> {selectedQuotation && new Date(selectedQuotation.date).toLocaleDateString('es-CL')}</p>
                    <p>
                      <strong>Cliente:</strong> {
                        typeof selectedQuotation?.client === 'object'
                          ? selectedQuotation.client.name
                          : selectedQuotation?.client ? getClientName(selectedQuotation.client) : 'No disponible'
                      }
                    </p>
                    <p>
                      <strong>Vendedor:</strong> {
                        typeof selectedQuotation?.seller === 'object'
                          ? selectedQuotation.seller.name
                          : 'No disponible'
                      }
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Estado:</strong> {selectedQuotation?.status}</p>
                    <p><strong>Neto:</strong> {selectedQuotation && formatCurrency(selectedQuotation.netAmount)}</p>
                    <p><strong>IVA:</strong> {selectedQuotation && formatCurrency(selectedQuotation.taxAmount)}</p>
                    <p><strong>Total:</strong> {selectedQuotation && formatCurrency(selectedQuotation.totalAmount)}</p>
                  </div>
                </div>

                {selectedQuotation?.observations && (
                  <div className="mb-4">
                    <p><strong>Observaciones:</strong></p>
                    <p className="border p-2 rounded bg-light">{selectedQuotation.observations}</p>
                  </div>
                )}

                <h6 className="mt-4 mb-3">Productos</h6>

                {selectedQuotation?.items && selectedQuotation.items.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Precio</th>
                          <th className="text-end">Descuento</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuotation.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              {typeof item.product === 'object'
                                ? item.product.name
                                : 'Producto no disponible'}
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-end">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                            <td className="text-end">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    No hay productos en esta cotización.
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {modalType === 'view' ? 'Cerrar' : 'Cancelar'}
            </button>
            {modalType !== 'view' && (
              <button
                type="button"
                className={`btn ${modalType === 'delete' ? 'btn-danger' : ''}`}
                style={modalType !== 'delete' ? { backgroundColor: '#099347', color: 'white' } : {}}
                onClick={handleSubmit}
                disabled={loading || ((modalType === 'create' || modalType === 'edit') && !isFormValid)}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Procesando...
                  </>
                ) : (
                  modalType === 'create' ? 'Crear' :
                    modalType === 'edit' ? 'Guardar cambios' :
                      'Eliminar'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 