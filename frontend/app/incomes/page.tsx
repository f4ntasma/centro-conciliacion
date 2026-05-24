'use client';

import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Plus, Search } from 'lucide-react';
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
  
  // Estado para el formulario de nuevo ingreso
  const [newIncome, setNewIncome] = useState<Omit<Income, 'id'>>({
    caseId: '',
    caseType: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    description: '',
    status: 'pendiente',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      setIsLoading(true);
      // Por ahora, mostrar lista vacía hasta conectar con backend
      setIncomes([]);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los ingresos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const income: Income = {
        id: Date.now().toString(),
        ...newIncome,
      };

      setIncomes([income, ...incomes]);
      toast({
        title: 'Éxito',
        description: 'Ingreso registrado correctamente',
      });
      setIsDialogOpen(false);
      setNewIncome({
        caseId: '',
        caseType: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        description: '',
        status: 'pendiente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo registrar el ingreso',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIncomes(incomes.filter(inc => inc.id !== id));
      toast({
        title: 'Éxito',
        description: 'Ingreso eliminado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el ingreso',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: Income['status']) => {
    switch (status) {
      case 'pagado':
        return <Badge className="bg-green-600">Pagado</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-600">Pendiente</Badge>;
    }
  };

  const filteredIncomes = incomes.filter(inc => {
    const matchesSearch = inc.caseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
              <h1 className="text-3xl font-bold tracking-tight">Ingresos por Casos</h1>
              <p className="text-muted-foreground mt-2">
                Registra y gestiona los pagos de conciliación
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Ingreso
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo pago para un caso de conciliación
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="caseType">Tipo de Caso</Label>
                    <Input
                      id="caseType"
                      placeholder="Ej: Conciliación comercial"
                      value={newIncome.caseType}
                      onChange={(e) => setNewIncome({...newIncome, caseType: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Fecha de Pago</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={newIncome.paymentDate}
                      onChange={(e) => setNewIncome({...newIncome, paymentDate: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      placeholder="Descripción del pago"
                      value={newIncome.description}
                      onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Registrar Ingreso
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Buscar ingreso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Incomes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ingresos Registrados ({filteredIncomes.length})</CardTitle>
              <CardDescription>
                Todos los ingresos por casos de conciliación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Caso</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncomes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No se encontraron ingresos
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredIncomes.map((income) => (
                        <TableRow key={income.id}>
                          <TableCell className="font-medium">{income.caseType}</TableCell>
                          <TableCell>${income.amount}</TableCell>
                          <TableCell>
                            {new Date(income.paymentDate).toLocaleDateString('es-ES')}
                          </TableCell>
                          <TableCell>{income.description}</TableCell>
                          <TableCell>{getStatusBadge(income.status)}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(income.id)}
                            >
                              <DollarSign className="h-4 w-4 text-destructive" />
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
