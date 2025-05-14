import React, { useState, useEffect } from 'react';
import { Sale, CreateSaleRequest, CreateSaleItemRequest } from '../types/sale';
import { Client } from '../types/client';
import { getClients } from '../services/clientService';
import { getProducts } from '../services/productService';
import { getQuotations } from '../services/quotationService';
import { Product } from '../types/product';
import { Quotation, QuotationClient, QuotationProduct } from '../types/quotation';

interface ModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (formData: CreateSaleRequest) => Promise<void>;
  sale: Sale | null;
  modalType: 'create' | 'edit' | 'delete' | 'view';
  loading: boolean;
}

const TAX_RATE = 0.19; // 19% IVA en Chile

const SaleModal: React.FC<ModalProps> = ({
  show,
  onHide,
  onSubmit,
  sale,
  modalType,
  loading
}) => {
  // Estados iniciales
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formData, setFormData] = useState<CreateSaleRequest>({
    documentType: 'boleta',
    date: new Date().toISOString().split('T')[0],
    client: '',
    items: [],
    netAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
    observations: ''
  });

  // Estado para manejar el item actual que se está agregando
  const [currentItem, setCurrentItem] = useState<Omit<CreateSaleItemRequest, 'subtotal'>>({
    product: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0
  });

  // Calcular montos totales
  const calculateTotals = (items: CreateSaleItemRequest[]) => {
    const netAmount = items.reduce((total, item) => total + item.subtotal, 0);
    const taxAmount = netAmount * TAX_RATE;
    const totalAmount = netAmount + taxAmount;

    return { netAmount, taxAmount, totalAmount };
  };

  // Calcular subtotal del item actual
  const calculateSubtotal = (quantity: number, unitPrice: number, discount: number) => {
    return (quantity * unitPrice) - discount;
  };

  // Cargar clientes, productos y cotizaciones al montar el componente
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [clientsResponse, productsResponse, quotationsResponse] = await Promise.all([
          getClients(),
          getProducts(),
          getQuotations()
        ]);

        // Filtrar solo los clientes (no proveedores)
        const onlyClients = clientsResponse.data.filter(entity => entity.isCustomer);

        setClients(onlyClients);
        setProducts(productsResponse.data);
        setQuotations(quotationsResponse.data);
      } catch (error) {
        console.error('Error cargando opciones:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    if (show) {
      loadOptions();

      // Si es edición, inicializar con datos existentes
      if ((modalType === 'edit' || modalType === 'view') && sale) {
        setFormData({
          documentType: sale.documentType,
          date: new Date(sale.date).toISOString().split('T')[0],
          client: sale.client._id,
          items: sale.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            subtotal: item.subtotal
          })),
          netAmount: sale.netAmount,
          taxAmount: sale.taxAmount,
          totalAmount: sale.totalAmount,
          observations: sale.observations || '',
          quotationRef: sale.quotationRef?._id
        });
      } else {
        // Reset para creación
        setFormData({
          documentType: 'boleta',
          date: new Date().toISOString().split('T')[0],
          client: '',
          items: [],
          netAmount: 0,
          taxAmount: 0,
          totalAmount: 0,
          observations: ''
        });
        setCurrentItem({
          product: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0
        });
      }
    }
  }, [show, modalType, sale]);

  // Actualizar campos simples
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Actualizar cotización relacionada
  const handleQuotationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const quotationId = e.target.value;
    if (!quotationId) {
      return;
    }

    // Encontrar la cotización seleccionada
    const selectedQuotation = quotations.find(q => q._id === quotationId);
    if (selectedQuotation && selectedQuotation.items) {
      // Actualizar el cliente y otros datos basados en la cotización
      setFormData(prev => ({
        ...prev,
        client: typeof selectedQuotation.client === 'string'
          ? selectedQuotation.client
          : selectedQuotation.client._id,
        items: selectedQuotation.items.map(item => ({
          product: typeof item.product === 'string'
            ? item.product
            : item.product._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: 0,
          subtotal: item.subtotal
        })),
        netAmount: selectedQuotation.netAmount,
        taxAmount: selectedQuotation.taxAmount,
        totalAmount: selectedQuotation.totalAmount,
        quotationRef: selectedQuotation._id
      }));
    }
  };

  // Actualizar campos del item actual
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'product') {
      // Si cambia el producto, actualizar precio unitario por defecto
      const selectedProduct = products.find(p => p._id === value);
      setCurrentItem({
        ...currentItem,
        product: value,
        unitPrice: selectedProduct?.netPrice || 0
      });
    } else {
      setCurrentItem({
        ...currentItem,
        [name]: name === 'quantity' ? parseInt(value) || 1 :
          name === 'unitPrice' ? parseFloat(value) || 0 :
            name === 'discount' ? parseFloat(value) || 0 : value
      });
    }
  };

  // Agregar un item a la lista
  const addItem = () => {
    if (!currentItem.product || currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
      return; // Validación básica
    }

    const subtotal = calculateSubtotal(currentItem.quantity, currentItem.unitPrice, currentItem.discount);
    const newItem: CreateSaleItemRequest = {
      product: currentItem.product,
      quantity: currentItem.quantity,
      unitPrice: currentItem.unitPrice,
      discount: currentItem.discount,
      subtotal: subtotal
    };

    const updatedItems = [...formData.items, newItem];
    const { netAmount, taxAmount, totalAmount } = calculateTotals(updatedItems);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      netAmount,
      taxAmount,
      totalAmount
    }));

    // Resetear item actual
    setCurrentItem({
      product: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0
    });
  };

  // Eliminar un item de la lista
  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const { netAmount, taxAmount, totalAmount } = calculateTotals(updatedItems);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      netAmount,
      taxAmount,
      totalAmount
    }));
  };

  // Incrementar cantidad de un item
  const increaseQuantity = (index: number) => {
    const updatedItems = [...formData.items];
    const newQuantity = updatedItems[index].quantity + 1;

    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity,
      subtotal: calculateSubtotal(newQuantity, updatedItems[index].unitPrice, updatedItems[index].discount)
    };

    const { netAmount, taxAmount, totalAmount } = calculateTotals(updatedItems);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      netAmount,
      taxAmount,
      totalAmount
    }));
  };

  // Decrementar cantidad de un item
  const decreaseQuantity = (index: number) => {
    const updatedItems = [...formData.items];
    if (updatedItems[index].quantity > 1) {
      const newQuantity = updatedItems[index].quantity - 1;

      updatedItems[index] = {
        ...updatedItems[index],
        quantity: newQuantity,
        subtotal: calculateSubtotal(newQuantity, updatedItems[index].unitPrice, updatedItems[index].discount)
      };

      const { netAmount, taxAmount, totalAmount } = calculateTotals(updatedItems);

      setFormData(prev => ({
        ...prev,
        items: updatedItems,
        netAmount,
        taxAmount,
        totalAmount
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client || formData.items.length === 0) {
      return; // Validación antes de enviar
    }
    onSubmit(formData);
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  // Obtener nombre del producto por ID
  const getProductName = (productId: string) => {
    return products.find(p => p._id === productId)?.name || 'Producto no encontrado';
  };

  // Renderizar título del modal según el tipo
  const renderTitle = () => {
    switch (modalType) {
      case 'create':
        return 'Registrar Nueva Venta';
      case 'edit':
        return 'Editar Venta';
      case 'delete':
        return 'Eliminar Venta';
      case 'view':
        return 'Detalles de la Venta';
      default:
        return '';
    }
  };

  // Clases y atributos para el modal
  const modalClasses = `modal fade ${show ? 'show' : ''}`;
  const modalStyles = show ? { display: 'block' } : { display: 'none' };

  return (
    <>
      {/* Backdrop */}
      {show && <div className="modal-backdrop fade show"></div>}

      {/* Modal */}
      <div className={modalClasses} tabIndex={-1} role="dialog" style={modalStyles}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header" style={{ backgroundColor: '#f8f9fa' }}>
              <h5 className="modal-title">{renderTitle()}</h5>
              <button type="button" className="btn-close" onClick={onHide} disabled={loading}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {loadingOptions ? (
                  <div className="text-center my-3">
                    <div className="spinner-border" style={{ color: '#099347' }} role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Relacionar con cotización */}
                    {(modalType === 'create' || modalType === 'edit') && (
                      <div className="mb-3">
                        <label htmlFor="quotationRef" className="form-label">Basado en Cotización</label>
                        <select
                          id="quotationRef"
                          name="quotationRef"
                          className="form-select"
                          value={formData.quotationRef || ''}
                          onChange={handleQuotationChange}
                        >
                          <option value="">Seleccione una cotización (opcional)</option>
                          {quotations.map(quotation => (
                            <option key={quotation._id} value={quotation._id}>
                              Cotización #{quotation.correlative} -
                              {typeof quotation.client === 'string'
                                ? "Cliente"
                                : quotation.client.name}
                              ({formatCurrency(quotation.totalAmount)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Información básica */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="client" className="form-label">Cliente <span className="text-danger">*</span></label>
                        <select
                          id="client"
                          name="client"
                          className="form-select"
                          value={formData.client}
                          onChange={handleChange}
                          required
                          disabled={modalType === 'view' || modalType === 'delete' || !!formData.quotationRef}
                        >
                          <option value="">Seleccione un cliente</option>
                          {clients.map(client => (
                            <option key={client._id} value={client._id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="date" className="form-label">Fecha</label>
                        <input
                          type="date"
                          className="form-control"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          disabled={modalType === 'view' || modalType === 'delete'}
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="documentType" className="form-label">Tipo de Documento <span className="text-danger">*</span></label>
                        <select
                          id="documentType"
                          name="documentType"
                          className="form-select"
                          value={formData.documentType}
                          onChange={handleChange}
                          required
                          disabled={modalType === 'view' || modalType === 'delete'}
                        >
                          <option value="boleta">Boleta</option>
                          <option value="factura">Factura</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="observations" className="form-label">Observaciones</label>
                        <input
                          type="text"
                          className="form-control"
                          id="observations"
                          name="observations"
                          value={formData.observations || ''}
                          onChange={handleChange}
                          placeholder="Notas adicionales sobre la venta"
                          disabled={modalType === 'view' || modalType === 'delete'}
                        />
                      </div>
                    </div>

                    <hr />

                    {/* Sección para agregar productos */}
                    <h5 className="mb-3">Productos Vendidos</h5>

                    {/* Agregar nuevo item (solo en modo crear/editar) */}
                    {(modalType === 'create' || modalType === 'edit') && (
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <label htmlFor="product" className="form-label">Producto <span className="text-danger">*</span></label>
                          <select
                            id="product"
                            name="product"
                            className="form-select"
                            value={currentItem.product}
                            onChange={handleItemChange}
                          >
                            <option value="">Seleccione un producto</option>
                            {products.map(product => (
                              <option key={product._id} value={product._id}>
                                {product.name} ({formatCurrency(product.netPrice)})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-2">
                          <label htmlFor="quantity" className="form-label">Cantidad <span className="text-danger">*</span></label>
                          <input
                            type="number"
                            className="form-control"
                            id="quantity"
                            name="quantity"
                            min="1"
                            value={currentItem.quantity}
                            onChange={handleItemChange}
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <label htmlFor="unitPrice" className="form-label">Precio Unitario <span className="text-danger">*</span></label>
                          <input
                            type="number"
                            className="form-control"
                            id="unitPrice"
                            name="unitPrice"
                            min="0"
                            value={currentItem.unitPrice}
                            onChange={handleItemChange}
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          <label htmlFor="discount" className="form-label">Descuento</label>
                          <input
                            type="number"
                            className="form-control"
                            id="discount"
                            name="discount"
                            min="0"
                            value={currentItem.discount}
                            onChange={handleItemChange}
                          />
                        </div>
                        <div className="col-md-1 d-flex align-items-end">
                          <button
                            type="button"
                            className="btn w-100"
                            style={{ backgroundColor: '#099347', color: 'white' }}
                            onClick={addItem}
                            disabled={!currentItem.product || currentItem.quantity <= 0 || currentItem.unitPrice <= 0}
                          >
                            <i className="bi bi-plus-circle"></i>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Lista de items */}
                    {formData.items.length > 0 && (
                      <div className="table-responsive mb-3">
                        <table className="table table-hover">
                          <thead className="table-success">
                            <tr>
                              <th>Producto</th>
                              <th>Cantidad</th>
                              <th>Precio Unitario</th>
                              <th>Descuento</th>
                              <th>Subtotal</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.items.map((item, index) => (
                              <tr key={index}>
                                <td>{getProductName(item.product)}</td>
                                <td>
                                  {(modalType === 'create' || modalType === 'edit') ? (
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
                                  ) : (
                                    item.quantity
                                  )}
                                </td>
                                <td>{formatCurrency(item.unitPrice)}</td>
                                <td>{formatCurrency(item.discount)}</td>
                                <td>{formatCurrency(item.subtotal)}</td>
                                <td className="text-center">
                                  {(modalType === 'create' || modalType === 'edit') && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => removeItem(index)}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-group-divider">
                            <tr>
                              <td colSpan={4} className="text-end fw-bold">Neto:</td>
                              <td className="fw-bold">{formatCurrency(formData.netAmount)}</td>
                              <td></td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="text-end fw-bold">IVA (19%):</td>
                              <td className="fw-bold">{formatCurrency(formData.taxAmount)}</td>
                              <td></td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="text-end fw-bold">Total:</td>
                              <td className="fw-bold">{formatCurrency(formData.totalAmount)}</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    {modalType === 'delete' && (
                      <div className="alert alert-danger">
                        ¿Está seguro que desea eliminar esta venta? Esta acción no se puede deshacer.
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onHide}
                  disabled={loading}
                >
                  Cancelar
                </button>

                {modalType !== 'view' && (
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      backgroundColor: modalType === 'delete' ? '#dc3545' : '#099347',
                      color: 'white'
                    }}
                    disabled={loading ||
                      (modalType !== 'delete' && (
                        !formData.client || formData.items.length === 0
                      ))
                    }
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Procesando...
                      </>
                    ) : modalType === 'create' ? (
                      'Crear Venta'
                    ) : modalType === 'edit' ? (
                      'Guardar Cambios'
                    ) : (
                      'Eliminar'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SaleModal; 