import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
const Layout = ({ children }) => {
    // Estado para controlar si el sidebar está abierto en móvil
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // Estado para almacenar los datos del usuario
    const [user, setUser] = useState(null);
    useEffect(() => {
        // Recuperar datos del usuario del localStorage
        const storedUser = localStorage.getItem('fungus_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);
    // Determinar el ancho del contenido según el tamaño de pantalla
    const getContentWidth = () => {
        return window.innerWidth < 768 ? '95%' : '85%';
    };
    const [contentWidth, setContentWidth] = useState(getContentWidth());
    // Actualizar el ancho cuando cambia el tamaño de la ventana
    useEffect(() => {
        const handleResize = () => {
            setContentWidth(getContentWidth());
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    // Determinar si estamos en modo móvil basado en ancho y orientación
    const isMobileView = () => {
        // En pantallas pequeñas o en modo landscape en tablets pequeñas (ancho < 992px)
        return window.innerWidth < 992;
    };
    // Cerrar el sidebar al cambiar a pantalla grande
    useEffect(() => {
        const handleResize = () => {
            if (!isMobileView()) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    return (_jsx("div", { style: { backgroundColor: '#f5f8f5', minHeight: '100vh' }, children: _jsx("div", { className: "container-fluid", children: _jsxs("div", { className: "row", children: [_jsx(Sidebar, { user: user, isOpen: sidebarOpen, onClose: () => setSidebarOpen(false) }), _jsxs("main", { className: isMobileView() ? "col-12" : "col-md-9 ms-sm-auto col-lg-10", children: [isMobileView() && (_jsx("div", { className: "bg-white py-2 px-3 shadow-sm sticky-top", children: _jsxs("div", { className: "d-flex justify-content-between align-items-center", children: [_jsx("button", { className: "btn btn-sm", style: { color: '#099347' }, onClick: () => setSidebarOpen(true), children: _jsx("i", { className: "bi bi-list fs-4" }) }), _jsx("h5", { className: "mb-0 font-appname", style: { color: '#099347' }, children: "Fungus Mycelium" }), _jsx("div", { style: { width: '20px' } }), " "] }) })), _jsx("div", { className: "main-content mx-auto py-4", style: { maxWidth: '1200px', width: contentWidth }, children: children })] })] }) }) }));
};
export default Layout;
