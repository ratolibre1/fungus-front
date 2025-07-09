import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
export default function Calendarizacion() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
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
            }
            catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/iniciar-sesion');
                return;
            }
        }
        else {
            navigate('/iniciar-sesion');
            return;
        }
        setLoading(false);
    }, [navigate]);
    // Mostrar loading mientras verifica permisos
    if (loading) {
        return (_jsx(Layout, { children: _jsx("div", { className: "d-flex justify-content-center align-items-center", style: { minHeight: '60vh' }, children: _jsx("div", { className: "spinner-border", style: { color: '#099347' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "Cargando..." }) }) }) }));
    }
    // No mostrar nada si no es admin (ya redirigió)
    if (!user || user.role !== 'admin') {
        return null;
    }
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom", children: [_jsxs("h1", { className: "h2 font-heading", style: { color: '#099347' }, children: [_jsx("i", { className: "bi bi-calendar3 me-3" }), "Calendarizaci\u00F3n"] }), _jsx("div", { className: "badge bg-warning text-dark fs-6 px-3 py-2", children: "\uD83D\uDEA7 En Desarrollo" })] }), _jsx("div", { className: "row mb-5", children: _jsx("div", { className: "col-12", children: _jsx("div", { className: "card border-0 shadow-sm", style: { background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)' }, children: _jsxs("div", { className: "card-body p-5 text-center", children: [_jsx("div", { className: "mb-4", children: _jsx("i", { className: "bi bi-calendar-check", style: { fontSize: '4rem', color: '#099347' } }) }), _jsx("h2", { className: "card-title font-heading", style: { color: '#099347' }, children: "Sistema de Calendarizaci\u00F3n" }), _jsx("p", { className: "card-text lead text-muted mb-4", children: "Pr\u00F3ximamente podr\u00E1s gestionar cronogramas, programar tareas y coordinar actividades de producci\u00F3n de manera eficiente." }), _jsxs("div", { className: "row text-center", children: [_jsx("div", { className: "col-md-4", children: _jsxs("div", { className: "p-3", children: [_jsx("i", { className: "bi bi-calendar-event mb-2", style: { fontSize: '2rem', color: '#099347' } }), _jsx("h5", { children: "Programaci\u00F3n" }), _jsx("p", { className: "text-muted small", children: "Planifica actividades y eventos importantes" })] }) }), _jsx("div", { className: "col-md-4", children: _jsxs("div", { className: "p-3", children: [_jsx("i", { className: "bi bi-clock-history mb-2", style: { fontSize: '2rem', color: '#099347' } }), _jsx("h5", { children: "Seguimiento" }), _jsx("p", { className: "text-muted small", children: "Monitorea el progreso de tus tareas" })] }) }), _jsx("div", { className: "col-md-4", children: _jsxs("div", { className: "p-3", children: [_jsx("i", { className: "bi bi-people-fill mb-2", style: { fontSize: '2rem', color: '#099347' } }), _jsx("h5", { children: "Colaboraci\u00F3n" }), _jsx("p", { className: "text-muted small", children: "Coordina equipos y recursos" })] }) })] })] }) }) }) }), _jsxs("div", { className: "row mb-5", children: [_jsx("div", { className: "col-12", children: _jsx("h3", { className: "mb-4 font-heading", style: { color: '#099347' }, children: "Funcionalidades Planificadas" }) }), _jsx("div", { className: "col-md-6 mb-4", children: _jsx("div", { className: "card h-100 border-0 shadow-sm", children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex align-items-center mb-3", children: [_jsx("div", { className: "rounded-circle p-2 me-3", style: { backgroundColor: '#e8f5e9' }, children: _jsx("i", { className: "bi bi-calendar-plus", style: { color: '#099347', fontSize: '1.5rem' } }) }), _jsx("h5", { className: "card-title mb-0", children: "Calendario Interactivo" })] }), _jsx("p", { className: "card-text text-muted", children: "Vista de calendario completa con drag & drop para gestionar eventos, citas y tareas de producci\u00F3n de hongos." })] }) }) }), _jsx("div", { className: "col-md-6 mb-4", children: _jsx("div", { className: "card h-100 border-0 shadow-sm", children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex align-items-center mb-3", children: [_jsx("div", { className: "rounded-circle p-2 me-3", style: { backgroundColor: '#e8f5e9' }, children: _jsx("i", { className: "bi bi-bell", style: { color: '#099347', fontSize: '1.5rem' } }) }), _jsx("h5", { className: "card-title mb-0", children: "Notificaciones" })] }), _jsx("p", { className: "card-text text-muted", children: "Recordatorios autom\u00E1ticos para tareas cr\u00EDticas como riego, cosecha y mantenimiento de cultivos." })] }) }) }), _jsx("div", { className: "col-md-6 mb-4", children: _jsx("div", { className: "card h-100 border-0 shadow-sm", children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex align-items-center mb-3", children: [_jsx("div", { className: "rounded-circle p-2 me-3", style: { backgroundColor: '#e8f5e9' }, children: _jsx("i", { className: "bi bi-graph-up", style: { color: '#099347', fontSize: '1.5rem' } }) }), _jsx("h5", { className: "card-title mb-0", children: "Reportes de Productividad" })] }), _jsx("p", { className: "card-text text-muted", children: "An\u00E1lisis de tiempo y recursos utilizados en cada etapa del proceso de producci\u00F3n." })] }) }) }), _jsx("div", { className: "col-md-6 mb-4", children: _jsx("div", { className: "card h-100 border-0 shadow-sm", children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex align-items-center mb-3", children: [_jsx("div", { className: "rounded-circle p-2 me-3", style: { backgroundColor: '#e8f5e9' }, children: _jsx("i", { className: "bi bi-share", style: { color: '#099347', fontSize: '1.5rem' } }) }), _jsx("h5", { className: "card-title mb-0", children: "Integraci\u00F3n" })] }), _jsx("p", { className: "card-text text-muted", children: "Conexi\u00F3n directa con m\u00F3dulos de ventas, compras y inventario para una gesti\u00F3n integral." })] }) }) })] }), _jsx("div", { className: "row", children: _jsx("div", { className: "col-12", children: _jsxs("div", { className: "alert alert-info d-flex align-items-center", role: "alert", children: [_jsx("i", { className: "bi bi-info-circle-fill me-3", style: { fontSize: '1.5rem' } }), _jsxs("div", { children: [_jsx("h6", { className: "alert-heading mb-1", children: "Estado del Desarrollo" }), _jsx("p", { className: "mb-0", children: "Esta funcionalidad est\u00E1 siendo desarrollada especialmente para administradores. Pronto estar\u00E1 disponible para optimizar la gesti\u00F3n de tiempo y recursos en Fungus Mycelium." })] })] }) }) })] }));
}
