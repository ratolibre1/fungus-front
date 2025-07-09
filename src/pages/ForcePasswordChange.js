import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoGreen from '../assets/images/logo-green.png';
export default function ForcePasswordChange() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    // Verificar que hay un token válido, si no redirigir al login
    useEffect(() => {
        const token = localStorage.getItem('fungus_token');
        if (!token) {
            navigate('/iniciar-sesion');
        }
    }, [navigate]);
    // Validación de contraseña
    const isPasswordValid = (password) => {
        return password.length >= 6;
    };
    // Comprobar si la contraseña es válida y coincide con la confirmación
    const passwordsMatch = newPassword === confirmPassword;
    const isValidPassword = isPasswordValid(newPassword);
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validación básica
        if (!isValidPassword) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (!passwordsMatch) {
            setError('Las contraseñas no coinciden');
            return;
        }
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('fungus_token');
        if (!token) {
            setError('La sesión ha expirado. Por favor, vuelve a iniciar sesión.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al cambiar la contraseña');
            }
            // Mostrar mensaje de éxito y redirigir después de un breve retraso
            setSuccess(true);
            setTimeout(() => {
                navigate('/panel');
            }, 2000);
        }
        catch (err) {
            console.error('Error durante el cambio de contraseña:', err);
            setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-vh-100 d-flex align-items-center", style: { backgroundColor: '#f8f9fa' }, children: _jsx("div", { className: "container py-5", children: _jsx("div", { className: "row justify-content-center", children: _jsxs("div", { className: "col-12 col-md-8 col-lg-5 col-xl-4", children: [_jsxs("div", { className: "text-center mb-4", children: [_jsx("img", { src: logoGreen, alt: "Fungus Mycelium Logo", className: "img-fluid mb-3", style: { maxWidth: '180px' } }), _jsx("h1", { className: "fs-1 text-center mb-2 font-appname", style: { color: '#099347' }, children: "Fungus Mycelium" })] }), _jsx("div", { className: "card shadow-sm p-4", children: _jsxs("div", { className: "card-body", children: [_jsx("h2", { className: "text-center fs-5 mb-2 font-body", style: { color: '#6c757d' }, children: "Cambio de Contrase\u00F1a Requerido" }), _jsx("p", { className: "text-center mb-4", style: { color: '#6c757d' }, children: "Por seguridad, debes cambiar tu contrase\u00F1a por defecto antes de continuar." }), error && (_jsx("div", { className: "alert text-white", style: { backgroundColor: '#dc3545' }, role: "alert", children: error })), success && (_jsx("div", { className: "alert text-white", style: { backgroundColor: '#099347' }, role: "alert", children: "\u00A1Contrase\u00F1a actualizada correctamente! Redirigiendo..." })), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: "newPassword", className: "form-label", children: "Nueva Contrase\u00F1a" }), _jsx("input", { id: "newPassword", name: "newPassword", type: "password", autoComplete: "new-password", required: true, value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: `form-control ${newPassword && !isValidPassword ? 'is-invalid' : ''}`, placeholder: "M\u00EDnimo 6 caracteres" }), newPassword && !isValidPassword && (_jsx("div", { className: "invalid-feedback", children: "La contrase\u00F1a debe tener al menos 6 caracteres" }))] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "confirmPassword", className: "form-label", children: "Confirmar Contrase\u00F1a" }), _jsx("input", { id: "confirmPassword", name: "confirmPassword", type: "password", autoComplete: "new-password", required: true, value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: `form-control ${confirmPassword && !passwordsMatch ? 'is-invalid' : ''}`, placeholder: "Repite tu nueva contrase\u00F1a" }), confirmPassword && !passwordsMatch && (_jsx("div", { className: "invalid-feedback", children: "Las contrase\u00F1as no coinciden" }))] }), _jsx("div", { className: "d-grid gap-2", children: _jsx("button", { type: "submit", className: "btn", style: { backgroundColor: '#099347', color: 'white' }, disabled: loading || !isValidPassword || !passwordsMatch, children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), "Procesando..."] })) : ('Cambiar Contraseña') }) }), _jsxs("div", { className: "mt-3", children: [_jsx("div", { className: "progress", style: { height: '8px' }, children: _jsx("div", { className: `progress-bar ${newPassword.length >= 6 ? 'bg-success' : 'bg-danger'}`, role: "progressbar", style: {
                                                                width: `${Math.min(newPassword.length * 16, 100)}%`,
                                                                backgroundColor: newPassword.length >= 6 ? '#099347' : undefined
                                                            }, "aria-valuenow": Math.min(newPassword.length * 16, 100), "aria-valuemin": 0, "aria-valuemax": 100 }) }), _jsxs("small", { className: "text-muted", children: ["Seguridad de la contrase\u00F1a: ", newPassword.length === 0 ? 'No ingresada' :
                                                                newPassword.length < 6 ? 'Débil' :
                                                                    newPassword.length < 10 ? 'Moderada' : 'Fuerte'] })] })] })] }) })] }) }) }) }));
}
