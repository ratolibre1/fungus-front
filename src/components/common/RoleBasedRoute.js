import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
/**
 * Componente que restringe el acceso a rutas según el rol del usuario
 * Si el usuario no tiene uno de los roles permitidos, es redirigido al panel principal
 */
export default function RoleBasedRoute({ children, allowedRoles }) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    useEffect(() => {
        // Verificar si el usuario está autenticado
        const token = localStorage.getItem('fungus_token');
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        // Obtener datos del usuario desde localStorage
        try {
            const userJson = localStorage.getItem('fungus_user');
            if (!userJson) {
                setIsAuthorized(false);
                return;
            }
            const user = JSON.parse(userJson);
            // Verificar si el usuario tiene un rol permitido
            const hasAllowedRole = user.role && allowedRoles.includes(user.role);
            setIsAuthorized(hasAllowedRole);
        }
        catch (error) {
            console.error('Error al verificar permisos de usuario:', error);
            setIsAuthorized(false);
        }
    }, [allowedRoles]);
    // Mientras verifica, mostrar un loader
    if (isAuthorized === null) {
        return (_jsx("div", { className: "d-flex justify-content-center align-items-center", style: { height: '100vh' }, children: _jsx("div", { className: "spinner-border", style: { color: '#099347' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "Verificando permisos..." }) }) }));
    }
    // Si no está autorizado, redirigir al panel
    if (!isAuthorized) {
        return _jsx(Navigate, { to: "/panel", replace: true });
    }
    // Si está autorizado, renderizar los hijos
    return _jsx(_Fragment, { children: children });
}
