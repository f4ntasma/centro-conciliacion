'use client';

import { useEffect, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { PlusCircle, Eye, Trash2, Play, CheckSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Reconciliation } from '@/types';
import Link from 'next/link';
import { getCasos, crearCaso, cambiarEstadoCaso, eliminarCaso } from '@/lib/db';

const reconciliationSchema = z.object({
  name: z.string().min(3, 'Nombre requerido'),
  description: z.string().min(5, 'Descripción requerida'),
});

type ReconciliationFormData = z.infer<typeof reconciliationSchema>;

export default function ReconciliationsPage() {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReconciliationFormData>({
    resolver: zodResolver(reconciliationSchema),
  });

  useEffect(() => {
    loadReconciliations();
  }, []);

  const loadReconciliations = async () => {
    try {
      setIsLoading(true);
      const casos = await getCasos();
      const reconciliationsData = casos.map((caso: any) => ({
        id: caso.id.toString(),
        name: `Caso #${caso.id} - ${caso.solicitante}`,
        description: caso.pretension,
        status: caso.estado === 'INICIADO' ? 'draft' :
                caso.estado === 'EN_PROCESO' ? 'in-progress' :
                caso.estado === 'FINALIZADO' ? 'completed' : 'draft',
        createdAt: new Date(caso.fecha_radicacion).toISOString().split('T')[0],
        updatedAt: new Date(caso.fecha_radicacion).toISOString().split('T')[0],
        createdBy: 'Sistema',
        progress: caso.estado === 'INICIADO' ? 25 :
                  caso.estado === 'EN_PROCESO' ? 50 :
                  caso.estado === 'FINALIZADO' ? 100 : 0,
      }));
      setReconciliations(reconciliationsData);
    } catch (error) {
      console.warn('Error cargando conciliaciones:', error);
      setReconciliations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ReconciliationFormData) => {
    try {
      const newCaso = await crearCaso({ solicitante: data.name, convocado: 'Por determinar', pretension: data.description });
      const newReconciliation: Reconciliation = {
        id: newCaso.id.toString(),
        name: `Caso #${newCaso.id} - ${data.name}`,
        description: data.description,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: data.name,
        progress: 0,
      };
      setReconciliations([newReconciliation, ...reconciliations]);
      toast({ title: 'Éxito', description: 'Conciliación creada correctamente' });
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo crear la conciliación', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'INICIADO' | 'EN_PROCESO' | 'FINALIZADO') => {
    try {
      await cambiarEstadoCaso(Number(id), newStatus);
      await loadReconciliations();
      toast({ title: 'Éxito', description: `Estado cambiado a ${newStatus.replace('_', ' ').toLowerCase()}` });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cambiar el estado', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eliminarCaso(Number(id));
      setReconciliations(reconciliations.filter(r => r.id !== id));
      toast({ title: 'Éxito', description: 'Conciliación eliminada correctamente' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la conciliación', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: Reconciliation['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Completada</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-600">En Progreso</Badge>;
      case 'draft':
        return <Badge className="bg-gray-600">Borrador</Badge>;
      case 'failed':
        return <Badge className="bg-red-600">Falló</Badge>;
    }
  };

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
              <h1 className="text-3xl font-bold tracking-tight">Conciliaciones</h1>
              <p className="text-muted-foreground mt-2">
                Administra y realiza conciliaciones contables
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nueva Conciliación
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Conciliación</DialogTitle>
                  <DialogDescription>
                    Completa el formulario para crear una nueva conciliación
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      placeholder="Nombre de la conciliación"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      placeholder="Descripción de la conciliación"
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    Crear Conciliación
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total de Conciliaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reconciliations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {reconciliations.filter(r => r.status === 'completed').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {reconciliations.filter(r => r.status === 'in-progress').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reconciliations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Conciliaciones</CardTitle>
              <CardDescription>
                Todas las conciliaciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reconciliations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay conciliaciones
                  </div>
                ) : (
                  reconciliations.map((recon) => (
                    <div
                      key={recon.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{recon.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {recon.description}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {getStatusBadge(recon.status)}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className="font-medium">{recon.progress}%</span>
                        </div>
                        <Progress value={recon.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Creado por {recon.createdBy} el {new Date(recon.createdAt).toLocaleDateString('es-ES')}</span>
                        <div className="flex gap-2">
                          <Link href={`/reconciliations/${recon.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                          {recon.status === 'draft' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleStatusChange(recon.id, 'EN_PROCESO')}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Iniciar
                            </Button>
                          )}
                          {recon.status === 'in-progress' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleStatusChange(recon.id, 'FINALIZADO')}
                            >
                              <CheckSquare className="h-4 w-4 mr-1" />
                              Finalizar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(recon.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
