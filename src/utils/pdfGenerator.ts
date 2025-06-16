import jsPDF from 'jspdf';
import { Quotation } from '../types/quotation';
import { formatCurrency, formatCurrencyNoDecimals } from './validators';

// Función para formatear fecha
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para formatear RUT con puntos
const formatRUT = (rut: string): string => {
  // Remover puntos y guión existentes
  const cleanRut = rut.replace(/[.-]/g, '');
  // Agregar puntos cada 3 dígitos desde la derecha, excepto el último dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedNumber}-${dv}`;
};

/**
 * ✨ Versión alternativa del generador de PDF con diseño profesional
 * Inspirado en recibos modernos como el de Starlink
 */
export const generateQuotationPDF = (quotation: Quotation): void => {
  const doc = new jsPDF();

  // Colores corporativos (definidos como tuplas)
  const primaryGreen: [number, number, number] = [9, 147, 71];
  const lightGray: [number, number, number] = [245, 248, 245];
  const darkGray: [number, number, number] = [64, 64, 64];
  const lightBorder: [number, number, number] = [220, 220, 220];

  let yPosition = 25;

  // ========== HEADER SECTION ==========

  // Título principal - FUNGUS MYCELIUM
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text('FUNGUS MYCELIUM', 20, yPosition);

  // Subtítulo - Cotización
  yPosition += 15;
  doc.setFontSize(18);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Cotización', 20, yPosition);

  // Número de documento en la esquina superior derecha
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text(quotation.documentNumber, 190, 25, { align: 'right' });

  // Línea separadora bajo el header
  yPosition += 10;
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);

  // ========== INFO BOXES SECTION ==========
  yPosition += 12; // Reducido de 15

  // Configurar cajas de información lado a lado
  const leftBoxX = 20;
  const rightBoxX = 110;
  const boxWidth = 80;
  const boxHeight = 38; // Aumentado de 35 para más aire

  // Caja izquierda - Información del documento
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(leftBoxX, yPosition, boxWidth, boxHeight, 'F');
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.rect(leftBoxX, yPosition, boxWidth, boxHeight, 'S');

  // Header de la caja izquierda
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text('Información del Documento', leftBoxX + 5, yPosition + 8);

  // Contenido de la caja izquierda (sin estado ni correlativo)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  let leftContentY = yPosition + 16;
  const leftData = [
    ['Fecha:', formatDate(quotation.date)],
    ...(quotation.validUntil ? [['Válido hasta:', formatDate(quotation.validUntil)]] : []),
    ['Tipo:', quotation.documentType === 'boleta' ? 'BOLETA' : 'FACTURA']
  ];

  leftData.forEach((row) => {
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], leftBoxX + 5, leftContentY);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], leftBoxX + 25, leftContentY);
    leftContentY += 6;
  });

  // Caja derecha - Información del cliente
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(rightBoxX, yPosition, boxWidth, boxHeight, 'F');
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.rect(rightBoxX, yPosition, boxWidth, boxHeight, 'S');

  // Header de la caja derecha
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text('Cliente', rightBoxX + 5, yPosition + 8);

  // Contenido de la caja derecha
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  let rightContentY = yPosition + 16;
  const rightData = [];

  if (typeof quotation.counterparty === 'object') {
    rightData.push(['Nombre:', quotation.counterparty.name]);
    if (quotation.counterparty.rut) rightData.push(['RUT:', formatRUT(quotation.counterparty.rut)]);
    if (quotation.counterparty.email) rightData.push(['Email:', quotation.counterparty.email]);
    if (quotation.counterparty.phone) rightData.push(['Teléfono:', quotation.counterparty.phone]);
  } else {
    rightData.push(['ID Cliente:', quotation.counterparty]);
  }

  rightData.forEach((row) => {
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], rightBoxX + 5, rightContentY);
    doc.setFont('helvetica', 'normal');

    // Manejar texto largo (especialmente email)
    const maxWidth = 45;
    const text = row[1];
    if (doc.getTextWidth(text) > maxWidth) {
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, rightBoxX + 25, rightContentY);
      if (Array.isArray(splitText) && splitText.length > 1) {
        rightContentY += 4; // Espacio extra si el texto se divide
      }
    } else {
      doc.text(text, rightBoxX + 25, rightContentY);
    }
    rightContentY += 6;
  });

  yPosition += boxHeight + 18; // Aumentado de 15 para más aire debajo de las cajas

  // ========== OBSERVACIONES SECTION (si existen) ==========
  if (quotation.observations) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('Observaciones', 20, yPosition);

    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11); // Aumentado de 9
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    const obsLines = doc.splitTextToSize(quotation.observations, 170);
    doc.text(obsLines, 20, yPosition);
    yPosition += (Array.isArray(obsLines) ? obsLines.length * 5 : 5) + 12; // Reducido de 15
  }

  // ========== TABLA DE PRODUCTOS ==========

  // Header de la tabla con color de fondo - mismas columnas que PDF original
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255); // Texto blanco

  // Fondo verde para la cabecera - ancho completo del contenido
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.rect(20, yPosition - 2, 170, 10, 'F');

  // Cabeceras de columnas con mejor distribución
  doc.text('Producto', 22, yPosition + 4);
  doc.text('Cant.', 95, yPosition + 4, { align: 'center' });
  doc.text('Precio Unit.', 120, yPosition + 4, { align: 'center' });
  doc.text('Descuento', 145, yPosition + 4, { align: 'center' });
  doc.text('Subtotal', 188, yPosition + 4, { align: 'right' });

  yPosition += 10;

  // Items de la tabla con filas alternadas
  quotation.items.forEach((item, index) => {
    // Verificar espacio en la página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 25;
    }

    // Fondo alternado para filas impares - ancho completo
    if (index % 2 === 1) {
      doc.setFillColor(248, 249, 250); // Gris muy claro
      doc.rect(20, yPosition - 2, 170, 14, 'F');
    }

    const productName = typeof item.itemDetail === 'object' ? item.itemDetail.name : 'Producto';
    const productDescription = typeof item.itemDetail === 'object' ? item.itemDetail.description : '';
    const productDimensions = typeof item.itemDetail === 'object' ? item.itemDetail.dimensions : '';

    // Nombre del producto
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(productName, 22, yPosition + 2);

    // Cantidad (centrada)
    doc.text(item.quantity.toString(), 95, yPosition + 2, { align: 'center' });

    // Precio unitario (centrado)
    doc.text(formatCurrency(item.unitPrice), 120, yPosition + 2, { align: 'center' });

    // Descuento (centrado)
    doc.text(formatCurrencyNoDecimals(item.discount), 145, yPosition + 2, { align: 'center' });

    // Subtotal (alineado a la derecha)
    doc.text(formatCurrencyNoDecimals(item.subtotal), 188, yPosition + 2, { align: 'right' });

    yPosition += 6;

    // Descripción y dimensiones (si existen)
    if (productDescription || productDimensions) {
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);

      let detailText = '';
      if (productDescription) {
        detailText = productDescription;
      }
      if (productDimensions) {
        detailText += detailText ? ` (${productDimensions})` : `(${productDimensions})`;
      }

      const detailLines = doc.splitTextToSize(detailText, 70); // Reducido para que no interfiera con otras columnas
      doc.text(detailLines, 24, yPosition);
      yPosition += Array.isArray(detailLines) ? detailLines.length * 3 : 3;
    }

    yPosition += 4; // Espacio entre items
  });

  // Línea separadora antes de totales
  yPosition += 5;
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.line(20, yPosition, 190, yPosition);

  // ========== TOTALES SECTION ==========
  yPosition += 12; // Reducido de 15

  // Crear caja para totales (como en la imagen de Starlink)
  const totalsBoxX = 120;
  const totalsBoxWidth = 70;
  const totalsBoxHeight = 35;

  doc.setFillColor(250, 250, 250);
  doc.rect(totalsBoxX, yPosition, totalsBoxWidth, totalsBoxHeight, 'F');
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.rect(totalsBoxX, yPosition, totalsBoxWidth, totalsBoxHeight, 'S');

  // Subtotal
  let totalsY = yPosition + 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Subtotal', totalsBoxX + 5, totalsY);
  doc.text(formatCurrencyNoDecimals(quotation.netAmount), totalsBoxX + totalsBoxWidth - 5, totalsY, { align: 'right' });

  // IVA
  totalsY += 7;
  doc.text('IVA (19%)', totalsBoxX + 5, totalsY);
  doc.text(formatCurrencyNoDecimals(quotation.taxAmount), totalsBoxX + totalsBoxWidth - 5, totalsY, { align: 'right' });

  // Línea separadora
  totalsY += 5;
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.line(totalsBoxX + 5, totalsY, totalsBoxX + totalsBoxWidth - 5, totalsY);

  // Total final
  totalsY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Total', totalsBoxX + 5, totalsY);
  doc.text(formatCurrencyNoDecimals(quotation.totalAmount), totalsBoxX + totalsBoxWidth - 5, totalsY, { align: 'right' });

  // ========== FOOTER SECTION ==========
  yPosition = 270; // Posición fija para el footer

  // Información de la empresa
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('FUNGUS MYCELIUM SPA', 105, yPosition, { align: 'center' });

  yPosition += 4;
  doc.text('Especialistas en Hongos Medicinales', 105, yPosition, { align: 'center' });

  yPosition += 4;
  doc.text('www.fungusmycelium.cl', 105, yPosition, { align: 'center' });

  // Numeración de páginas
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
  }

  // Abrir en nueva pestaña
  window.open(doc.output('bloburl'), '_blank');
}; 