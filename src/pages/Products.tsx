import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ProductsBackground from '../components/ProductsBackground';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../services/productService';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types/product';
import { compareStringsSpanish } from '../utils/validators';
import PortalModal from '../components/common/PortalModal';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;

export default function Products() {
  // Estados
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);

  // Formulario
  const [formData, setFormData] = useState<CreateProductRequest | UpdateProductRequest>({
    name: '',
    description: '',
    netPrice: 0,
    stock: 0,
    dimensions: ''
  });

  // Necesitamos permitir entrada parcial durante la edición
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({
    netPrice: '',
    stock: ''
  });

  // Agregar nuevos estados para ordenamiento
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Agregar estado para validación de formulario
  const [isFormValid, setIsFormValid] = useState(false);

  // Cargar los productos
  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProducts({});
      console.log('Respuesta de getProducts:', response); // Mostrar en consola la estructura
      setProducts(response.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);

  // Validar el formulario cuando cambia
  useEffect(() => {
    // Para crear/editar producto se necesita al menos nombre y precio
    const hasName = Boolean(formData.name && formData.name.trim() !== '');
    const hasPrice = typeof formData.netPrice === 'number' && formData.netPrice > 0;

    // Establecer la validez del formulario según los requisitos
    setIsFormValid((modalType === 'create' || modalType === 'edit') && hasName && hasPrice);
  }, [formData, modalType]);

  // Abrir modal
  const openModal = (type: ModalType, product: Product | null = null) => {
    setModalType(type);
    setSelectedProduct(product);

    // Reiniciar la validación del formulario
    setIsFormValid(type === 'delete');

    if (type === 'create') {
      setFormData({
        name: '',
        description: '',
        netPrice: 0,
        stock: null,
        dimensions: ''
      });

      // Inicializar los campos de entrada vacíos
      setInputValues({
        netPrice: '',
        stock: ''
      });
    } else if (type === 'edit' && product) {
      // Asegurarse de tener un producto válido con todas sus propiedades
      console.log('openModal edit - producto seleccionado:', product);

      // Limpiar primero los valores para evitar mezclas
      setInputValues({
        netPrice: '',
        stock: ''
      });

      // Crear una copia nueva del objeto formData para evitar referencias
      const newFormData = {
        name: product.name || '',
        description: product.description || '',
        netPrice: typeof product.netPrice === 'number' ? product.netPrice : 0,
        stock: typeof product.stock === 'number' ? product.stock : 0,
        dimensions: product.dimensions || ''
      };

      console.log('openModal edit - formData inicializado:', newFormData);
      setFormData(newFormData);

      // Formatear y establecer los valores de input DESPUÉS de setFormData
      // para asegurar que se use el valor más reciente
      setTimeout(() => {
        const formattedValues = {
          netPrice: formatInputNumber(newFormData.netPrice),
          stock: formatInputNumber(newFormData.stock)
        };
        console.log('openModal edit - inputValues formateados:', formattedValues);
        setInputValues(formattedValues);
      }, 0);

      // Validar el formulario para edición
      const hasName = Boolean(product.name && product.name.trim() !== '');
      const hasPrice = typeof product.netPrice === 'number' && product.netPrice > 0;
      setIsFormValid(hasName && hasPrice);
    }
  };

  // Cerrar modal
  const closeModal = () => {
    setModalType(null);
    setSelectedProduct(null);
  };

  // Manejar cambios en el formulario para campos numéricos
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Guardar el valor exactamente como se escribió
    setInputValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Sólo intentar convertir a número si tiene un formato válido
    // Esto permite valores parciales como "1234," durante la edición
    if (value === '' || value === '-' || value === ',' || value === '.' || value.endsWith(',') || value.endsWith('.')) {
      // Para valores parciales/vacíos, guardar valores diferentes dependiendo del campo
      setFormData(prev => ({
        ...prev,
        [name]: name === 'stock' && value === '' ? null : 0
      }));
    } else {
      // Para valores completos que se pueden convertir a número
      const numericValue = value.replace(',', '.');
      const parsedValue = Number(numericValue);

      if (!isNaN(parsedValue)) {
        setFormData(prev => ({
          ...prev,
          [name]: parsedValue
        }));
      }
    }
  };

  // Manejar cambios en los campos de texto
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validar input numérico (simplificado)
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

  // Manejar submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (modalType === 'create') {
        await createProduct(formData as CreateProductRequest);
      } else if (modalType === 'edit' && selectedProduct) {
        await updateProduct(selectedProduct._id, formData);
      } else if (modalType === 'delete' && selectedProduct) {
        await deleteProduct(selectedProduct._id);
      }

      loadProducts();
      closeModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Formatear precio para mostrar en la UI con decimales cuando existan
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      // El número de decimales será entre 0 y 2, dependiendo si tiene decimales
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Función para manejar ordenamiento
  const handleSort = (field: keyof Product) => {
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
  const getSortedProducts = () => {
    return [...products].sort((a, b) => {
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

  // Formatear número para mostrar en el input
  const formatInputNumber = (value: number | null): string => {
    // Depuración
    console.log(`formatInputNumber recibido: valor=${value}, tipo=${typeof value}`);

    // Si value no es un número o es undefined/null, retornar vacío
    if (value === null || value === undefined || isNaN(Number(value))) {
      console.log('formatInputNumber: valor inválido, retornando vacío');
      return '';
    }

    // Solo retornar vacío si es exactamente cero, no para valores "falsy"
    if (value === 0) {
      console.log('formatInputNumber: valor es cero, retornando vacío');
      return '';
    }

    // Convertir a string con coma decimal
    const formattedValue = value.toString().replace('.', ',');
    console.log(`formatInputNumber: valor formateado=${formattedValue}`);
    return formattedValue;
  };

  return (
    <Layout>
      <div className="products-page-container">
        <ProductsBackground />
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
          <h1 className="h2 font-heading" style={{ color: '#099347' }}>Productos</h1>
          <button
            className="btn"
            style={{ backgroundColor: '#099347', color: 'white' }}
            onClick={() => openModal('create')}
          >
            <i className="bi bi-plus-circle me-1"></i> Nuevo Producto
          </button>
        </div>

        {/* Lista de productos */}
        {error && (
          <div className="alert text-white" style={{ backgroundColor: '#dc3545' }} role="alert">
            {error}
          </div>
        )}

        {loading && !error ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border" style={{ color: '#099347' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="alert alert-info" role="alert">
                No hay productos disponibles.
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
                          <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                            Descripción
                            <i className={`bi ms-1 ${sortField === 'description'
                              ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                              : 'bi-arrow-down-square'}`}></i>
                          </th>
                          <th className="text-end" onClick={() => handleSort('netPrice')} style={{ cursor: 'pointer' }}>
                            Precio
                            <i className={`bi ms-1 ${sortField === 'netPrice'
                              ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                              : 'bi-arrow-down-square'}`}></i>
                          </th>
                          <th className="text-center" onClick={() => handleSort('stock')} style={{ cursor: 'pointer' }}>
                            Stock
                            <i className={`bi ms-1 ${sortField === 'stock'
                              ? (sortDirection === 'asc' ? 'bi-arrow-up-square-fill' : 'bi-arrow-down-square-fill')
                              : 'bi-arrow-down-square'}`}></i>
                          </th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedProducts().map(product => (
                          <tr key={product._id}>
                            <td>{product.name}</td>
                            <td>
                              {product.description}
                              {product.dimensions && (
                                <span className="ms-1" style={{ color: '#6c757d', fontSize: '0.9em' }}>
                                  ({product.dimensions})
                                </span>
                              )}
                            </td>
                            <td className="text-end">{formatPrice(product.netPrice)}</td>
                            <td className="text-center">
                              <span className={`badge ${product.stock === 0 ? 'bg-danger' : (product.stock ? 'bg-success' : 'bg-secondary')}`}>
                                {product.stock !== null ? product.stock : ''}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openModal('edit', product)}
                                  title="Editar"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => openModal('delete', product)}
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

        {/* Modal para Crear/Editar/Ver/Eliminar */}
        {modalType && (
          <PortalModal isOpen={true} onClose={closeModal}>
            {/* Backdrop */}
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: 1050 }}
              onClick={closeModal}
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
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {modalType === 'create' && 'Nuevo Producto'}
                      {modalType === 'edit' && 'Editar Producto'}
                      {modalType === 'delete' && '¿Eliminar Producto?'}
                      {modalType === 'view' && 'Detalles del Producto'}
                    </h5>
                    <button type="button" className="btn-close" onClick={closeModal}></button>
                  </div>
                  <div className="modal-body">
                    {modalType === 'create' || modalType === 'edit' ? (
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label">Nombre <span style={{ color: '#dc3545' }}>*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleTextChange}
                            required
                            placeholder="Ej: Hongo Reishi"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Descripción</label>
                          <textarea
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleTextChange}
                            placeholder="Ej: Grano colonizado"
                            rows={3}
                          ></textarea>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Precio neto <span style={{ color: '#dc3545' }}>*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            name="netPrice"
                            value={inputValues.netPrice}
                            onChange={handleNumericChange}
                            onKeyDown={handleNumericKeyDown}
                            required
                            placeholder="Ej: 7990"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Stock</label>
                          <input
                            type="text"
                            className="form-control"
                            name="stock"
                            value={inputValues.stock}
                            onChange={handleNumericChange}
                            onKeyDown={handleNumericKeyDown}
                            placeholder="Ej: 50"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Dimensiones</label>
                          <input
                            type="text"
                            className="form-control"
                            name="dimensions"
                            value={formData.dimensions}
                            onChange={handleTextChange}
                            placeholder="Ej: 500 gr."
                          />
                        </div>
                      </form>
                    ) : modalType === 'delete' ? (
                      <p>¿Estás seguro de que deseas eliminar <strong>{selectedProduct?.name}</strong>?</p>
                    ) : (
                      <div>
                        <p><strong>Nombre:</strong> {selectedProduct?.name}</p>
                        <p><strong>Descripción:</strong> {selectedProduct?.description || 'Sin descripción'}</p>
                        <p><strong>Precio:</strong> {selectedProduct && formatPrice(selectedProduct.netPrice)}</p>
                        <p><strong>Stock:</strong> {selectedProduct && selectedProduct.stock !== null ? `${selectedProduct.stock} unidades` : 'No especificado'}</p>
                        {selectedProduct?.dimensions && <p><strong>Dimensiones:</strong> {selectedProduct.dimensions}</p>}
                        <p><strong>Tipo:</strong> {selectedProduct?.itemType || 'No especificado'}</p>
                        <p><strong>Creado:</strong> {selectedProduct && new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                        <p><strong>Actualizado:</strong> {selectedProduct && new Date(selectedProduct.updatedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
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
          </PortalModal>
        )}
      </div>
    </Layout>
  );
} 