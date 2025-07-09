import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Consumables from './pages/Consumables';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Suppliers from './pages/Suppliers';
import SupplierDetail from './pages/SupplierDetail';
import Quotations from './pages/Quotations';
import SalesPage from './pages/SalesPage';
import PurchasesPage from './pages/PurchasesPage';
import Help from './pages/Help';
import Logs from './pages/Logs';
import Calendarizacion from './pages/Calendarizacion';
import Reportes from './pages/Reportes';
import NotFound from './pages/NotFound';
import SessionExpired from './pages/SessionExpired';
import ForcePasswordChange from './pages/ForcePasswordChange';
import RoleBasedRoute from './components/common/RoleBasedRoute';
// Componente para rutas protegidas que requieren autenticación
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('fungus_token') !== null;
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/iniciar-sesion", replace: true });
    }
    return _jsx(_Fragment, { children: children });
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
        return (_jsx("div", { className: "d-flex justify-content-center align-items-center", style: { height: '100vh' }, children: _jsx("div", { className: "spinner-border", style: { color: '#099347' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "Cargando..." }) }) }));
    }
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/iniciar-sesion", element: _jsx(Login, {}) }), _jsx(Route, { path: "/sesion-expirada", element: _jsx(SessionExpired, {}) }), _jsx(Route, { path: "/cambiar-contrasena-obligatorio", element: _jsx(ForcePasswordChange, {}) }), _jsx(Route, { path: "/panel", element: _jsx(ProtectedRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/productos", element: _jsx(ProtectedRoute, { children: _jsx(Products, {}) }) }), _jsx(Route, { path: "/insumos", element: _jsx(ProtectedRoute, { children: _jsx(Consumables, {}) }) }), _jsx(Route, { path: "/compradores", element: _jsx(ProtectedRoute, { children: _jsx(Clients, {}) }) }), _jsx(Route, { path: "/comprador/:id", element: _jsx(ProtectedRoute, { children: _jsx(ClientDetail, {}) }) }), _jsx(Route, { path: "/proveedores", element: _jsx(ProtectedRoute, { children: _jsx(Suppliers, {}) }) }), _jsx(Route, { path: "/proveedor/:id", element: _jsx(ProtectedRoute, { children: _jsx(SupplierDetail, {}) }) }), _jsx(Route, { path: "/compras", element: _jsx(ProtectedRoute, { children: _jsx(PurchasesPage, {}) }) }), _jsx(Route, { path: "/ventas", element: _jsx(ProtectedRoute, { children: _jsx(SalesPage, {}) }) }), _jsx(Route, { path: "/cotizaciones", element: _jsx(ProtectedRoute, { children: _jsx(Quotations, {}) }) }), _jsx(Route, { path: "/ayuda", element: _jsx(ProtectedRoute, { children: _jsx(Help, {}) }) }), _jsx(Route, { path: "/registros", element: _jsx(ProtectedRoute, { children: _jsx(RoleBasedRoute, { allowedRoles: ['admin'], children: _jsx(Logs, {}) }) }) }), _jsx(Route, { path: "/calendarizacion", element: _jsx(ProtectedRoute, { children: _jsx(RoleBasedRoute, { allowedRoles: ['admin'], children: _jsx(Calendarizacion, {}) }) }) }), _jsx(Route, { path: "/reportes", element: _jsx(ProtectedRoute, { children: _jsx(RoleBasedRoute, { allowedRoles: ['admin'], children: _jsx(Reportes, {}) }) }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/panel", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) }));
}
export default App;
