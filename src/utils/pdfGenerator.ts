import jsPDF from 'jspdf';
import { Quotation } from '../types/quotation';

// Función para formatear moneda
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

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

// Función para traducir estado
const translateStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pendiente',
    'approved': 'Aprobada',
    'rejected': 'Rechazada',
    'converted': 'Convertida'
  };
  return statusMap[status] || status;
};

export const generateQuotationPDF = (quotation: Quotation): void => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Configurar fuente
  doc.setFont('helvetica');

  // Header - Título
  doc.setFontSize(20);
  doc.setTextColor(9, 147, 71); // Color verde de Fungus
  doc.text('Fungus Mycelium', 20, yPosition);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  yPosition += 10;
  doc.text(`Cotización ${quotation.documentNumber}`, 20, yPosition);

  // Tipo de documento con negrita
  yPosition += 15;
  doc.setFontSize(10);
  const docType = quotation.documentType === 'boleta' ? 'BOLETA' : 'FACTURA';
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo:', 150, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(docType, 165, yPosition);

  // Información general y Cliente usando tabla invisible para mejor alineación
  yPosition += 20;
  doc.setFontSize(14);
  doc.setTextColor(9, 147, 71);
  doc.text('Información General', 20, yPosition);
  doc.text('Cliente', 110, yPosition);

  // Definir datos para las tablas invisibles
  const generalData = [
    ['Fecha:', formatDate(quotation.date)],
    ...(quotation.validUntil ? [['Válido hasta:', formatDate(quotation.validUntil)]] : []),
    ['Estado:', translateStatus(quotation.status)],
    ['Correlativo:', quotation.correlative.toString()],
    ['Vendedor:', typeof quotation.user === 'object' ? quotation.user.name : quotation.user]
  ];

  const clientData = [];
  if (typeof quotation.counterparty === 'object') {
    clientData.push(['Nombre:', quotation.counterparty.name]);
    if (quotation.counterparty.rut) clientData.push(['RUT:', formatRUT(quotation.counterparty.rut)]);
    if (quotation.counterparty.email) clientData.push(['Email:', quotation.counterparty.email]);
    if (quotation.counterparty.phone) clientData.push(['Teléfono:', quotation.counterparty.phone]);
    if (quotation.counterparty.address) {
      // Manejo especial para direcciones largas
      const addressLines = doc.splitTextToSize(quotation.counterparty.address, 40);
      clientData.push(['Dirección:', addressLines]);
    }
  } else {
    clientData.push(['ID Cliente:', quotation.counterparty]);
  }

  // Renderizar tabla invisible para Información General (columna izquierda)
  yPosition += 8;
  let currentY = yPosition;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  generalData.forEach((row) => {
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], 65, currentY);
    currentY += 5;
  });

  // Renderizar tabla invisible para Cliente (columna derecha)
  currentY = yPosition;
  clientData.forEach((row) => {
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], 110, currentY);
    doc.setFont('helvetica', 'normal');

    // Si es dirección y tiene múltiples líneas
    if (Array.isArray(row[1])) {
      row[1].forEach((line, index) => {
        doc.text(line, 150, currentY + (index * 4));
      });
      currentY += (row[1].length - 1) * 4; // Ajustar espacio para líneas adicionales
    } else {
      doc.text(row[1], 150, currentY);
    }
    currentY += 5;
  });

  // Calcular la nueva posición Y basada en la tabla más larga
  yPosition = Math.max(yPosition + (generalData.length * 5), currentY) + 12;

  // Observaciones antes del detalle de productos (si existen)
  if (quotation.observations) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(9, 147, 71);
    doc.text('Observaciones', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    // Dividir observaciones en líneas si es muy largo
    const splitObservations = doc.splitTextToSize(quotation.observations, 170);
    doc.text(splitObservations, 20, yPosition);

    // Calcular espacio usado por observaciones
    const observationsLines = Array.isArray(splitObservations) ? splitObservations.length : 1;
    yPosition += (observationsLines * 5) + 15;
  }

  // Detalle de productos
  doc.setFontSize(14);
  doc.setTextColor(9, 147, 71);
  doc.text('Detalle de Productos', 20, yPosition);

  // Cabecera de la tabla con mejor espaciado
  yPosition += 15;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');

  // Línea de separación superior
  doc.line(20, yPosition - 3, 190, yPosition - 3);

  // Fondo para cabecera
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPosition - 3, 170, 8, 'F');

  // Nuevas posiciones para mejor distribución
  doc.text('Producto', 22, yPosition + 2);
  doc.text('Cant.', 100, yPosition + 2, { align: 'center' });
  doc.text('Precio Unit.', 120, yPosition + 2);
  doc.text('Descuento', 145, yPosition + 2);
  doc.text('Subtotal', 170, yPosition + 2);

  yPosition += 8;
  doc.line(20, yPosition - 3, 190, yPosition - 3);

  // Items con filas alternadas
  quotation.items.forEach((item, index) => {
    yPosition += 12;

    // Verificar si necesitamos nueva página
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    // Fondo alternado para filas
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPosition - 8, 170, 12, 'F');
    }

    const productName = typeof item.itemDetail === 'object' ? item.itemDetail.name : 'Producto';
    const productDescription = typeof item.itemDetail === 'object' ? item.itemDetail.description : '';
    const productDimensions = typeof item.itemDetail === 'object' ? item.itemDetail.dimensions : '';

    // Nombre del producto (truncar si es muy largo)
    const truncatedName = productName.length > 28 ? productName.substring(0, 25) + '...' : productName;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(truncatedName, 22, yPosition - 2);

    // Agregar descripción y dimensiones en línea siguiente
    if ((productDescription || productDimensions) && yPosition < 265) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);

      let detailText = '';
      if (productDescription) {
        detailText = productDescription.length > 28 ? productDescription.substring(0, 25) + '...' : productDescription;
      }
      if (productDimensions) {
        detailText += detailText ? ` (${productDimensions})` : `(${productDimensions})`;
      }

      doc.text(detailText, 24, yPosition + 2);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
    }

    // Datos numéricos con mejor alineación
    doc.text(item.quantity.toString(), 100, yPosition - 2, { align: 'center' });
    doc.text(formatCurrency(item.unitPrice), 135, yPosition - 2, { align: 'right' });
    doc.text(formatCurrency(item.discount), 160, yPosition - 2, { align: 'right' });
    doc.text(formatCurrency(item.subtotal), 188, yPosition - 2, { align: 'right' });
  });

  // Totales con marco
  yPosition += 15;
  doc.line(20, yPosition - 3, 190, yPosition - 3);

  // Marco para totales
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 248, 248);
  doc.rect(140, yPosition, 50, 24, 'FD');

  yPosition += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Neto:', 142, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(quotation.netAmount), 188, yPosition, { align: 'right' });

  yPosition += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('IVA (19%):', 142, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(quotation.taxAmount), 188, yPosition, { align: 'right' });

  yPosition += 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 142, yPosition);
  doc.text(formatCurrency(quotation.totalAmount), 188, yPosition, { align: 'right' });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${pageCount}`, 20, 285);
    doc.text('Generado por Fungus Mycelium', 140, 285);
  }

  // Abrir en nueva pestaña
  window.open(doc.output('bloburl'), '_blank');
}; 