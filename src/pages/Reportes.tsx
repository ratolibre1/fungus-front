import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function Reportes() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del usuario y verificar permisos
  useEffect(() => {
    const userData = localStorage.getItem('fungus_user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Verificar si el usuario es admin
        if (parsedUser.role !== 'admin') {
          // Redirigir a dashboard si no es admin
          navigate('/panel');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/iniciar-sesion');
        return;
      }
    } else {
      navigate('/iniciar-sesion');
      return;
    }
    setLoading(false);
  }, [navigate]);

  // Mostrar loading mientras verifica permisos
  if (loading) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="spinner-border" style={{ color: '#099347' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // No mostrar nada si no es admin (ya redirigió)
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <h1 className="h2 font-heading" style={{ color: '#099347' }}>
          <i className="bi bi-graph-up me-3"></i>
          Reportes
        </h1>
        <div className="badge bg-warning text-dark fs-6 px-3 py-2">
          🚧 En Desarrollo
        </div>
      </div>

      {/* Hero Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)' }}>
            <div className="card-body p-5 text-center">
              <div className="mb-4">
                <i className="bi bi-bar-chart-line" style={{ fontSize: '4rem', color: '#099347' }}></i>
              </div>
              <h2 className="card-title font-heading" style={{ color: '#099347' }}>
                Sistema de Reportes
              </h2>
              <p className="card-text lead text-muted mb-4">
                Próximamente podrás generar reportes detallados, analizar métricas de negocio y obtener insights valiosos para la toma de decisiones.
              </p>
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="p-3">
                    <i className="bi bi-graph-up-arrow mb-2" style={{ fontSize: '2rem', color: '#099347' }}></i>
                    <h5>Análisis</h5>
                    <p className="text-muted small">Métricas detalladas de ventas y producción</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3">
                    <i className="bi bi-file-earmark-bar-graph mb-2" style={{ fontSize: '2rem', color: '#099347' }}></i>
                    <h5>Reportes</h5>
                    <p className="text-muted small">Documentos ejecutivos y operacionales</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3">
                    <i className="bi bi-pie-chart-fill mb-2" style={{ fontSize: '2rem', color: '#099347' }}></i>
                    <h5>Visualización</h5>
                    <p className="text-muted small">Gráficos interactivos y dashboards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="row mb-5">
        <div className="col-12">
          <h3 className="mb-4 font-heading" style={{ color: '#099347' }}>
            Funcionalidades Planificadas
          </h3>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#e8f5e9' }}>
                  <i className="bi bi-clipboard-data" style={{ color: '#099347', fontSize: '1.5rem' }}></i>
                </div>
                <h5 className="card-title mb-0">Reportes de Ventas</h5>
              </div>
              <p className="card-text text-muted">
                Análisis completo de ventas por período, cliente, producto y región con comparativas históricas.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#e8f5e9' }}>
                  <i className="bi bi-boxes" style={{ color: '#099347', fontSize: '1.5rem' }}></i>
                </div>
                <h5 className="card-title mb-0">Control de Inventario</h5>
              </div>
              <p className="card-text text-muted">
                Reportes de stock, rotación de productos, alertas de reposición y análisis de demanda.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#e8f5e9' }}>
                  <i className="bi bi-currency-dollar" style={{ color: '#099347', fontSize: '1.5rem' }}></i>
                </div>
                <h5 className="card-title mb-0">Análisis Financiero</h5>
              </div>
              <p className="card-text text-muted">
                Estados de resultados, flujo de caja, rentabilidad por producto y análisis de costos.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#e8f5e9' }}>
                  <i className="bi bi-download" style={{ color: '#099347', fontSize: '1.5rem' }}></i>
                </div>
                <h5 className="card-title mb-0">Exportación</h5>
              </div>
              <p className="card-text text-muted">
                Descarga de reportes en múltiples formatos: PDF, Excel, CSV para análisis externos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update */}
      <div className="row">
        <div className="col-12">
          <div className="alert alert-info d-flex align-items-center" role="alert">
            <i className="bi bi-info-circle-fill me-3" style={{ fontSize: '1.5rem' }}></i>
            <div>
              <h6 className="alert-heading mb-1">Estado del Desarrollo</h6>
              <p className="mb-0">
                Esta funcionalidad está siendo desarrollada especialmente para administradores.
                Pronto estará disponible para generar insights valiosos y optimizar la gestión en Fungus Mycelium.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 