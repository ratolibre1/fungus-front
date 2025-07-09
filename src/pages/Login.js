import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoGreen from '../assets/images/logo-green.png';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.success === false ? 'Credenciales inválidas' : 'Error al iniciar sesión');
            }
            // Guardar token en localStorage
            localStorage.setItem('fungus_token', data.token);
            localStorage.setItem('fungus_user', JSON.stringify(data.user));
            // Si se requiere cambio de contraseña, redirigir a esa página
            if (data.passwordChangeRequired) {
                navigate('/cambiar-contrasena-obligatorio');
            }
            else {
                // Redirigir al panel
                navigate('/panel');
            }
        }
        catch (err) {
            console.error('Error durante login:', err);
            setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-vh-100 d-flex align-items-center", style: { backgroundColor: '#f8f9fa' }, children: _jsx("div", { className: "container py-5", children: _jsx("div", { className: "row justify-content-center", children: _jsxs("div", { className: "col-12 col-md-8 col-lg-5 col-xl-4", children: [_jsxs("div", { className: "text-center mb-4", children: [_jsx("img", { src: logoGreen, alt: "Fungus Mycelium Logo", className: "img-fluid mb-3", style: { maxWidth: '180px' } }), _jsx("h1", { className: "fs-1 text-center mb-2 font-appname", style: { color: '#099347' }, children: "Fungus Mycelium" })] }), _jsx("div", { className: "card shadow-sm p-4", children: _jsxs("div", { className: "card-body", children: [_jsx("h2", { className: "text-center fs-5 mb-4 font-body", style: { color: '#6c757d' }, children: "Inicia sesi\u00F3n en tu cuenta" }), error && (_jsx("div", { className: "alert text-white", style: { backgroundColor: '#dc3545' }, role: "alert", children: error })), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: "email", className: "form-label", children: "Email" }), _jsx("input", { id: "email", name: "email", type: "email", autoComplete: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "form-control", placeholder: "tu.email@ejemplo.com" })] }), _jsxs("div", { className: "mb-3", children: [_jsx("div", { className: "d-flex justify-content-between align-items-center mb-1", children: _jsx("label", { htmlFor: "password", className: "form-label mb-0", children: "Contrase\u00F1a" }) }), _jsx("input", { id: "password", name: "password", type: "password", autoComplete: "current-password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "form-control", placeholder: "Ingresa tu contrase\u00F1a" })] }), _jsx("div", { className: "d-grid gap-2 mt-4", children: _jsx("button", { type: "submit", className: "btn", style: { backgroundColor: '#099347', color: 'white' }, disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), "Cargando..."] })) : ('Iniciar sesión') }) })] })] }) })] }) }) }) }));
}
