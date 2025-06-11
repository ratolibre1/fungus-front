import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Dashboard() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Productos',
      icon: '🍄',
      description: 'Gestión de hongos medicinales y comestibles',
      bgColor: '#e8f5e9', // Verde muy claro
      path: '/productos',
      enabled: true
    },
    {
      title: 'Insumos',
      icon: '🧪',
      description: 'Control de insumos y materiales',
      bgColor: '#e8f5e9', // Verde muy claro
      path: '/insumos',
      enabled: true
    },
    {
      title: 'Compradores',
      icon: '👥',
      description: 'Base de datos de clientes',
      bgColor: '#e8f5e9', // Verde muy claro
      path: '/compradores',
      enabled: true
    },
    {
      title: 'Proveedores',
      icon: '🚚',
      description: 'Gestión de proveedores',
      bgColor: '#e8f5e9', // Verde muy claro
      path: '/proveedores',
      enabled: true
    },
    {
      title: 'Cotizaciones',
      icon: '📋',
      description: 'Generación y seguimiento de cotizaciones',
      bgColor: '#e8f5e9', // Verde muy claro
      path: '/cotizaciones',
      enabled: true
    },
    {
      title: 'Ventas',
      icon: '💰',
      description: 'Registro y análisis de ventas',
      bgColor: '#e8f5e9', // Verde muy claro
      path: '/ventas',
      enabled: true
    },
    {
      title: 'Compras',
      icon: '🛒',
      description: 'Registro de compras a proveedores',
      bgColor: '#e8f5e9', // Verde muy claro
      path: '/compras',
      enabled: true
    }
  ];

  // Función para navegar a la página del módulo
  const navigateToModule = (path: string | null) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <h1 className="h2 font-heading" style={{ color: '#099347' }}>Panel de control</h1>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-5">
        {modules.map((module, index) => (
          <div className="col" key={index}>
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-header border-0" style={{ backgroundColor: module.bgColor }}>
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <span className="me-2" style={{ fontSize: '2rem' }}>{module.icon}</span>
                  <span className="font-heading" style={{ color: '#099347' }}>{module.title}</span>
                </h5>
              </div>
              <div className="card-body">
                <p className="card-text text-muted">{module.description}</p>
                <div className="d-grid">
                  <button
                    className="btn position-relative"
                    style={{
                      backgroundColor: module.enabled ? '#099347' : '#6c757d',
                      color: 'white'
                    }}
                    disabled={!module.enabled}
                    onClick={() => module.path && navigateToModule(module.path)}
                  >
                    Acceder
                    {!module.enabled && (
                      <span
                        className="position-absolute translate-middle badge rounded-pill"
                        style={{
                          backgroundColor: '#FFC107',
                          color: 'black',
                          right: '-30px',
                          fontSize: '0.7rem',
                          padding: '0.35em 0.65em'
                        }}
                      >
                        Próximamente
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="text-center mt-5 pt-3 border-top text-muted">
        <p>© 2025 Fungus Mycelium. Todos los derechos reservados.</p>
      </footer>
    </Layout>
  );
} 