import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function Calendarizacion() {
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
          <i className="bi bi-calendar3 me-3"></i>
          Calendarización
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
                <i className="bi bi-calendar-check" style={{ fontSize: '4rem', color: '#099347' }}></i>
              </div>
              <h2 className="card-title font-heading" style={{ color: '#099347' }}>
                Sistema de Calendarización
              </h2>
              <p className="card-text lead text-muted mb-4">
                Próximamente podrás gestionar cronogramas, programar tareas y coordinar actividades de producción de manera eficiente.
              </p>
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="p-3">
                    <i className="bi bi-calendar-event mb-2" style={{ fontSize: '2rem', color: '#099347' }}></i>
                    <h5>Programación</h5>
                    <p className="text-muted small">Planifica actividades y eventos importantes</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3">
                    <i className="bi bi-clock-history mb-2" style={{ fontSize: '2rem', color: '#099347' }}></i>
                    <h5>Seguimiento</h5>
                    <p className="text-muted small">Monitorea el progreso de tus tareas</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3">
                    <i className="bi bi-people-fill mb-2" style={{ fontSize: '2rem', color: '#099347' }}></i>
                    <h5>Colaboración</h5>
                    <p className="text-muted small">Coordina equipos y recursos</p>
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
                  <i className="bi bi-calendar-plus" style={{ color: '#099347', fontSize: '1.5rem' }}></i>
                </div>
                <h5 className="card-title mb-0">Calendario Interactivo</h5>
              </div>
              <p className="card-text text-muted">
                Vista de calendario completa con drag & drop para gestionar eventos, citas y tareas de producción de hongos.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#e8f5e9' }}>
                  <i className="bi bi-bell" style={{ color: '#099347', fontSize: '1.5rem' }}></i>
                </div>
                <h5 className="card-title mb-0">Notificaciones</h5>
              </div>
              <p className="card-text text-muted">
                Recordatorios automáticos para tareas críticas como riego, cosecha y mantenimiento de cultivos.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#e8f5e9' }}>
                  <i className="bi bi-graph-up" style={{ color: '#099347', fontSize: '1.5rem' }}></i>
                </div>
                <h5 className="card-title mb-0">Reportes de Productividad</h5>
              </div>
              <p className="card-text text-muted">
                Análisis de tiempo y recursos utilizados en cada etapa del proceso de producción.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#e8f5e9' }}>
                  <i className="bi bi-share" style={{ color: '#099347', fontSize: '1.5rem' }}></i>
                </div>
                <h5 className="card-title mb-0">Integración</h5>
              </div>
              <p className="card-text text-muted">
                Conexión directa con módulos de ventas, compras y inventario para una gestión integral.
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
                Pronto estará disponible para optimizar la gestión de tiempo y recursos en Fungus Mycelium.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 