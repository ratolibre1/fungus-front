import React from 'react';
import { Client } from '../types/client';
import { formatRut, formatPhone } from '../utils/validators';

interface PrintLabelProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}

const PrintLabel: React.FC<PrintLabelProps> = ({ client, isOpen, onClose }) => {
  if (!isOpen) return null;

  const printLabel = () => {
    // Añadir eventos de impresión para manejar el ciclo de vida
    const beforePrint = () => {
      console.log('Preparando impresión...');

      // Ocultar todo excepto el contenido a imprimir
      document.querySelectorAll('body > *:not(#printable-content)').forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });

      // Intentar configurar parámetros de impresión automáticamente
      const styleSheet = document.createElement('style');
      styleSheet.id = 'print-styles';
      styleSheet.innerHTML = `
        @page {
          size: 85mm 29mm;
          margin: 0 !important;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 85mm !important;
          height: 29mm !important;
          overflow: hidden !important;
        }
        
        body * {
          visibility: hidden !important;
          display: none !important;
        }
        
        #printable-content {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 85mm !important;
          height: 29mm !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
          visibility: visible !important;
          display: block !important;
          background-color: white !important;
          border: none !important;
        }
        
        #printable-content * {
          visibility: visible !important;
          display: revert !important;
        }
        
        .label-preview {
          width: 100% !important;
          height: 100% !important;
          padding: 1mm !important;
          font-size: 6pt !important;
          overflow: visible !important;
        }
      `;
      document.head.appendChild(styleSheet);

      // Preparar contenedor para impresión
      const printContent = document.getElementById('printable-content');
      if (printContent) {
        // Eliminar cualquier otra copia del contenido que pueda existir
        document.querySelectorAll('#printable-content').forEach((el, index) => {
          if (index > 0) { // Mantener solo el primer elemento
            el.remove();
          }
        });

        // Posicionar y aplicar estilos al elemento de impresión
        printContent.style.position = 'absolute';
        printContent.style.top = '0';
        printContent.style.left = '0';
        printContent.style.width = '85mm';
        printContent.style.height = '29mm';
        printContent.style.margin = '0';
        printContent.style.padding = '0';
        printContent.style.backgroundColor = 'white';
        printContent.style.border = 'none';
        printContent.style.overflow = 'visible';
        printContent.style.zIndex = '9999';
      }
    };

    const afterPrint = () => {
      console.log('Impresión terminada');

      // Restaurar elementos ocultos
      document.querySelectorAll('body > *:not(#printable-content)').forEach(el => {
        (el as HTMLElement).style.display = '';
      });

      // Limpiar estilos específicos de impresión
      const styleElement = document.getElementById('print-styles');
      if (styleElement) {
        document.head.removeChild(styleElement);
      }

      document.title = 'Datos de Contacto';
    };

    // Añadir escuchas de eventos
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);

    // Iniciar impresión
    document.title = `Etiqueta - ${client.name}`;

    // Forzar repintado del DOM antes de imprimir
    setTimeout(() => {
      window.print();
    }, 200);

    // Limpiar escuchas cuando se complete
    setTimeout(() => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
      document.title = 'Fungus Mycelium';
    }, 1000);
  };

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Vista previa de etiqueta (29mm)</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body d-flex justify-content-center align-items-center p-4">
            <div id="printable-content" style={{
              width: '85mm',
              height: '29mm',
              margin: '0 auto',
              padding: 0,
              border: '1px solid #ddd',
              boxSizing: 'border-box',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}>
              <div className="label-preview" style={{
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                padding: '1mm',
                fontSize: '6pt'
              }}>
                <div className="label-data">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.5pt' }}>
                    <tbody>
                      <tr>
                        <td style={{ whiteSpace: 'nowrap', paddingRight: '2mm', fontWeight: 'bold', width: '18%' }}>Nombre:</td>
                        <td style={{ width: '82%', paddingBottom: '1mm' }}>{client.name}</td>
                      </tr>
                      <tr>
                        <td style={{ whiteSpace: 'nowrap', paddingRight: '2mm', fontWeight: 'bold', paddingBottom: '1.5mm' }}>Rut:</td>
                        <td style={{ paddingBottom: '1mm' }}>{formatRut(client.rut)}</td>
                      </tr>
                      <tr>
                        <td style={{ whiteSpace: 'nowrap', paddingRight: '2mm', fontWeight: 'bold', paddingBottom: '1.5mm' }}>Dir:</td>
                        <td style={{ paddingBottom: '1mm' }}>{client.address || '-'}</td>
                      </tr>
                      <tr>
                        <td style={{ whiteSpace: 'nowrap', paddingRight: '2mm', fontWeight: 'bold', paddingBottom: '1.5mm' }}>Email:</td>
                        <td style={{ paddingBottom: '1mm' }}>{client.email}</td>
                      </tr>
                      <tr>
                        <td style={{ whiteSpace: 'nowrap', paddingRight: '2mm', fontWeight: 'bold' }}>Tel:</td>
                        <td>{client.phone ? formatPhone(client.phone) : '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={printLabel}
            >
              <i className="bi bi-printer me-1"></i> Imprimir etiqueta
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
    @media print {
      * {
        margin: 0 !important;
        padding: 0 !important;
        -webkit-box-sizing: border-box !important;
        box-sizing: border-box !important;
      }
      
      @page {
        size: 85mm 29mm;
        margin: 0 !important;
      }
      
      html, body {
        width: 85mm;
        height: 29mm;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
        
      body * {
        visibility: hidden;
        display: none;
      }
      
      #printable-content {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 85mm !important;
        height: 29mm !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        overflow: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        visibility: visible !important;
        display: block !important;
        z-index: 9999 !important;
        transform: none !important;
        background-color: white !important;
      }
      
      #printable-content * {
        visibility: visible !important;
        display: revert !important;
      }
      
      .label-preview {
        border: none !important;
        padding: 1mm !important;
        width: 100% !important;
        height: 100% !important;
        overflow: visible !important;
        font-size: 6pt !important;
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        transform: none !important;
      }
      
      .modal, .modal-dialog, .modal-content, .modal-body {
        display: none !important;
        visibility: hidden !important;
      }
      
      .print-hide {
        display: none !important;
      }
      
      .label-preview p {
        margin: 1mm 0 !important;
        line-height: 1.2 !important;
        font-size: 6pt !important;
      }
      
      .label-preview strong {
        font-weight: bold !important;
      }
      
      .label-preview table {
        width: 100% !important;
        font-size: 6pt !important;
        border-collapse: collapse !important;
      }
      
      .label-preview td {
        padding: 0.7mm 0 !important;
        line-height: 1.2 !important;
      }
      
      .label-preview td:first-child {
        padding-right: 3mm !important;
        width: 18% !important;
      }
      
      .label-preview td:last-child {
        width: 82% !important;
      }
    }

    /* Estilos para que la vista previa simule exactamente lo que saldrá impreso */
    .label-preview {
      transform-origin: top left;
      border: 1px solid #ddd !important;
      overflow: hidden;
    }
  `}
      </style>
    </div>
  );
};

export default PrintLabel;