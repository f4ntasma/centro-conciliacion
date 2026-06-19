'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Download, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import { ReconciliationDetail } from '@/types';
import { getCasoById, getDocumentos } from '@/lib/db';

export default function ReconciliationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [reconciliation, setReconciliation] = useState<ReconciliationDetail | null>(null);
  const [rawCaso, setRawCaso] = useState<any>(null);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const caso = await getCasoById(Number(id));
        setRawCaso(caso);
        const docs = await getDocumentos(Number(id));
        setDocumentos(docs);
        setReconciliation({
          id,
          name: `Caso #${id} - ${caso.solicitante}`,
          description: caso.pretension,
          status: caso.estado === 'INICIADO' ? 'draft' : caso.estado === 'EN_PROCESO' ? 'in-progress' : 'completed',
          createdAt: new Date(caso.fecha_radicacion).toISOString().split('T')[0],
          updatedAt: new Date(caso.fecha_radicacion).toISOString().split('T')[0],
          createdBy: caso.solicitante,
          progress: caso.estado === 'INICIADO' ? 25 : caso.estado === 'EN_PROCESO' ? 50 : 100,
          details: { totalRecords: 0, matchedRecords: 0, discrepancies: 0 },
        });
      } catch (e) {
        setReconciliation(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!reconciliation || !rawCaso) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const estado = rawCaso.estado === 'INICIADO' ? 'Iniciado' : rawCaso.estado === 'EN_PROCESO' ? 'En Proceso' : 'Finalizado';

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE CONCILIACIÓN', 105, 16, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('IustitiaEtPax — Sistema de Gestión Legal', 105, 26, { align: 'center' });
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Generado el ${fecha}`, 195, 42, { align: 'right' });
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(reconciliation.name, 14, 52);

    autoTable(doc, {
      startY: 58,
      head: [['Campo', 'Valor']],
      body: [
        ['Solicitante', rawCaso.solicitante],
        ['Convocado', rawCaso.convocado],
        ['Pretensión', rawCaso.pretension],
        ['Estado', estado],
        ['Fecha de Radicación', new Date(rawCaso.fecha_radicacion).toLocaleDateString('es-ES')],
        ['Progreso', `${reconciliation.progress}%`],
      ],
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    });

    const lastY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Documentos Adjuntos', 14, lastY);

    if (documentos.length > 0) {
      autoTable(doc, {
        startY: lastY + 4,
        head: [['Nombre', 'Tipo', 'Tamaño', 'Fecha']],
        body: documentos.map((d: any) => [
          d.name,
          d.type?.split('/')[1]?.toUpperCase() || '—',
          d.size ? `${Math.round(d.size / 1024)} KB` : '—',
          new Date(d.uploadedAt).toLocaleDateString('es-ES'),
        ]),
        headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [239, 246, 255] },
        styles: { fontSize: 9, cellPadding: 3 },
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('No hay documentos adjuntos.', 14, lastY + 10);
    }

    const pageH = doc.internal.pageSize.height;
    doc.setFillColor(15, 23, 42);
    doc.rect(0, pageH - 14, 210, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Documento generado automáticamente — IustitiaEtPax', 105, pageH - 5, { align: 'center' });
    doc.save(`Reporte_Caso_${id}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportExcel = async () => {
    if (!reconciliation || !rawCaso) return;
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.aoa_to_sheet([
      ['REPORTE DE CONCILIACIÓN — IustitiaEtPax'],
      [],
      ['Campo', 'Valor'],
      ['Caso', reconciliation.name],
      ['Solicitante', rawCaso.solicitante],
      ['Convocado', rawCaso.convocado],
      ['Pretensión', rawCaso.pretension],
      ['Estado', rawCaso.estado],
      ['Progreso', `${reconciliation.progress}%`],
      ['Fecha Radicación', new Date(rawCaso.fecha_radicacion).toLocaleDateString('es-ES')],
      ['Fecha Reporte', new Date().toLocaleDateString('es-ES')],
    ]);
    ws1['!cols'] = [{ wch: 25 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Información del Caso');

    const ws2 = XLSX.utils.aoa_to_sheet([
      ['Nombre', 'Tipo', 'Tamaño (KB)', 'Subido por', 'Fecha'],
      ...documentos.map((d: any) => [
        d.name,
        d.type?.split('/')[1]?.toUpperCase() || '—',
        d.size ? Math.round(d.size / 1024) : 0,
        d.uploadedBy,
        new Date(d.uploadedAt).toLocaleDateString('es-ES'),
      ]),
    ]);
    ws2['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 14 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Documentos');

    XLSX.writeFile(wb, `Caso_${id}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusBadge = (status: ReconciliationDetail['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-600">Completada</Badge>;
      case 'in-progress': return <Badge className="bg-blue-600">En Progreso</Badge>;
      case 'draft': return <Badge className="bg-gray-600">Borrador</Badge>;
      case 'failed': return <Badge className="bg-red-600">Falló</Badge>;
    }
  };

  if (isLoading) return (
    <ProtectedRoute><AppLayout>
      <div className="flex items-center justify-center min-h-screen"><Spinner className="h-8 w-8" /></div>
    </AppLayout></ProtectedRoute>
  );

  if (!reconciliation) return (
    <ProtectedRoute><AppLayout>
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Conciliación no encontrada</p>
      </div>
    </AppLayout></ProtectedRoute>
  );

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6 max-w-4xl">
          <Link href="/reconciliations">
            <Button variant="ghost" className="gap-2"><ArrowLeft className="h-4 w-4" /> Volver</Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{reconciliation.name}</h1>
              <p className="text-muted-foreground mt-2">{reconciliation.description}</p>
            </div>
            <div>{getStatusBadge(reconciliation.status)}</div>
          </div>

          <Card>
            <CardHeader><CardTitle>Información General</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-muted-foreground">Solicitante</p>
                  <p className="text-lg font-medium mt-1">{rawCaso?.solicitante}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Convocado</p>
                  <p className="text-lg font-medium mt-1">{rawCaso?.convocado}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Radicación</p>
                  <p className="text-lg font-medium mt-1">{new Date(reconciliation.createdAt).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="text-lg font-medium mt-1">
                    {reconciliation.status === 'draft' ? 'Iniciado' : reconciliation.status === 'in-progress' ? 'En Proceso' : 'Finalizado'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-3">Progreso</p>
                <Progress value={reconciliation.progress} className="h-3" />
                <p className="text-sm font-medium mt-1">{reconciliation.progress}% completado</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos del Caso</CardTitle>
              <CardDescription>{documentos.length} documento{documentos.length !== 1 ? 's' : ''} adjunto{documentos.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              {documentos.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay documentos para este caso.</p>
              ) : (
                <ul className="space-y-2">
                  {documentos.map((d: any) => (
                    <li key={d.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted">
                      <span className="font-medium">{d.name}</span>
                      <span className="text-muted-foreground">{d.type?.split('/')[1]?.toUpperCase() || '—'} · {d.size ? `${Math.round(d.size / 1024)} KB` : '—'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" /> Descargar Reporte PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar a Excel
            </Button>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
