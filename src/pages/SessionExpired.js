import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import logoGreen from '../assets/images/logo-green.png';
export default function SessionExpired() {
    const [countdown, setCountdown] = useState(5);
    const [redirect, setRedirect] = useState(false);
    // Limpiar el almacenamiento local al entrar a esta página
    useEffect(() => {
        localStorage.removeItem('fungus_token');
        localStorage.removeItem('fungus_user');
        // Iniciar la cuenta regresiva
        const timer = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown <= 1) {
                    clearInterval(timer);
                    setRedirect(true);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    if (redirect) {
        return _jsx(Navigate, { to: "/iniciar-sesion", replace: true });
    }
    return (_jsx("div", { className: "min-vh-100 d-flex align-items-center justify-content-center", style: { backgroundColor: '#f8f9fa' }, children: _jsx("div", { className: "container", children: _jsx("div", { className: "row justify-content-center", children: _jsx("div", { className: "col-md-6", children: _jsxs("div", { className: "card shadow-sm p-4 text-center", children: [_jsxs("div", { className: "mb-4", children: [_jsx("img", { src: logoGreen, alt: "Fungus Mycelium Logo", className: "img-fluid mb-3", style: { maxWidth: '150px' } }), _jsx("h1", { className: "fs-2 text-center font-appname", style: { color: '#099347' }, children: "Fungus Mycelium" })] }), _jsxs("div", { className: "card-body", children: [_jsxs("h2", { className: "fs-4 mb-3", style: { color: '#dc3545' }, children: [_jsx("i", { className: "bi bi-exclamation-triangle-fill me-2" }), "Sesi\u00F3n expirada"] }), _jsx("p", { children: "Tu sesi\u00F3n ha expirado por motivos de seguridad. Por favor, inicia sesi\u00F3n nuevamente para continuar." }), _jsxs("p", { className: "fs-5 mt-4", children: ["Ser\u00E1s redirigido en ", _jsx("span", { className: "badge bg-secondary", children: countdown }), " ", countdown === 1 ? 'segundo' : 'segundos', "..."] }), _jsxs("div", { className: "mt-3", children: [_jsx("div", { className: "spinner-border spinner-border-sm text-primary me-2", role: "status", children: _jsx("span", { className: "visually-hidden", children: "Redirigiendo..." }) }), _jsx("span", { className: "text-muted", children: "Redirigiendo al login" })] })] })] }) }) }) }) }));
}
