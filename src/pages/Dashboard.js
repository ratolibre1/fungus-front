import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    // Cargar datos del usuario desde localStorage
    useEffect(() => {
        const userData = localStorage.getItem('fungus_user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            }
            catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);
    // Verificar si el usuario es admin
    const isAdmin = user?.role === 'admin';
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
        },
        {
            title: 'Calendarización',
            icon: '📅',
            description: 'Programación y gestión de cronogramas',
            bgColor: '#e8f5e9', // Verde muy claro
            path: isAdmin ? '/calendarizacion' : null,
            enabled: isAdmin,
            adminOnly: true
        },
        {
            title: 'Reportes',
            icon: '📊',
            description: 'Análisis y reportes de gestión',
            bgColor: '#e8f5e9', // Verde muy claro
            path: isAdmin ? '/reportes' : null,
            enabled: isAdmin,
            adminOnly: true
        }
    ];
    // Función para navegar a la página del módulo
    const navigateToModule = (path) => {
        if (path) {
            navigate(path);
        }
    };
    return (_jsxs(Layout, { children: [_jsx("div", { className: "d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom", children: _jsx("h1", { className: "h2 font-heading", style: { color: '#099347' }, children: "Panel de control" }) }), _jsx("div", { className: "row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-5", children: modules.map((module, index) => (_jsx("div", { className: "col", children: _jsxs("div", { className: "card h-100 border-0 shadow-sm", children: [_jsx("div", { className: "card-header border-0", style: { backgroundColor: module.bgColor }, children: _jsxs("h5", { className: "card-title mb-0 d-flex align-items-center", children: [_jsx("span", { className: "me-2", style: { fontSize: '2rem' }, children: module.icon }), _jsx("span", { className: "font-heading", style: { color: '#099347' }, children: module.title })] }) }), _jsxs("div", { className: "card-body", children: [_jsx("p", { className: "card-text text-muted", children: module.description }), _jsx("div", { className: "d-grid", children: _jsxs("button", { className: "btn position-relative", style: {
                                                backgroundColor: module.enabled ? '#099347' : '#6c757d',
                                                color: 'white'
                                            }, disabled: !module.enabled, onClick: () => module.path && navigateToModule(module.path), children: ["Acceder", !module.enabled && (_jsx("span", { className: "position-absolute translate-middle badge rounded-pill", style: {
                                                        backgroundColor: '#FFC107',
                                                        color: 'black',
                                                        right: '-30px',
                                                        fontSize: '0.7rem',
                                                        padding: '0.35em 0.65em'
                                                    }, children: "Pr\u00F3ximamente" }))] }) })] })] }) }, index))) }), _jsx("footer", { className: "text-center mt-5 pt-3 border-top text-muted", children: _jsx("p", { children: "\u00A9 2025 Fungus Mycelium. Todos los derechos reservados." }) })] }));
}
