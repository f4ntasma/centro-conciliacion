'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { getCasos, getIngresos, crearIngreso, eliminarIngreso } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';

interface Income {
  id: string;
  caseId: string;
  caseType: string;
  amount: string;
  paymentDate: string;
  description: string;
  status: 'pagado' | 'pendiente';
}

interface Caso {
  id: number;
  solicitante: string;
  convocado: string;
  estado: string;
}

export default function IncomesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIncome, setNewIncome] = useState<Omit<Income, 'id'>>({
    caseId: '',
    caseType: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    description: '',
    status: 'pendiente',
  });
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [incomesData, casosData] = await Promise.all([getIngresos(), getCasos()]);
      setIncomes(incomesData);
      setCasos(casosData);
    } catch (error) {
      console.warn('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCasoSelect = (casoId: string) => {
    const caso = casos.find(c => String(c.id) === casoId);
    setNewIncome(prev => ({
      ...prev,
      caseId: casoId,
      caseType: caso ? `Caso #${caso.id} - ${caso.solicitante}` : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncome.caseId) {
      toast({ title: 'Error', description: 'Selecciona un caso', variant: 'destructive' });
      return;
    }
    try {
      await crearIngreso(newIncome);
      toast({ title: 'Exito', description: 'Ingreso registrado correctamente' });
      setIsDialogOpen(false);
      setNewIncome({ caseId: '', caseType: '', amount: '', paymentDate: new Date().toISOString().split('T')[0], description: '', status: 'pendiente' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo registrar el ingreso', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eliminarIngreso(id);
      setIncomes(incomes.filter(inc => inc.id !== id));
      toast({ title: 'Eliminado', description: 'Ingreso eliminado' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
  };

  const filteredIncomes = incomes.filter(inc =>
    inc.caseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPagado = filteredIncomes
    .filter(i => i.status === 'pagado')
    .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  const totalPendiente = filteredIncomes
    .filter(i => i.status === 'pendiente')
    .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  if (isLoading) {
    return <ProtectedRoute><AppLayout><div className="flex items-center justify-center min-h-screen"><Spinner className="h-8 w-8" /></div></AppLayout></ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ingresos por Casos</h1>
              <p className="text-muted-foreground mt-2">Gestiona los pagos de conciliacion</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Nuevo Ingreso</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
                  <DialogDescription>Asocia el pago a un caso existente</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Caso</Label>
                    <Select value={newIncome.caseId} onValueChange={handleCasoSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un caso..." />
                      </SelectTrigger>
                      <SelectContent>
                        {casos.length === 0 ? (
                          <SelectItem value="none" disabled>No hay casos disponibles</SelectItem>
                        ) : (
                          casos.map(caso => (
                            <SelectItem key={caso.id} value={String(caso.id)}>
                              Caso #{caso.id} — {caso.solicitante} vs {caso.convocado}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Monto</Label>
                    <Input
                      type="number" step="0.01" placeholder="0.00"
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha de Pago</Label>
                    <Input
                      type="date"
                      value={newIncome.paymentDate}
                      onChange={(e) => setNewIncome({ ...newIncome, paymentDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descripcion</Label>
                    <Input
                      placeholder="Ej: Honorarios primera audiencia"
                      value={newIncome.description}
                      onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      value={newIncome.status}
                      onValueChange={(v: any) => setNewIncome({ ...newIncome, status: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="pagado">Pagado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    <DollarSign className="mr-2 h-4 w-4" />Registrar Ingreso
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Pagado</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">${totalPagado.toLocaleString('es-CO')}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Pendiente</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-yellow-600">${totalPendiente.toLocaleString('es-CO')}</div></CardContent>
            </Card>
          </div>

          <Input
            placeholder="Buscar ingreso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <Card>
            <CardHeader>
              <CardTitle>Ingresos Registrados ({filteredIncomes.length})</CardTitle>
              <CardDescription>Todos los ingresos por casos de conciliacion</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caso</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncomes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay ingresos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIncomes.map(income => (
                      <TableRow key={income.id}>
                        <TableCell className="font-medium">{income.caseType}</TableCell>
                        <TableCell>${parseFloat(income.amount).toLocaleString('es-CO')}</TableCell>
                        <TableCell>{new Date(income.paymentDate).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>{income.description}</TableCell>
                        <TableCell>
                          <Badge className={income.status === 'pagado' ? 'bg-green-600' : 'bg-yellow-600'}>
                            {income.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(income.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
