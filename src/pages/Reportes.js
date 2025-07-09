import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
export default function Reportes() {
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
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom", children: [_jsxs("h1", { className: "h2 font-heading", style: { color: '#099347' }, children: [_jsx("i", { className: "bi bi-graph-up me-3" }), "Reportes"] }), _jsx("div", { className: "badge bg-warning text-dark fs-6 px-3 py-2", children: "\uD83D\uDEA7 En Desarrollo" })] }), _jsx("div", { className: "row mb-5", children: _jsx("div", { className: "col-12", children: _jsx("div", { className: "card border-0 shadow-sm", style: { background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)' }, children: _jsxs("div", { className: "card-body p-5 text-center", children: [_jsx("div", { className: "mb-4", children: _jsx("i", { className: "bi bi-bar-chart-line", style: { fontSize: '4rem', color: '#099347' } }) }), _jsx("h2", { className: "card-title font-heading", style: { color: '#099347' }, children: "Sistema de Reportes" }), _jsx("p", { className: "card-text lead text-muted mb-4", children: "Pr\u00F3ximamente podr\u00E1s generar reportes detallados, analizar m\u00E9tricas de negocio y obtener insights valiosos para la toma de decisiones." }), _jsxs("div", { className: "row text-center", children: [_jsx("div", { className: "col-md-4", children: _jsxs("div", { className: "p-3", children: [_jsx("i", { className: "bi bi-graph-up-arrow mb-2", style: { fontSize: '2rem', color: '#099347' } }), _jsx("h5", { children: "An\u00E1lisis" }), _jsx("p", { className: "text-muted small", children: "M\u00E9tricas detalladas de ventas y producci\u00F3n" })] }) }), _jsx("div", { className: "col-md-4", children: _jsxs("div", { className: "p-3", children: [_jsx("i", { className: "bi bi-file-earmark-bar-graph mb-2", style: { fontSize: '2rem', color: '#099347' } }), _jsx("h5", { children: "Reportes" }), _jsx("p", { className: "text-muted small", children: "Documentos ejecutivos y operacionales" })] }) }), _jsx("div", { className: "col-md-4", children: _jsxs("div", { className: "p-3", children: [_jsx("i", { className: "bi bi-pie-chart-fill mb-2", style: { fontSize: '2rem', color: '#099347' } }), _jsx("h5", { children: "Visualizaci\u00F3n" }), _jsx("p", { className: "text-muted small", children: "Gr\u00E1ficos interactivos y dashboards" })] }) })] })] }) }) }) }), _jsxs("div", { className: "row mb-5", children: [_jsx("div", { className: "col-12", children: _jsx("h3", { className: "mb-4 font-heading", style: { color: '#099347' }, children: "Funcionalidades Planificadas" }) }), _jsx("div", { className: "col-md-6 mb-4", children: _jsx("div", { className: "card h-100 border-0 shadow-sm", children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex align-items-center mb-3", children: [_jsx("div", { className: "rounded-circle p-2 me-3", style: { backgroundColor: '#e8f5e9' }, children: _jsx("i", { className: "bi bi-clipboard-data", style: { color: '#099347', fontSize: '1.5rem' } }) }), _jsx("h5", { className: "card-title mb-0", children: "Reportes de Ventas" })] }), _jsx("p", { className: "card-text text-muted", children: "An\u00E1lisis completo de ventas por per\u00EDodo, cliente, producto y regi\u00F3n con comparativas hist\u00F3ricas." })] }) }) }), _jsx("div", { className: "col-md-6 mb-4", children: _jsx("div", { className: "card h-100 border-0 shadow-sm", children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex align-items-center mb-3", children: [_jsx("div", { className: "rounded-circle p-2 me-3", style: { backgroundColor: '#e8f5e9' }, children: _jsx("i", { className: "bi bi-boxes", style: { color: '#099347', fontSize: '1.5rem' } }) }), _jsx("h5", { className: "card-title mb-0", children: "Control de Inventario" })] }), _jsx("p", { className: "card-text text-muted", children: "Reportes de stock, rotaci\u00F3n de productos, alertas de reposici\u00F3n y an\u00E1lisis de demanda." })] }) }) }), _jsx("div", { className: "col-md-6 mb-4", children: _jsx("div", { className: "card h-100 border-0 shadow-sm", children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex align-items-center mb-3", children: [_jsx("div", { className: "rounded-circle p-2 me-3", style: { backgroundColor: '#e8f5e9' }, children: _jsx("i", { className: "bi bi-currency-dollar", style: { color: '#099347', fontSize: '1.5rem' } }) }), _jsx("h5", { className: "card-title mb-0", children: "An\u00E1lisis Financiero" })] }), _jsx("p", { className: "card-text text-muted", children: "Estados de resultados, flujo de caja, rentabilidad por producto y an\u00E1lisis de costos." })] }) }) }), _jsx("div", { className: "col-md-6 mb-4", children: _jsx("div", { className: "card h-100 border-0 shadow-sm", children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex align-items-center mb-3", children: [_jsx("div", { className: "rounded-circle p-2 me-3", style: { backgroundColor: '#e8f5e9' }, children: _jsx("i", { className: "bi bi-download", style: { color: '#099347', fontSize: '1.5rem' } }) }), _jsx("h5", { className: "card-title mb-0", children: "Exportaci\u00F3n" })] }), _jsx("p", { className: "card-text text-muted", children: "Descarga de reportes en m\u00FAltiples formatos: PDF, Excel, CSV para an\u00E1lisis externos." })] }) }) })] }), _jsx("div", { className: "row", children: _jsx("div", { className: "col-12", children: _jsxs("div", { className: "alert alert-info d-flex align-items-center", role: "alert", children: [_jsx("i", { className: "bi bi-info-circle-fill me-3", style: { fontSize: '1.5rem' } }), _jsxs("div", { children: [_jsx("h6", { className: "alert-heading mb-1", children: "Estado del Desarrollo" }), _jsx("p", { className: "mb-0", children: "Esta funcionalidad est\u00E1 siendo desarrollada especialmente para administradores. Pronto estar\u00E1 disponible para generar insights valiosos y optimizar la gesti\u00F3n en Fungus Mycelium." })] })] }) }) })] }));
}
