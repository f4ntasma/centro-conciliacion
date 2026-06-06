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
import { DollarSign, Plus } from 'lucide-react';
import { getIngresos, crearIngreso, eliminarIngreso } from '@/lib/db';
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

export default function IncomesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIncome, setNewIncome] = useState<Omit<Income, 'id'>>({
    caseId: '', caseType: '', amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    description: '', status: 'pendiente',
  });
  const { toast } = useToast();

  const fetchIncomes = async () => {
    try {
      setIsLoading(true);
      const data = await getIngresos();
      setIncomes(data);
    } catch (error) {
      console.warn('Error cargando ingresos:', error);
      setIncomes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchIncomes(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearIngreso(newIncome);
      toast({ title: 'Exito', description: 'Ingreso registrado correctamente' });
      setIsDialogOpen(false);
      setNewIncome({ caseId: '', caseType: '', amount: '', paymentDate: new Date().toISOString().split('T')[0], description: '', status: 'pendiente' });
      fetchIncomes();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo registrar el ingreso', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eliminarIngreso(id);
      setIncomes(incomes.filter(inc => inc.id !== id));
      toast({ title: 'Exito', description: 'Ingreso eliminado correctamente' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el ingreso', variant: 'destructive' });
    }
  };

  const filteredIncomes = incomes.filter(inc =>
    inc.caseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <p className="text-muted-foreground mt-2">Registra y gestiona los pagos de conciliacion</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Nuevo Ingreso</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
                  <DialogDescription>Registra un nuevo pago para un caso</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Caso</Label>
                    <Input placeholder="Conciliacion comercial" value={newIncome.caseType} onChange={(e) => setNewIncome({...newIncome, caseType: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto</Label>
                    <Input type="number" step="0.01" placeholder="0.00" value={newIncome.amount} onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Pago</Label>
                    <Input type="date" value={newIncome.paymentDate} onChange={(e) => setNewIncome({...newIncome, paymentDate: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripcion</Label>
                    <Input placeholder="Descripcion del pago" value={newIncome.description} onChange={(e) => setNewIncome({...newIncome, description: e.target.value})} required />
                  </div>
                  <Button type="submit" className="w-full"><DollarSign className="mr-2 h-4 w-4" />Registrar Ingreso</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Input placeholder="Buscar ingreso..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md" />

          <Card>
            <CardHeader>
              <CardTitle>Ingresos Registrados ({filteredIncomes.length})</CardTitle>
              <CardDescription>Todos los ingresos por casos de conciliacion</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Caso</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncomes.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No se encontraron ingresos</TableCell></TableRow>
                  ) : (
                    filteredIncomes.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell className="font-medium">{income.caseType}</TableCell>
                        <TableCell>${income.amount}</TableCell>
                        <TableCell>{new Date(income.paymentDate).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>{income.description}</TableCell>
                        <TableCell><Badge className={income.status === 'pagado' ? 'bg-green-600' : 'bg-yellow-600'}>{income.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(income.id)}><DollarSign className="h-4 w-4 text-destructive" /></Button>
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
