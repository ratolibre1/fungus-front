import { useState, useEffect, ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Consumables from './pages/Consumables'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Suppliers from './pages/Suppliers'
import SupplierDetail from './pages/SupplierDetail'
import Quotations from './pages/Quotations'
import SalesPage from './pages/SalesPage'
import PurchasesPage from './pages/PurchasesPage'
import Help from './pages/Help'
import Logs from './pages/Logs'
import NotFound from './pages/NotFound'
import SessionExpired from './pages/SessionExpired'
import ForcePasswordChange from './pages/ForcePasswordChange'
import RoleBasedRoute from './components/common/RoleBasedRoute'

// Componente para rutas protegidas que requieren autenticación
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = localStorage.getItem('fungus_token') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulamos una carga inicial para verificar autenticación
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" style={{ color: '#099347' }} role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/iniciar-sesion" element={<Login />} />
        <Route path="/sesion-expirada" element={<SessionExpired />} />
        <Route path="/cambiar-contrasena-obligatorio" element={<ForcePasswordChange />} />
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insumos"
          element={
            <ProtectedRoute>
              <Consumables />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compradores"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comprador/:id"
          element={
            <ProtectedRoute>
              <ClientDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proveedores"
          element={
            <ProtectedRoute>
              <Suppliers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proveedor/:id"
          element={
            <ProtectedRoute>
              <SupplierDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compras"
          element={
            <ProtectedRoute>
              <PurchasesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ventas"
          element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cotizaciones"
          element={
            <ProtectedRoute>
              <Quotations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ayuda"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />
        <Route
          path="/registros"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <Logs />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/panel" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
