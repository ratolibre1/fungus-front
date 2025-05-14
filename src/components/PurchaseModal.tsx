import React, { useState, useEffect } from 'react';
import { Purchase, CreatePurchaseRequest, CreatePurchaseItemRequest } from '../types/purchase';
import { Supplier } from '../types/supplier';
import { getSuppliers } from '../services/supplierService';
import { getProducts } from '../services/productService';
import { Product } from '../types/product';

interface ModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (formData: CreatePurchaseRequest) => Promise<void>;
  purchase: Purchase | null;
  modalType: 'create' | 'edit' | 'delete' | 'view';
  loading: boolean;
}

const TAX_RATE = 0.19; // 19% IVA en Chile

const PurchaseModal: React.FC<ModalProps> = ({
  show,
  onHide,
  onSubmit,
  purchase,
  modalType,
  loading
}) => {
  // Estados iniciales
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formData, setFormData] = useState<CreatePurchaseRequest>({
    documentType: 'factura',
    documentNumber: '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    description: '',
    items: [],
    netAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
    status: 'pending'
  });

  // Estado para manejar el item actual que se está agregando
  const [currentItem, setCurrentItem] = useState<Omit<CreatePurchaseItemRequest, 'subtotal'>>({
    product: '',
    quantity: 1,
    unitPrice: 0
  });

  // Calcular montos totales
  const calculateTotals = (items: CreatePurchaseItemRequest[]) => {
    const netAmount = items.reduce((total, item) => total + item.subtotal, 0);
    const taxAmount = netAmount * TAX_RATE;
    const totalAmount = netAmount + taxAmount;

    return { netAmount, taxAmount, totalAmount };
  };

  // Calcular subtotal del item actual
  const calculateSubtotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  // Cargar proveedores y productos al montar el componente
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [suppliersResponse, productsResponse] = await Promise.all([
          getSuppliers(),
          getProducts()
        ]);
        setSuppliers(suppliersResponse.data);
        setProducts(productsResponse.data);
      } catch (error) {
        console.error('Error cargando opciones:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    if (show) {
      loadOptions();

      // Si es edición, inicializar con datos existentes
      if (modalType === 'edit' && purchase) {
        setFormData({
          documentType: purchase.documentType,
          documentNumber: purchase.documentNumber,
          date: new Date(purchase.date).toISOString().split('T')[0],
          supplier: purchase.supplier._id,
          description: purchase.description,
          items: purchase.items.map(item => ({
            product: item.product?._id || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal
          })),
          netAmount: purchase.netAmount,
          taxAmount: purchase.taxAmount,
          totalAmount: purchase.totalAmount,
          status: purchase.status
        });
      } else {
        // Reset para creación
        setFormData({
          documentType: 'factura',
          documentNumber: '',
          date: new Date().toISOString().split('T')[0],
          supplier: '',
          description: '',
          items: [],
          netAmount: 0,
          taxAmount: 0,
          totalAmount: 0,
          status: 'pending'
        });
        setCurrentItem({
          product: '',
          quantity: 1,
          unitPrice: 0
        });
      }
    }
  }, [show, modalType, purchase]);

  // Actualizar campos simples
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          name === 'unitPrice' ? parseFloat(value) || 0 : value
      });
    }
  };

  // Agregar un item a la lista
  const addItem = () => {
    if (!currentItem.product || currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
      return; // Validación básica
    }

    const subtotal = calculateSubtotal(currentItem.quantity, currentItem.unitPrice);
    const newItem: CreatePurchaseItemRequest = {
      product: currentItem.product,
      quantity: currentItem.quantity,
      unitPrice: currentItem.unitPrice,
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
      unitPrice: 0
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
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: updatedItems[index].quantity + 1,
      subtotal: calculateSubtotal(updatedItems[index].quantity + 1, updatedItems[index].unitPrice)
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
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: updatedItems[index].quantity - 1,
        subtotal: calculateSubtotal(updatedItems[index].quantity - 1, updatedItems[index].unitPrice)
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
    if (!formData.supplier || !formData.documentNumber || !formData.description || formData.items.length === 0) {
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
        return 'Registrar Nueva Compra';
      case 'edit':
        return 'Editar Compra';
      case 'delete':
        return 'Eliminar Compra';
      case 'view':
        return 'Detalles de la Compra';
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
                    {/* Información básica */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="supplier" className="form-label">Proveedor <span className="text-danger">*</span></label>
                        <select
                          id="supplier"
                          name="supplier"
                          className="form-select"
                          value={formData.supplier}
                          onChange={handleChange}
                          required
                          disabled={modalType === 'view' || modalType === 'delete'}
                        >
                          <option value="">Seleccione un proveedor</option>
                          {suppliers.map(supplier => (
                            <option key={supplier._id} value={supplier._id}>
                              {supplier.name}
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
                      <div className="col-md-4">
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
                          <option value="factura">Factura</option>
                          <option value="boleta">Boleta</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="documentNumber" className="form-label">Número de Documento <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          id="documentNumber"
                          name="documentNumber"
                          value={formData.documentNumber}
                          onChange={handleChange}
                          required
                          disabled={modalType === 'view' || modalType === 'delete'}
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="status" className="form-label">Estado</label>
                        <select
                          id="status"
                          name="status"
                          className="form-select"
                          value={formData.status}
                          onChange={handleChange}
                          disabled={modalType === 'view' || modalType === 'delete'}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="completed">Completada</option>
                          <option value="canceled">Cancelada</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Descripción <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Categoría o propósito de la compra"
                        disabled={modalType === 'view' || modalType === 'delete'}
                      />
                    </div>

                    <hr />

                    {/* Sección para agregar productos */}
                    <h5 className="mb-3">Productos Comprados</h5>

                    {/* Agregar nuevo item (solo en modo crear/editar) */}
                    {(modalType === 'create' || modalType === 'edit') && (
                      <div className="row mb-3">
                        <div className="col-md-5">
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
                        <div className="col-md-3">
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
                              <td colSpan={3} className="text-end fw-bold">Neto:</td>
                              <td className="fw-bold">{formatCurrency(formData.netAmount)}</td>
                              <td></td>
                            </tr>
                            <tr>
                              <td colSpan={3} className="text-end fw-bold">IVA (19%):</td>
                              <td className="fw-bold">{formatCurrency(formData.taxAmount)}</td>
                              <td></td>
                            </tr>
                            <tr>
                              <td colSpan={3} className="text-end fw-bold">Total:</td>
                              <td className="fw-bold">{formatCurrency(formData.totalAmount)}</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    {modalType === 'delete' && (
                      <div className="alert alert-danger">
                        ¿Está seguro que desea eliminar esta compra? Esta acción no se puede deshacer.
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
                        !formData.supplier || !formData.documentNumber || !formData.description || formData.items.length === 0
                      ))
                    }
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Procesando...
                      </>
                    ) : modalType === 'create' ? (
                      'Crear Compra'
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

export default PurchaseModal; 