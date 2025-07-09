import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
export default function NotFound() {
    return (_jsx(Layout, { children: _jsx("div", { className: "container py-5", children: _jsxs("div", { className: "text-center mt-5", children: [_jsx("h1", { className: "display-1 fw-bold", style: { color: '#099347' }, children: "404" }), _jsxs("p", { className: "fs-3", children: [_jsx("span", { className: "text-danger", children: "\u00A1Ups!" }), " P\u00E1gina no encontrada."] }), _jsx("p", { className: "lead", children: "La p\u00E1gina que est\u00E1s buscando no existe o no tienes permisos para acceder." }), _jsx(Link, { to: "/panel", className: "btn", style: { backgroundColor: '#099347', color: 'white' }, children: "Volver al panel" })] }) }) }));
}
