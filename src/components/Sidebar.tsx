import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../assets/images/logo.png';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface SidebarProps {
  user: User | null;
  isOpen: boolean; // Para controlar si el sidebar está abierto en móvil
  onClose?: () => void; // Para cerrar el sidebar en móvil
}

const Sidebar = ({ user, isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('fungus_token');
    localStorage.removeItem('fungus_user');
    navigate('/iniciar-sesion');
  };

  // Función para determinar si un enlace está activo
  const isActive = (path: string) => {
    // Comparación exacta para la ruta principal
    if (path === '/panel' && location.pathname === '/panel') {
      return true;
    }

    // Para las demás rutas, verificamos si el pathname comienza con la ruta
    // esto permite que las páginas de detalle también marquen la sección correcta
    if (path !== '/panel') {
      return location.pathname.startsWith(path);
    }

    return false;
  };

  // Clases para el sidebar en modo móvil vs desktop
  const sidebarClasses = `col-lg-2 sidebar ${isOpen ? 'd-block' : 'd-none d-lg-block'}`;

  // Clases para los enlaces de navegación
  const getLinkClasses = (path: string) => {
    return `nav-link d-flex align-items-center text-white ${isActive(path)
      ? 'fw-bold'
      : ''
      }`;
  };

  // Estilo inline para el elemento activo
  const getItemStyle = (path: string) => {
    return isActive(path)
      ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', padding: '0.5rem 0.75rem' }
      : { padding: '0.5rem 0.75rem' };
  };

  // Comprobar si el usuario es administrador
  const isAdmin = user?.role === 'admin';
  const isBoss = user?.role === 'boss';
  const isUser = user?.role === 'user';

  return (
    <div className={sidebarClasses} style={{ minHeight: '100vh', backgroundColor: '#055C2A', zIndex: 1030 }}>
      <div className="position-sticky pt-3">
        <div className="px-3 py-4 text-white">
          <div className="text-center mb-3">
            <div className="mb-3 d-flex justify-content-center">
              <img
                src={logoImage}
                alt="Fungus Mycelium Logo"
                className="img-fluid bg-none"
                style={{ width: '120px', height: '120px', objectFit: 'contain' }}
              />
            </div>
            <h5>{user?.name || 'Usuario'}</h5>
            <p className="small opacity-75">{user?.email}</p>
            {isAdmin && (
              <span className="badge bg-danger text-dark">Administrador</span>
            )}
            {isBoss && (
              <span className="badge bg-warning text-dark">Jefe</span>
            )}
            {isUser && (
              <span className="badge bg-success text-dark">Usuario</span>
            )}
          </div>
          <hr className="border-white opacity-25" />

          {/* Menú de navegación */}
          <nav className="mt-4">
            <ul className="nav flex-column">
              <li className="nav-item">
                <a
                  className={getLinkClasses('/panel')}
                  style={getItemStyle('/panel')}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/panel');
                    if (onClose) onClose();
                  }}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Panel de control
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={getLinkClasses('/productos')}
                  style={getItemStyle('/productos')}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/productos');
                    if (onClose) onClose();
                  }}
                >
                  <i className="bi bi-box-seam me-2"></i>
                  Productos
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={getLinkClasses('/insumos')}
                  style={getItemStyle('/insumos')}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/insumos');
                    if (onClose) onClose();
                  }}
                >
                  <i className="bi bi-tools me-2"></i>
                  Insumos
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={getLinkClasses('/compradores')}
                  style={getItemStyle('/compradores')}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/compradores');
                    if (onClose) onClose();
                  }}
                >
                  <i className="bi bi-people me-2"></i>
                  Compradores
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={getLinkClasses('/proveedores')}
                  style={getItemStyle('/proveedores')}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/proveedores');
                    if (onClose) onClose();
                  }}
                >
                  <i className="bi bi-truck me-2"></i>
                  Proveedores
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={isAdmin ? getLinkClasses('/cotizaciones') : `${getLinkClasses('/cotizaciones')} disabled`}
                  style={isAdmin ? getItemStyle('/cotizaciones') : { ...getItemStyle('/cotizaciones'), opacity: 0.6, cursor: 'not-allowed' }}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isAdmin) {
                      navigate('/cotizaciones');
                      if (onClose) onClose();
                    }
                  }}
                >
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Cotizaciones
                  {!isAdmin && (
                    <span
                      className="ms-2 badge"
                      style={{ backgroundColor: '#FFC107', color: 'black', fontSize: '0.7rem' }}
                    >
                      Próximamente
                    </span>
                  )}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={isAdmin ? getLinkClasses('/ventas') : `${getLinkClasses('/ventas')} disabled`}
                  style={isAdmin ? getItemStyle('/ventas') : { ...getItemStyle('/ventas'), opacity: 0.6, cursor: 'not-allowed' }}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isAdmin) {
                      navigate('/ventas');
                      if (onClose) onClose();
                    }
                  }}
                >
                  <i className="bi bi-cash-coin me-2"></i>
                  Ventas
                  {!isAdmin && (
                    <span
                      className="ms-2 badge"
                      style={{ backgroundColor: '#FFC107', color: 'black', fontSize: '0.7rem' }}
                    >
                      Próximamente
                    </span>
                  )}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={isAdmin ? getLinkClasses('/compras') : `${getLinkClasses('/compras')} disabled`}
                  style={isAdmin ? getItemStyle('/compras') : { ...getItemStyle('/compras'), opacity: 0.6, cursor: 'not-allowed' }}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isAdmin) {
                      navigate('/compras');
                      if (onClose) onClose();
                    }
                  }}
                >
                  <i className="bi bi-bag me-2"></i>
                  Compras
                  {!isAdmin && (
                    <span
                      className="ms-2 badge"
                      style={{ backgroundColor: '#FFC107', color: 'black', fontSize: '0.7rem' }}
                    >
                      Próximamente
                    </span>
                  )}
                </a>
              </li>
              {/* Opción de logs solo visible para administradores */}
              {isAdmin && (
                <li className="nav-item">
                  <a
                    className={getLinkClasses('/registros')}
                    style={getItemStyle('/registros')}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/registros');
                      if (onClose) onClose();
                    }}
                  >
                    <i className="bi bi-journal-text me-2"></i>
                    Registros
                  </a>
                </li>
              )}
              {/* Añadir más opciones de menú aquí */}
            </ul>
          </nav>

          <div className="d-grid gap-2 mt-4">
            <a
              className={getLinkClasses('/ayuda')}
              style={getItemStyle('/ayuda')}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/ayuda');
                if (onClose) onClose();
              }}
            >
              <i className="bi bi-question-circle me-2"></i>
              Ayuda
            </a>
            <button onClick={handleLogout} className="btn btn-sm btn-outline-light">
              <i className="bi bi-box-arrow-right me-2"></i>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 