import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import jsPDF from 'jspdf';
import PortalModal from './common/PortalModal';
import { formatRut, formatPhone } from '../utils/validators';
/**
 * Genera PDF de etiqueta directamente para un cliente
 * Inspirado en el sistema de cotizaciones
 */
export const generateClientLabelPDF = (client) => {
    // Crear PDF con dimensiones exactas de etiqueta: 85mm x 29mm
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85, 29] // width, height en mm
    });
    // Configurar colores
    const darkColor = [33, 37, 41]; // Bootstrap dark
    const primaryColor = [9, 147, 71]; // Verde fungus
    // Configuraciones de layout más conservadoras
    const leftMargin = 2;
    const labelWidth = 17; // Ancho para las etiquetas
    const contentStart = leftMargin + labelWidth;
    const lineHeight = 3.4; // Espaciado más compacto
    const totalHeight = 29; // Altura total disponible
    // Pre-calcular el número de líneas que necesitará cada campo
    const calculateLines = (text, maxWidth, fontSize) => {
        pdf.setFontSize(fontSize);
        const textLines = pdf.splitTextToSize(text, maxWidth);
        return Array.isArray(textLines) ? textLines.length : 1;
    };
    // Calcular líneas necesarias para cada campo con tamaños de fuente más pequeños
    const direccionText = client.address || 'No especificada';
    const telefonoText = client.phone ? formatPhone(client.phone) : 'No especificado';
    const nombreLines = calculateLines(client.name, 62, 9); // Reducido de 11 a 9
    const rutLines = calculateLines(formatRut(client.rut), 62, 8);
    const direccionLines = calculateLines(direccionText, 62, 8);
    const emailLines = calculateLines(client.email, 54, 8);
    const telefonoLines = calculateLines(telefonoText, 62, 8);
    // Calcular altura total necesaria
    const totalLines = nombreLines + rutLines + direccionLines + emailLines + telefonoLines;
    const extraSpaceForName = 0.3; // Reducido espacio extra
    const totalContentHeight = (totalLines * lineHeight) + extraSpaceForName;
    // Centrar verticalmente, pero asegurar que no se desborde
    const calculatedStartY = (totalHeight - totalContentHeight) / 2;
    const startY = Math.max(2, Math.min(calculatedStartY, totalHeight - totalContentHeight - 1)) + 1.5; // +1.5 para bajar un poco el texto
    let yPosition = startY;
    // Función helper para texto con múltiples líneas
    const addMultiLineText = (label, text, maxWidth = 62, fontSize = 8, isBold = false) => {
        // Etiqueta en negrita y color
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(fontSize);
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.text(label, leftMargin, yPosition);
        // Contenido
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setFontSize(fontSize);
        pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        // Dividir texto en líneas si es necesario
        const textLines = pdf.splitTextToSize(text, maxWidth);
        const isArray = Array.isArray(textLines);
        pdf.text(textLines, contentStart, yPosition);
        // Retornar el número de líneas usadas
        return isArray ? textLines.length : 1;
    };
    // Nombre (un poco más grande pero no tanto)
    const nombreLinesUsed = addMultiLineText('Nombre:', client.name, 62, 9, true);
    yPosition += (nombreLinesUsed * lineHeight) + extraSpaceForName;
    // RUT
    const rutLinesUsed = addMultiLineText('RUT:', formatRut(client.rut), 62, 8);
    yPosition += rutLinesUsed * lineHeight;
    // Dirección (puede ser multilinea)
    const direccionLinesUsed = addMultiLineText('Dirección:', direccionText, 62, 8);
    yPosition += direccionLinesUsed * lineHeight;
    // Email (puede ser largo)
    const emailLinesUsed = addMultiLineText('Email:', client.email, 54, 8);
    yPosition += emailLinesUsed * lineHeight;
    // Teléfono
    addMultiLineText('Teléfono:', telefonoText, 62, 8);
    // Abrir en nueva pestaña (igual que cotizaciones)
    window.open(pdf.output('bloburl'), '_blank');
};
const PrintLabelModal = ({ client, onClose }) => {
    const [loading, setLoading] = useState(false);
    const handlePrint = async () => {
        setLoading(true);
        try {
            await generateClientLabelPDF(client);
            // Cerrar modal automáticamente
            onClose();
        }
        catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Por favor, intente nuevamente.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(PortalModal, { isOpen: true, onClose: onClose, children: [_jsx("div", { className: "modal-backdrop fade show", style: { zIndex: 1050 }, onClick: onClose }), _jsx("div", { className: "modal fade show", style: {
                    display: 'block',
                    zIndex: 1055
                }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog modal-dialog-centered", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h5", { className: "modal-title", children: "Generar etiqueta PDF" }), _jsx("button", { type: "button", className: "btn-close", onClick: onClose, "aria-label": "Cerrar" })] }), _jsxs("div", { className: "modal-body text-center", children: [_jsxs("p", { children: ["\u00BFDeseas generar la etiqueta PDF para ", _jsx("strong", { children: client.name }), "?"] }), loading && (_jsx("div", { className: "spinner-border text-primary", role: "status", children: _jsx("span", { className: "visually-hidden", children: "Generando..." }) }))] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: onClose, disabled: loading, children: "Cancelar" }), _jsx("button", { type: "button", className: "btn btn-primary", onClick: handlePrint, disabled: loading, children: loading ? 'Generando...' : 'Generar PDF' })] })] }) }) })] }));
};
export default PrintLabelModal;
