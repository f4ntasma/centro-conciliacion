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
import { Receipt, Download, Plus, Search } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';

interface Invoice {
  id: string;
  number: string;
  client: string;
  concept: string;
  date: string;
  amount: string;
  status: 'pagada' | 'pendiente' | 'anulada';
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Estado para el formulario de nueva factura
  const [newInvoice, setNewInvoice] = useState<Omit<Invoice, 'id'>>({
    number: '',
    client: '',
    concept: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    status: 'pendiente',
  });

  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get<Invoice[]>('/casos/facturas');
      setInvoices(data);
    } catch (error) {
      console.warn('Backend no disponible:', error);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/casos/facturas', newInvoice);
      toast({
        title: 'Factura creada',
        description: 'La factura se ha guardado correctamente.',
      });
      setIsDialogOpen(false);
      // Resetear formulario
      setNewInvoice({
        number: '',
        client: '',
        concept: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        status: 'pendiente',
      });
      fetchInvoices();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear la factura.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pagada': return 'default';
      case 'pendiente': return 'secondary';
      case 'anulada': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestión de Honorarios</h1>
              <p className="text-muted-foreground mt-1">
                Cuentas de cobro y honorarios por conciliación
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Honorario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Honorarios</DialogTitle>
                  <DialogDescription>
                    Ingresa los detalles de la cuenta de cobro.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateInvoice} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        placeholder="FE-001"
                        required
                        value={newInvoice.number}
                        onChange={(e) => setNewInvoice({ ...newInvoice, number: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        required
                        value={newInvoice.date}
                        onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Input
                      id="client"
                      placeholder="Nombre del cliente o empresa"
                      required
                      value={newInvoice.client}
                      onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concept">Concepto / Descripción</Label>
                    <Input
                      id="concept"
                      placeholder="Ej: Honorarios audiencia conciliación..."
                      required
                      value={newInvoice.concept}
                      onChange={(e) => setNewInvoice({ ...newInvoice, concept: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Monto Total</Label>
                      <Input
                        id="amount"
                        placeholder="$ 0.00"
                        required
                        value={newInvoice.amount}
                        onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Estado</Label>
                      <Select
                        value={newInvoice.status}
                        onValueChange={(value: any) => setNewInvoice({ ...newInvoice, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="pagada">Pagada</SelectItem>
                          <SelectItem value="anulada">Anulada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Guardar Honorario
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Historial de Cuentas de Cobro</CardTitle>
                  <CardDescription>
                    Listado de honorarios generados recientemente
                  </CardDescription>
                </div>
                <div className="flex w-full md:w-auto items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cliente, número..."
                      className="pl-8 w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No hay facturas registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          {invoice.number}
                        </TableCell>
                        <TableCell>{invoice.client}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={invoice.concept}>{invoice.concept}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(invoice.status) as any} className="capitalize">
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" title="Descargar PDF">
                            <Download className="h-4 w-4" />
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
