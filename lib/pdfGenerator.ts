import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ResultadoConteo } from '@/types';

export const generarActaPDF = (
  resultados: ResultadoConteo[],
  totalCenso: number,
  totalVotos: number
) => {
  const doc = new jsPDF();
  const fechaActual = new Date().toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  // Encabezado Oficial SENA
  doc.setFillColor(16, 185, 129); // Verde Emerald SENA
  doc.rect(0, 0, 210, 12, 'F');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('SERVICIO NACIONAL DE APRENDIZAJE - SENA', 105, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ACTA OFICIAL DE ESCRUTINIO Y CIERRE ELECTORAL', 105, 33, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha y Hora de Generación: ${fechaActual}`, 105, 40, { align: 'center' });

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 45, 196, 45);

  // Cuadro de Resumen Estadístico
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('1. Consolidado General de Participación', 14, 55);

  const porcentajeParticipacion = totalCenso > 0 ? ((totalVotos / totalCenso) * 100).toFixed(2) : '0';
  const abstencionismo = totalCenso > 0 ? (100 - parseFloat(porcentajeParticipacion)).toFixed(2) : '0';

  autoTable(doc, {
    startY: 60,
    head: [['Métrica Electoral', 'Cantidad / Valor', 'Porcentaje']],
    body: [
      ['Total Aprendices Habilitados (Censo)', totalCenso.toString(), '100%'],
      ['Total Votos Depositados en Urna Digital', totalVotos.toString(), `${porcentajeParticipacion}%`],
      ['Abstencionismo Registrado', (totalCenso - totalVotos).toString(), `${abstencionismo}%`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Tabla de Resultados por Candidato
  const finalYStats = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Votación Obtenida por Candidato / Opción', 14, finalYStats);

  const tableData = resultados.map((r) => [
    `#${r.numero < 10 ? `0${r.numero}` : r.numero}`,
    r.nombre,
    r.votos.toString(),
    `${r.porcentaje}%`,
  ]);

  autoTable(doc, {
    startY: finalYStats + 5,
    head: [['Número', 'Candidato / Opción', 'Total Votos', 'Porcentaje Global']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3.5 },
  });

  // Área de Firmas y Validación
  const finalYTable = (doc as any).lastAutoTable.finalY + 35;

  doc.setDrawColor(148, 163, 184);
  
  // Linea Firma 1
  doc.line(20, finalYTable, 85, finalYTable);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Dinamizador / Comité Electoral', 20, finalYTable + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('C.C. _______________________', 20, finalYTable + 10);

  // Linea Firma 2
  doc.line(125, finalYTable, 190, finalYTable);
  doc.setFont('helvetica', 'bold');
  doc.text('Testigo / Jurado Institucional', 125, finalYTable + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('C.C. _______________________', 125, finalYTable + 10);

  // Pie de Página
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Este documento fue generado automáticamente por el Sistema Electoral Digital SENA y goza de validez institucional.', 105, 285, { align: 'center' });

  // Guardar archivo
  doc.save(`Acta_Escrutinio_SENA_${Date.now()}.pdf`);
};