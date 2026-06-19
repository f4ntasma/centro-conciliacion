'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Upload, Trash2, File, ChevronDown, ChevronRight, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCasos, getDocumentos, crearDocumento, eliminarDocumento, subirArchivoDocumento, getSignedUrlDocumento } from '@/lib/db';

const DocViewer = dynamic(() => import('@cyntler/react-doc-viewer'), { ssr: false });

interface Documento {
  id: string;
  casoId: number;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  storagePath?: string | null;
}

interface Caso {
  id: number;
  solicitante: string;
  convocado: string;
  estado: string;
}

function DocPreview({ url, type, name }: { url: string; type: string; name: string }) {
  const docs = [{ uri: url, fileType: type, fileName: name }];
  return (
    <div className="w-full h-[70vh] rounded border overflow-hidden">
      <DocViewer
        documents={docs}
        style={{ width: '100%', height: '100%' }}
        config={{
          header: { disableHeader: true },
          pdfVerticalScrollByDefault: true,
        }}
      />
    </div>
  );
}

export default function DocumentsPage() {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingCasoId, setUploadingCasoId] = useState<number | null>(null);
  const [expandedCasos, setExpandedCasos] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDoc, setPreviewDoc] = useState<Documento | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadCasoId = useRef<number | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [casosData, docsData] = await Promise.all([getCasos(), getDocumentos()]);
      setCasos(casosData);
      setDocumentos(docsData);
      setExpandedCasos(new Set(casosData.map((c: Caso) => c.id)));
    } catch (error) {
      console.warn('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUploadClick = (casoId: number) => {
    currentUploadCasoId.current = casoId;
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const casoId = currentUploadCasoId.current;
    if (!files || !casoId) return;

    try {
      setUploadingCasoId(casoId);
      const file = files[0];

      let storagePath: string | undefined;
      try {
        storagePath = await subirArchivoDocumento(casoId, file);
      } catch (storageError: any) {
        toast({ title: 'Error al subir archivo', description: storageError?.message || 'Error en Storage', variant: 'destructive' });
        return;
      }

      const newDoc = await crearDocumento({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        uploadedBy: 'Usuario',
        uploadedAt: new Date().toISOString().split('T')[0],
        casoId,
        storagePath,
      });
      setDocumentos(prev => [newDoc, ...prev]);
      toast({ title: 'Documento subido', description: file.name });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo subir el documento', variant: 'destructive' });
    } finally {
      setUploadingCasoId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eliminarDocumento(id);
      setDocumentos(prev => prev.filter(d => d.id !== id));
      toast({ title: 'Eliminado', description: 'Documento eliminado correctamente' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
  };

  const openPreview = async (doc: Documento) => {
    setPreviewDoc(doc);
    setPreviewUrl(null);
    if (!doc.storagePath) return;
    try {
      setPreviewLoading(true);
      const url = await getSignedUrlDocumento(doc.storagePath);
      setPreviewUrl(url);
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar el archivo', variant: 'destructive' });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (doc: Documento) => {
    if (!doc.storagePath) return;
    try {
      const url = await getSignedUrlDocumento(doc.storagePath);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      toast({ title: 'Error', description: 'No se pudo descargar el archivo', variant: 'destructive' });
    }
  };

  const toggleCaso = (casoId: number) => {
    setExpandedCasos(prev => {
      const next = new Set(prev);
      next.has(casoId) ? next.delete(casoId) : next.add(casoId);
      return next;
    });
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
  };

  const filteredCasos = casos.filter(c =>
    c.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(c.id).includes(searchTerm)
  );

  if (isLoading) {
    return <ProtectedRoute><AppLayout><div className="flex items-center justify-center min-h-screen"><Spinner className="h-8 w-8" /></div></AppLayout></ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documentos por Caso</h1>
            <p className="text-muted-foreground mt-2">Cada caso tiene sus propios documentos</p>
          </div>

          <Input
            placeholder="Buscar caso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" accept="*/*" />

          {/* Modal de previsualización */}
          <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) { setPreviewDoc(null); setPreviewUrl(null); } }}>
            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <div className="flex items-center justify-between pr-8">
                  <DialogTitle className="truncate max-w-sm">{previewDoc?.name}</DialogTitle>
                  {previewDoc?.storagePath && (
                    <Button size="sm" variant="outline" onClick={() => handleDownload(previewDoc)}>
                      <Download className="h-4 w-4 mr-2" /> Descargar
                    </Button>
                  )}
                </div>
              </DialogHeader>
              {previewLoading && (
                <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
              )}
              {!previewLoading && previewUrl && previewDoc && (
                <DocPreview url={previewUrl} type={previewDoc.type} name={previewDoc.name} />
              )}
              {!previewLoading && !previewUrl && previewDoc && (
                <p className="text-muted-foreground text-center py-8">Este documento no tiene archivo en Storage.</p>
              )}
            </DialogContent>
          </Dialog>

          {filteredCasos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                No hay casos. Crea uno en Conciliaciones primero.
              </CardContent>
            </Card>
          ) : (
            filteredCasos.map(caso => {
              const docsDelCaso = documentos.filter(d => d.casoId === caso.id);
              const isExpanded = expandedCasos.has(caso.id);

              return (
                <Card key={caso.id}>
                  <CardHeader className="cursor-pointer select-none" onClick={() => toggleCaso(caso.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded
                          ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        }
                        <div>
                          <CardTitle className="text-base">Caso #{caso.id} — {caso.solicitante}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            vs. {caso.convocado} · {docsDelCaso.length} documento{docsDelCaso.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); handleUploadClick(caso.id); }} disabled={uploadingCasoId === caso.id}>
                        {uploadingCasoId === caso.id
                          ? <><Spinner className="mr-2 h-3 w-3" />Subiendo...</>
                          : <><Upload className="mr-2 h-3 w-3" />Subir</>
                        }
                      </Button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent>
                      {docsDelCaso.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No hay documentos para este caso.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Tamaño</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {docsDelCaso.map(doc => (
                              <TableRow key={doc.id}>
                                <TableCell className="font-medium">
                                  <button
                                    className="flex items-center gap-2 hover:underline text-left"
                                    onClick={() => setPreviewDoc(doc)}
                                  >
                                    <File className="h-4 w-4 text-muted-foreground shrink-0" />
                                    {doc.name}
                                  </button>
                                </TableCell>
                                <TableCell>{doc.type?.split('/')[1]?.toUpperCase() || '—'}</TableCell>
                                <TableCell>{formatSize(doc.size)}</TableCell>
                                <TableCell>{new Date(doc.uploadedAt).toLocaleDateString('es-ES')}</TableCell>
                                <TableCell className="text-right space-x-1">
                                  {doc.storagePath && (
                                    <>
                                      <Button variant="ghost" size="icon" title="Previsualizar" onClick={() => setPreviewDoc(doc)}>
                                        <Eye className="h-4 w-4 text-primary" />
                                      </Button>
                                      <Button variant="ghost" size="icon" title="Descargar" onClick={() => handleDownload(doc)}>
                                        <Download className="h-4 w-4 text-primary" />
                                      </Button>
                                    </>
                                  )}
                                  <Button variant="ghost" size="icon" title="Eliminar" onClick={() => handleDelete(doc.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
