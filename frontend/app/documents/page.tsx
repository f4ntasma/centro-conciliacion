'use client';

import { useEffect, useState, useRef } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Download, Trash2, File } from 'lucide-react';
import { getDocumentos, crearDocumento, eliminarDocumento } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await getDocumentos();
      setDocuments(docs);
    } catch (error) {
      console.warn('Error cargando documentos:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    try {
      setIsUploading(true);
      const newDocument = await crearDocumento({
        name: files[0].name, type: files[0].type, size: files[0].size,
        status: 'pending', uploadedBy: 'Usuario Actual',
        uploadedAt: new Date().toISOString().split('T')[0],
      });
      setDocuments([newDocument, ...documents]);
      toast({ title: 'Éxito', description: 'Documento subido correctamente' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo subir el documento', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eliminarDocumento(id);
      setDocuments(documents.filter(d => d.id !== id));
      toast({ title: 'Éxito', description: 'Documento eliminado correctamente' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el documento', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Completado</Badge>;
      case 'processing':
        return <Badge className="bg-blue-600">Procesando</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">Pendiente</Badge>;
      case 'error':
        return <Badge className="bg-red-600">Error</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex items-center justify-center min-h-screen">
            <Spinner className="h-8 w-8" />
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestión de Documentos</h1>
              <p className="text-muted-foreground mt-2">
                Sube y gestiona tus documentos
              </p>
            </div>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Documento
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUpload}
              className="hidden"
              accept=".pdf,.xlsx,.xls,.doc,.docx"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Buscar documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos ({filteredDocuments.length})</CardTitle>
              <CardDescription>
                Gestiona todos tus documentos cargados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Tamaño</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Cargado por</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No se encontraron documentos
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <File className="h-4 w-4 text-muted-foreground" />
                            {doc.name}
                          </TableCell>
                          <TableCell>{doc.type.split('/')[1]?.toUpperCase()}</TableCell>
                          <TableCell>{formatFileSize(doc.size)}</TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell>{doc.uploadedBy}</TableCell>
                          <TableCell>
                            {new Date(doc.uploadedAt).toLocaleDateString('es-ES')}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
