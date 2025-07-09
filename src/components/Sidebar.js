import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../assets/images/logo.png';
import { Z_INDEX } from '../utils/constants';
const Sidebar = ({ user, isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const handleLogout = () => {
        localStorage.removeItem('fungus_token');
        localStorage.removeItem('fungus_user');
        navigate('/iniciar-sesion');
    };
    // Función para determinar si un enlace está activo
    const isActive = (path) => {
        // Comparación exacta para la ruta principal
        if (path === '/panel' && location.pathname === '/panel') {
            return true;
        }
        // Casos especiales para compradores y proveedores
        if (path === '/compradores') {
            return location.pathname === '/compradores' || location.pathname.startsWith('/comprador/');
        }
        if (path === '/proveedores') {
            return location.pathname === '/proveedores' || location.pathname.startsWith('/proveedor/');
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
    const getLinkClasses = (path) => {
        return `nav-link d-flex align-items-center text-white ${isActive(path)
            ? 'fw-bold'
            : ''}`;
    };
    // Estilo inline para el elemento activo
    const getItemStyle = (path) => {
        return isActive(path)
            ? { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', padding: '0.5rem 0.75rem' }
            : { padding: '0.5rem 0.75rem' };
    };
    // Comprobar si el usuario es administrador
    const isAdmin = user?.role === 'admin';
    const isBoss = user?.role === 'boss';
    const isUser = user?.role === 'user';
    return (_jsx("div", { className: sidebarClasses, style: { minHeight: '100vh', backgroundColor: '#055C2A', zIndex: Z_INDEX.SIDEBAR }, children: _jsx("div", { className: "position-sticky pt-3", children: _jsxs("div", { className: "px-3 py-4 text-white", children: [_jsxs("div", { className: "text-center mb-3", children: [_jsx("div", { className: "mb-3 d-flex justify-content-center", children: _jsx("img", { src: logoImage, alt: "Fungus Mycelium Logo", className: "img-fluid bg-none", style: { width: '120px', height: '120px', objectFit: 'contain' } }) }), _jsx("h5", { children: user?.name || 'Usuario' }), _jsx("p", { className: "small opacity-75", children: user?.email }), isAdmin && (_jsx("span", { className: "badge bg-danger text-dark", children: "Administrador" })), isBoss && (_jsx("span", { className: "badge bg-warning text-dark", children: "Jefe" })), isUser && (_jsx("span", { className: "badge bg-success text-dark", children: "Usuario" }))] }), _jsx("hr", { className: "border-white opacity-25" }), _jsx("nav", { className: "mt-4", children: _jsxs("ul", { className: "nav flex-column", children: [_jsx("li", { className: "nav-item", children: _jsxs("a", { className: getLinkClasses('/panel'), style: getItemStyle('/panel'), href: "#", onClick: (e) => {
                                            e.preventDefault();
                                            navigate('/panel');
                                            if (onClose)
                                                onClose();
                                        }, children: [_jsx("i", { className: "bi bi-speedometer2 me-2" }), "Panel de control"] }) }), _jsx("li", { className: "nav-item", children: _jsxs("a", { className: getLinkClasses('/productos'), style: getItemStyle('/productos'), href: "#", onClick: (e) => {
                                            e.preventDefault();
                                            navigate('/productos');
                                            if (onClose)
                                                onClose();
                                        }, children: [_jsx("i", { className: "bi bi-box-seam me-2" }), "Productos"] }) }), _jsx("li", { className: "nav-item", children: _jsxs("a", { className: getLinkClasses('/insumos'), style: getItemStyle('/insumos'), href: "#", onClick: (e) => {
                                            e.preventDefault();
                                            navigate('/insumos');
                                            if (onClose)
                                                onClose();
                                        }, children: [_jsx("i", { className: "bi bi-tools me-2" }), "Insumos"] }) }), _jsx("li", { className: "nav-item", children: _jsxs("a", { className: getLinkClasses('/compradores'), style: getItemStyle('/compradores'), href: "#", onClick: (e) => {
                                            e.preventDefault();
                                            navigate('/compradores');
                                            if (onClose)
                                                onClose();
                                        }, children: [_jsx("i", { className: "bi bi-people me-2" }), "Compradores"] }) }), _jsx("li", { className: "nav-item", children: _jsxs("a", { className: getLinkClasses('/proveedores'), style: getItemStyle('/proveedores'), href: "#", onClick: (e) => {
                                            e.preventDefault();
                                            navigate('/proveedores');
                                            if (onClose)
                                                onClose();
                                        }, children: [_jsx("i", { className: "bi bi-truck me-2" }), "Proveedores"] }) }), _jsx("li", { className: "nav-item", children: _jsxs("a", { className: getLinkClasses('/cotizaciones'), style: getItemStyle('/cotizaciones'), href: "#", onClick: (e) => {
                                            e.preventDefault();
                                            navigate('/cotizaciones');
                                            if (onClose)
                                                onClose();
                                        }, children: [_jsx("i", { className: "bi bi-file-earmark-text me-2" }), "Cotizaciones"] }) }), _jsx("li", { className: "nav-item", children: _jsxs("a", { className: getLinkClasses('/ventas'), style: getItemStyle('/ventas'), href: "#", onClick: (e) => {
                                            e.preventDefault();
                                            navigate('/ventas');
                                            if (onClose)
                                                onClose();
                                        }, children: [_jsx("i", { className: "bi bi-cash-coin me-2" }), "Ventas"] }) }), _jsx("li", { className: "nav-item", children: _jsxs("a", { className: getLinkClasses('/compras'), style: getItemStyle('/compras'), href: "#", onClick: (e) => {
                                            e.preventDefault();
                                            navigate('/compras');
                                            if (onClose)
                                                onClose();
                                        }, children: [_jsx("i", { className: "bi bi-bag me-2" }), "Compras"] }) }), _jsx("li", { className: "nav-item", children: isAdmin ? (_jsxs("a", { className: getLinkClasses('/calendarizacion'), style: getItemStyle('/calendarizacion'), href: "#", onClick: (e) => {
                                            e.preventDefault();
                                            navigate('/calendarizacion');
                                            if (onClose)
                                                onClose();
                                        }, children: [_jsx("i", { className: "bi bi-calendar3 me-2" }), "Calendarizaci\u00F3n"] })) : (_jsxs("div", { className: "nav-link d-flex align-items-center justify-content-between text-white opacity-50", style: {
                                            padding: '0.5rem 0.75rem',
                                            cursor: 'not-allowed'
                                        }, title: "Funcionalidad disponible solo para administradores", children: [_jsxs("div", { children: [_jsx("i", { className: "bi bi-calendar3 me-2" }), "Calendarizaci\u00F3n"] }), _jsx("span", { className: "badge", style: {
                                                    backgroundColor: '#FFC107',
                                                    color: '#000',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 'bold'
                                                }, children: "Pr\u00F3ximamente" })] })) }), _jsx("li", { className: "nav-item", children: isAdmin ? (_jsxs("a", { className: getLinkClasses('/reportes'), style: getItemStyle('/reportes'), href: "#", onClick: (e) => {
                                            e.preventDefault();
                                            navigate('/reportes');
                                            if (onClose)
                                                onClose();
                                        }, children: [_jsx("i", { className: "bi bi-graph-up me-2" }), "Reportes"] })) : (_jsxs("div", { className: "nav-link d-flex align-items-center justify-content-between text-white opacity-50", style: {
                                            padding: '0.5rem 0.75rem',
                                            cursor: 'not-allowed'
                                        }, title: "Funcionalidad disponible solo para administradores", children: [_jsxs("div", { children: [_jsx("i", { className: "bi bi-graph-up me-2" }), "Reportes"] }), _jsx("span", { className: "badge", style: {
                                                    backgroundColor: '#FFC107',
                                                    color: '#000',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 'bold'
                                                }, children: "Pr\u00F3ximamente" })] })) }), isAdmin && (_jsx("li", { className: "nav-item", children: _jsxs("a", { className: getLinkClasses('/registros'), style: getItemStyle('/registros'), href: "#", onClick: (e) => {
                                            e.preventDefault();
                                            navigate('/registros');
                                            if (onClose)
                                                onClose();
                                        }, children: [_jsx("i", { className: "bi bi-journal-text me-2" }), "Registros"] }) }))] }) }), _jsxs("div", { className: "d-grid gap-2 mt-4", children: [_jsxs("a", { className: getLinkClasses('/ayuda'), style: getItemStyle('/ayuda'), href: "#", onClick: (e) => {
                                    e.preventDefault();
                                    navigate('/ayuda');
                                    if (onClose)
                                        onClose();
                                }, children: [_jsx("i", { className: "bi bi-question-circle me-2" }), "Ayuda"] }), _jsxs("button", { onClick: handleLogout, className: "btn btn-sm btn-outline-light", children: [_jsx("i", { className: "bi bi-box-arrow-right me-2" }), "Cerrar sesi\u00F3n"] })] })] }) }) }));
};
export default Sidebar;
