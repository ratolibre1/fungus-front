import { useState, ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Estado para controlar si el sidebar está abierto en móvil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Estado para almacenar los datos del usuario
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Recuperar datos del usuario del localStorage
    const storedUser = localStorage.getItem('fungus_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Determinar el ancho del contenido según el tamaño de pantalla
  const getContentWidth = () => {
    return window.innerWidth < 768 ? '95%' : '85%';
  };

  const [contentWidth, setContentWidth] = useState(getContentWidth());

  // Actualizar el ancho cuando cambia el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setContentWidth(getContentWidth());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Determinar si estamos en modo móvil basado en ancho y orientación
  const isMobileView = () => {
    // En pantallas pequeñas o en modo landscape en tablets pequeñas (ancho < 992px)
    return window.innerWidth < 992;
  };

  // Cerrar el sidebar al cambiar a pantalla grande
  useEffect(() => {
    const handleResize = () => {
      if (!isMobileView()) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#f5f8f5', minHeight: '100vh' }}>
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar - visible en desktop, hidden en móvil */}
          <Sidebar
            user={user}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main content */}
          <main className={isMobileView() ? "col-12" : "col-md-9 ms-sm-auto col-lg-10"}>
            {/* Header con botón hamburguesa (solo visible en móvil) */}
            {isMobileView() && (
              <div className="bg-white py-2 px-3 shadow-sm sticky-top">
                <div className="d-flex justify-content-between align-items-center">
                  <button
                    className="btn btn-sm"
                    style={{ color: '#099347' }}
                    onClick={() => setSidebarOpen(true)}
                  >
                    <i className="bi bi-list fs-4"></i>
                  </button>
                  <h5 className="mb-0 font-appname" style={{ color: '#099347' }}>Fungus Mycelium</h5>
                  <div style={{ width: '20px' }}></div> {/* Elemento vacío para equilibrar */}
                </div>
              </div>
            )}

            {/* Contenido principal */}
            <div className="main-content mx-auto py-4" style={{ maxWidth: '1200px', width: contentWidth }}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout; 