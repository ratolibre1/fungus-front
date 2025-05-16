import { useState } from 'react';
import Layout from '../components/Layout';

export default function Help() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
    setActiveItem(null); // Cerrar cualquier item al cambiar de sección
  };

  const toggleItem = (itemId: string) => {
    setActiveItem(activeItem === itemId ? null : itemId);
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
          <h1 className="h2 font-heading" style={{ color: '#099347' }}>
            <i className="bi bi-question-circle me-2"></i>
            Centro de Ayuda
          </h1>
        </div>

        <div className="row mb-4">
          <div className="col-md-12">
            <div className="alert alert-info">
              <i className="bi bi-info-circle-fill me-2"></i>
              Bienvenido al centro de ayuda de Fungus Mycelium. Aquí encontrarás información sobre cómo utilizar las diferentes funcionalidades del sistema.
            </div>
          </div>
        </div>

        {/* Acordeón principal */}
        <div className="accordion" id="helpAccordion">

          {/* Sección Clientes */}
          <div className="accordion-item border mb-3 shadow-sm">
            <h2 className="accordion-header">
              <button
                className={`accordion-button ${activeSection === 'clients' ? '' : 'collapsed'}`}
                type="button"
                onClick={() => toggleSection('clients')}
                style={{ backgroundColor: activeSection === 'clients' ? '#f8f9fa' : 'white' }}
              >
                <i className="bi bi-people me-2" style={{ color: '#099347' }}></i>
                <strong>Gestión de Clientes</strong>
              </button>
            </h2>
            <div className={`accordion-collapse collapse ${activeSection === 'clients' ? 'show' : ''}`}>
              <div className="accordion-body">
                <div className="accordion" id="clientsAccordion">

                  {/* Agregar Cliente */}
                  <div className="accordion-item mb-2">
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${activeItem === 'addClient' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => toggleItem('addClient')}
                      >
                        <i className="bi bi-plus-circle me-2" style={{ color: '#099347' }}></i>
                        ¿Cómo agregar un nuevo cliente?
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${activeItem === 'addClient' ? 'show' : ''}`}>
                      <div className="accordion-body">
                        <p>Para agregar un nuevo cliente, sigue estos pasos:</p>
                        <ol>
                          <li>Navega a la sección <strong>Clientes</strong> desde el menú lateral.</li>
                          <li>Haz clic en el botón <strong>Nuevo Cliente</strong> ubicado en la parte superior derecha.</li>
                          <li>Completa el formulario con todos los datos requeridos. Los campos marcados con <span className="text-danger">*</span> son obligatorios.</li>
                          <li>El RUT se formatea automáticamente. Ingresa los números y la aplicación añadirá los puntos y guiones.</li>
                          <li>El número de teléfono debe incluir el código de país (+56).</li>
                          <li>Haz clic en <strong>Crear</strong> para guardar el nuevo cliente.</li>
                        </ol>
                        <div className="alert alert-warning">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          <strong>Importante:</strong> El RUT debe ser válido según la fórmula de verificación chilena.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Editar Cliente */}
                  <div className="accordion-item mb-2">
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${activeItem === 'editClient' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => toggleItem('editClient')}
                      >
                        <i className="bi bi-pencil me-2" style={{ color: '#099347' }}></i>
                        ¿Cómo editar un cliente existente?
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${activeItem === 'editClient' ? 'show' : ''}`}>
                      <div className="accordion-body">
                        <p>Para modificar los datos de un cliente, sigue estos pasos:</p>
                        <ol>
                          <li>Navega a la sección <strong>Clientes</strong> desde el menú lateral.</li>
                          <li>Localiza el cliente que deseas editar en la tabla de clientes.</li>
                          <li>Haz clic en el botón <i className="bi bi-pencil"></i> (editar) en la columna de acciones.</li>
                          <li>Actualiza la información necesaria en el formulario que aparece.</li>
                          <li>Haz clic en <strong>Guardar cambios</strong> para actualizar los datos.</li>
                        </ol>
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          También puedes acceder a la vista detallada del cliente haciendo clic en <i className="bi bi-eye"></i> y luego usar el botón <strong>Editar</strong> allí.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ver detalle del Cliente */}
                  <div className="accordion-item">
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${activeItem === 'viewClient' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => toggleItem('viewClient')}
                      >
                        <i className="bi bi-eye me-2" style={{ color: '#099347' }}></i>
                        ¿Cómo ver el detalle de un cliente?
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${activeItem === 'viewClient' ? 'show' : ''}`}>
                      <div className="accordion-body">
                        <p>Para ver información detallada de un cliente:</p>
                        <ol>
                          <li>Navega a la sección <strong>Clientes</strong> desde el menú lateral.</li>
                          <li>Localiza el cliente en la tabla.</li>
                          <li>Haz clic en el botón <i className="bi bi-eye"></i> (ver detalle) en la columna de acciones.</li>
                        </ol>
                        <p>En la vista detallada podrás ver:</p>
                        <ul>
                          <li>Información personal y de contacto del cliente</li>
                          <li>Estadísticas de compras</li>
                          <li>Historial de compras realizadas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Proveedores */}
          <div className="accordion-item border mb-3 shadow-sm">
            <h2 className="accordion-header">
              <button
                className={`accordion-button ${activeSection === 'suppliers' ? '' : 'collapsed'}`}
                type="button"
                onClick={() => toggleSection('suppliers')}
                style={{ backgroundColor: activeSection === 'suppliers' ? '#f8f9fa' : 'white' }}
              >
                <i className="bi bi-truck me-2" style={{ color: '#099347' }}></i>
                <strong>Gestión de Proveedores</strong>
              </button>
            </h2>
            <div className={`accordion-collapse collapse ${activeSection === 'suppliers' ? 'show' : ''}`}>
              <div className="accordion-body">
                <div className="accordion" id="suppliersAccordion">

                  {/* Agregar Proveedor */}
                  <div className="accordion-item mb-2">
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${activeItem === 'addSupplier' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => toggleItem('addSupplier')}
                      >
                        <i className="bi bi-plus-circle me-2" style={{ color: '#099347' }}></i>
                        ¿Cómo agregar un nuevo proveedor?
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${activeItem === 'addSupplier' ? 'show' : ''}`}>
                      <div className="accordion-body">
                        <p>Para agregar un nuevo proveedor, sigue estos pasos:</p>
                        <ol>
                          <li>Navega a la sección <strong>Proveedores</strong> desde el menú lateral.</li>
                          <li>Haz clic en el botón <strong>Nuevo Proveedor</strong> ubicado en la parte superior derecha.</li>
                          <li>Completa el formulario con todos los datos requeridos. Los campos marcados con <span className="text-danger">*</span> son obligatorios.</li>
                          <li>Al igual que con los clientes, el RUT se formatea automáticamente.</li>
                          <li>Haz clic en <strong>Crear</strong> para guardar el nuevo proveedor.</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Editar Proveedor */}
                  <div className="accordion-item mb-2">
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${activeItem === 'editSupplier' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => toggleItem('editSupplier')}
                      >
                        <i className="bi bi-pencil me-2" style={{ color: '#099347' }}></i>
                        ¿Cómo editar un proveedor existente?
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${activeItem === 'editSupplier' ? 'show' : ''}`}>
                      <div className="accordion-body">
                        <p>Para modificar los datos de un proveedor, sigue estos pasos:</p>
                        <ol>
                          <li>Navega a la sección <strong>Proveedores</strong> desde el menú lateral.</li>
                          <li>Localiza el proveedor que deseas editar en la tabla.</li>
                          <li>Haz clic en el botón <i className="bi bi-pencil"></i> (editar) en la columna de acciones.</li>
                          <li>Actualiza la información necesaria en el formulario que aparece.</li>
                          <li>Haz clic en <strong>Guardar cambios</strong> para actualizar los datos.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Cotizaciones */}
          <div className="accordion-item border mb-3 shadow-sm">
            <h2 className="accordion-header">
              <button
                className={`accordion-button ${activeSection === 'quotations' ? '' : 'collapsed'}`}
                type="button"
                onClick={() => toggleSection('quotations')}
                style={{ backgroundColor: activeSection === 'quotations' ? '#f8f9fa' : 'white' }}
              >
                <i className="bi bi-file-earmark-text me-2" style={{ color: '#099347' }}></i>
                <strong>Gestión de Cotizaciones</strong>
              </button>
            </h2>
            <div className={`accordion-collapse collapse ${activeSection === 'quotations' ? 'show' : ''}`}>
              <div className="accordion-body">
                <div className="accordion" id="quotationsAccordion">

                  {/* Crear Cotización */}
                  <div className="accordion-item mb-2">
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${activeItem === 'createQuotation' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => toggleItem('createQuotation')}
                      >
                        <i className="bi bi-plus-circle me-2" style={{ color: '#099347' }}></i>
                        ¿Cómo crear una nueva cotización?
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${activeItem === 'createQuotation' ? 'show' : ''}`}>
                      <div className="accordion-body">
                        <p>Para crear una nueva cotización, sigue estos pasos:</p>
                        <ol>
                          <li>Navega a la sección <strong>Cotizaciones</strong> desde el menú lateral.</li>
                          <li>Haz clic en el botón <strong>Nueva Cotización</strong> ubicado en la parte superior derecha.</li>
                          <li>En el formulario que aparece:
                            <ul>
                              <li>Selecciona un cliente de la lista desplegable.</li>
                              <li>Verifica la fecha o modifícala si es necesario.</li>
                              <li>Opcionalmente, añade observaciones relevantes.</li>
                            </ul>
                          </li>
                          <li>Para agregar productos a la cotización:
                            <ul>
                              <li>Selecciona un producto de la lista desplegable.</li>
                              <li>Indica la cantidad deseada.</li>
                              <li>El precio unitario se cargará automáticamente, pero puedes modificarlo.</li>
                              <li>Si aplica, indica un porcentaje de descuento.</li>
                              <li>Haz clic en <strong>Agregar</strong> para incluir el producto en la cotización.</li>
                              <li>Repite estos pasos para cada producto que desees incluir.</li>
                            </ul>
                          </li>
                          <li>Para ajustar la cantidad de un producto ya agregado, usa los botones <i className="bi bi-plus"></i> y <i className="bi bi-dash"></i> junto a la cantidad.</li>
                          <li>Cuando hayas terminado, haz clic en <strong>Crear</strong> para guardar la cotización.</li>
                        </ol>
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          El sistema calculará automáticamente los subtotales, el neto, el IVA (19%) y el total de la cotización.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Editar Cotización */}
                  <div className="accordion-item mb-2">
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${activeItem === 'editQuotation' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => toggleItem('editQuotation')}
                      >
                        <i className="bi bi-pencil me-2" style={{ color: '#099347' }}></i>
                        ¿Cómo editar una cotización?
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${activeItem === 'editQuotation' ? 'show' : ''}`}>
                      <div className="accordion-body">
                        <p>Para editar una cotización existente, puedes hacerlo desde dos lugares:</p>

                        <h6>Desde la lista de cotizaciones:</h6>
                        <ol>
                          <li>Navega a la sección <strong>Cotizaciones</strong> desde el menú lateral.</li>
                          <li>Localiza la cotización que deseas editar en la tabla.</li>
                          <li>Haz clic en el botón <i className="bi bi-pencil"></i> (editar) en la columna de acciones.</li>
                          <li>Modifica los campos necesarios en el formulario que aparece.</li>
                          <li>Haz clic en <strong>Guardar cambios</strong> para actualizar la cotización.</li>
                        </ol>

                        <h6>Desde la vista detallada:</h6>
                        <ol>
                          <li>Navega a la vista detallada de la cotización haciendo clic en <i className="bi bi-eye"></i>.</li>
                          <li>Haz clic en el botón <strong>Editar Cotización</strong> en la parte superior de la página.</li>
                          <li>Realiza los cambios necesarios.</li>
                          <li>Haz clic en <strong>Guardar cambios</strong> para actualizar la cotización.</li>
                        </ol>

                        <div className="alert alert-warning">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          <strong>Nota:</strong> Solo se pueden editar las cotizaciones en estado "Pendiente".
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cambiar estado de Cotización */}
                  <div className="accordion-item mb-2">
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${activeItem === 'changeStatus' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => toggleItem('changeStatus')}
                      >
                        <i className="bi bi-arrow-repeat me-2" style={{ color: '#099347' }}></i>
                        ¿Cómo cambiar el estado de una cotización?
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${activeItem === 'changeStatus' ? 'show' : ''}`}>
                      <div className="accordion-body">
                        <p>Las cotizaciones pueden tener diferentes estados: Pendiente, Aprobada, Rechazada, Convertida o Expirada.</p>
                        <p>Para cambiar el estado de una cotización:</p>

                        <h6>Desde la lista de cotizaciones:</h6>
                        <ol>
                          <li>Localiza la cotización en la tabla.</li>
                          <li>En la columna de acciones, haz clic en <i className="bi bi-check-circle"></i> para aprobar una cotización pendiente.</li>
                        </ol>

                        <h6>Desde la vista detallada:</h6>
                        <ol>
                          <li>Navega a la vista detallada de la cotización.</li>
                          <li>En la parte superior, encontrarás botones para:
                            <ul>
                              <li><i className="bi bi-check-circle"></i> <strong>Aprobar</strong>: Cambia el estado a "Aprobada".</li>
                              <li><i className="bi bi-x-circle"></i> <strong>Rechazar</strong>: Cambia el estado a "Rechazada".</li>
                            </ul>
                          </li>
                          <li>Si la cotización está aprobada, también verás un botón para convertirla a venta.</li>
                        </ol>

                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Una vez que cambias el estado de una cotización a "Aprobada", "Rechazada" o "Convertida", ya no podrás editarla.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Convertir a Venta */}
                  <div className="accordion-item">
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${activeItem === 'convertToSale' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => toggleItem('convertToSale')}
                      >
                        <i className="bi bi-cart-check me-2" style={{ color: '#099347' }}></i>
                        ¿Cómo convertir una cotización a venta?
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${activeItem === 'convertToSale' ? 'show' : ''}`}>
                      <div className="accordion-body">
                        <p>Para convertir una cotización aprobada en una venta:</p>
                        <ol>
                          <li>Navega a la vista detallada de la cotización.</li>
                          <li>Si la cotización está en estado "Aprobada", verás un botón <strong>Convertir a Venta</strong>.</li>
                          <li>Haz clic en este botón y se abrirá un modal donde deberás especificar:
                            <ul>
                              <li>Tipo de documento (Factura o Boleta)</li>
                              <li>Número de documento</li>
                            </ul>
                          </li>
                          <li>Completa la información y haz clic en <strong>Convertir</strong>.</li>
                          <li>La cotización cambiará al estado "Convertida" y se creará una venta asociada.</li>
                        </ol>
                        <div className="alert alert-warning">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          <strong>Importante:</strong> Una vez convertida a venta, la cotización no puede editarse ni eliminarse.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Productos */}
          <div className="accordion-item border mb-3 shadow-sm">
            <h2 className="accordion-header">
              <button
                className={`accordion-button ${activeSection === 'products' ? '' : 'collapsed'}`}
                type="button"
                onClick={() => toggleSection('products')}
                style={{ backgroundColor: activeSection === 'products' ? '#f8f9fa' : 'white' }}
              >
                <i className="bi bi-box-seam me-2" style={{ color: '#099347' }}></i>
                <strong>Gestión de Productos</strong>
              </button>
            </h2>
            <div className={`accordion-collapse collapse ${activeSection === 'products' ? 'show' : ''}`}>
              <div className="accordion-body">
                <div className="accordion" id="productsAccordion">

                  {/* Agregar Producto */}
                  <div className="accordion-item mb-2">
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${activeItem === 'addProduct' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => toggleItem('addProduct')}
                      >
                        <i className="bi bi-plus-circle me-2" style={{ color: '#099347' }}></i>
                        ¿Cómo agregar un nuevo producto?
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${activeItem === 'addProduct' ? 'show' : ''}`}>
                      <div className="accordion-body">
                        <p>Para agregar un nuevo producto al catálogo:</p>
                        <ol>
                          <li>Navega a la sección <strong>Productos</strong> desde el menú lateral.</li>
                          <li>Haz clic en el botón <strong>Nuevo Producto</strong>.</li>
                          <li>Completa el formulario con la información del producto:
                            <ul>
                              <li>Nombre y descripción del producto</li>
                              <li>Precio neto (sin IVA)</li>
                              <li>Stock actual y stock mínimo</li>
                              <li>Categoría y otras propiedades según corresponda</li>
                            </ul>
                          </li>
                          <li>Haz clic en <strong>Crear</strong> para guardar el producto.</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Editar Producto */}
                  <div className="accordion-item mb-2">
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${activeItem === 'editProduct' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => toggleItem('editProduct')}
                      >
                        <i className="bi bi-pencil me-2" style={{ color: '#099347' }}></i>
                        ¿Cómo editar un producto existente?
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${activeItem === 'editProduct' ? 'show' : ''}`}>
                      <div className="accordion-body">
                        <p>Para modificar la información de un producto:</p>
                        <ol>
                          <li>Navega a la sección <strong>Productos</strong> desde el menú lateral.</li>
                          <li>Localiza el producto que deseas editar en la tabla.</li>
                          <li>Haz clic en el botón <i className="bi bi-pencil"></i> (editar) en la columna de acciones.</li>
                          <li>Actualiza la información necesaria en el formulario que aparece.</li>
                          <li>Haz clic en <strong>Guardar cambios</strong> para actualizar los datos.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Consejos Generales */}
          <div className="accordion-item border mb-3 shadow-sm">
            <h2 className="accordion-header">
              <button
                className={`accordion-button ${activeSection === 'tips' ? '' : 'collapsed'}`}
                type="button"
                onClick={() => toggleSection('tips')}
                style={{ backgroundColor: activeSection === 'tips' ? '#f8f9fa' : 'white' }}
              >
                <i className="bi bi-lightbulb me-2" style={{ color: '#099347' }}></i>
                <strong>Consejos y Trucos</strong>
              </button>
            </h2>
            <div className={`accordion-collapse collapse ${activeSection === 'tips' ? 'show' : ''}`}>
              <div className="accordion-body">
                <div className="mb-4">
                  <h5><i className="bi bi-search me-2" style={{ color: '#099347' }}></i>Búsqueda y Filtrado</h5>
                  <p>En todas las tablas principales puedes:</p>
                  <ul>
                    <li>Ordenar los datos haciendo clic en los encabezados de las columnas.</li>
                    <li>Utilizar el campo de búsqueda para filtrar por cualquier texto visible en la tabla.</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5><i className="bi bi-keyboard me-2" style={{ color: '#099347' }}></i>Atajos de Teclado</h5>
                  <p>Para una navegación más eficiente:</p>
                  <ul>
                    <li><strong>Tab</strong>: Navegar entre campos de formularios.</li>
                    <li><strong>Enter</strong>: En los campos de búsqueda, inicia la búsqueda inmediatamente.</li>
                    <li><strong>Esc</strong>: Cierra modales abiertos.</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5><i className="bi bi-shield-check me-2" style={{ color: '#099347' }}></i>Validación de Datos</h5>
                  <p>El sistema valida automáticamente:</p>
                  <ul>
                    <li>RUT chileno (usando algoritmo de validación)</li>
                    <li>Formatos de email válidos</li>
                    <li>Números de teléfono en formato chileno</li>
                    <li>Campos requeridos en todos los formularios</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5><i className="bi bi-printer me-2" style={{ color: '#099347' }}></i>Etiquetas de Impresión</h5>
                  <p>Para imprimir etiquetas de productos:</p>
                  <ul>
                    <li>Accede a la sección de <strong>Productos</strong> o <strong>Consumibles</strong>.</li>
                    <li>Busca el botón de <strong>Imprimir Etiqueta</strong> junto a cada ítem.</li>
                    <li>Selecciona la cantidad de etiquetas que necesitas.</li>
                    <li>El sistema generará un PDF optimizado para impresoras de etiquetas estándar.</li>
                    <li>Puedes imprimir directamente o guardar el PDF para uso posterior.</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5><i className="bi bi-calendar-check me-2" style={{ color: '#099347' }}></i>Buenas Prácticas</h5>
                  <p>Para aprovechar al máximo el sistema:</p>
                  <ul>
                    <li>Mantén actualizada la información de clientes y proveedores.</li>
                    <li>Revisa regularmente el stock de productos para evitar faltantes.</li>
                    <li>Actualiza los precios cuando sea necesario para mantener márgenes adecuados.</li>
                    <li>Usa las cotizaciones para ofrecer precios formales a tus clientes antes de confirmar ventas.</li>
                    <li>Exporta regularmente informes de ventas para análisis financieros.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}