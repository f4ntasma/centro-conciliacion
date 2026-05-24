'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { ReconciliationDetail } from '@/types';

export default function ReconciliationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [reconciliation, setReconciliation] = useState<ReconciliationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReconciliation = async () => {
      try {
        setIsLoading(true);
        // Mock data - replace with actual API call
        setReconciliation({
          id,
          name: 'Conciliación Banco Central - Marzo',
          description: 'Reconciliación mensual de transacciones',
          status: 'completed',
          createdAt: '2024-03-01',
          updatedAt: '2024-03-05',
          createdBy: 'Juan García',
          progress: 100,
          details: {
            totalRecords: 1250,
            matchedRecords: 1243,
            discrepancies: 7,
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReconciliation();
  }, [id]);

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

  if (!reconciliation) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-muted-foreground">Conciliación no encontrada</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const getStatusBadge = (status: ReconciliationDetail['status']) => {
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

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6 max-w-4xl">
          {/* Back Button */}
          <Link href="/reconciliations">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {reconciliation.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                {reconciliation.description}
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(reconciliation.status)}
            </div>
          </div>

          {/* Main Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-muted-foreground">Creada por</p>
                  <p className="text-lg font-medium mt-1">{reconciliation.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                  <p className="text-lg font-medium mt-1">
                    {new Date(reconciliation.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3">Progreso</p>
                <div className="space-y-2">
                  <Progress value={reconciliation.progress} className="h-3" />
                  <p className="text-sm font-medium">{reconciliation.progress}% completado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reconciliation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de Conciliación</CardTitle>
              <CardDescription>
                Estadísticas y resultados del proceso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total de Registros</p>
                  <p className="text-3xl font-bold mt-2">
                    {reconciliation.details.totalRecords}
                  </p>
                </div>
                <div className="border rounded-lg p-4 border-green-600/50 bg-green-50 dark:bg-green-950/20">
                  <p className="text-sm text-muted-foreground">Registros Coincidentes</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {reconciliation.details.matchedRecords}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {((reconciliation.details.matchedRecords / reconciliation.details.totalRecords) * 100).toFixed(1)}% coincidencia
                  </p>
                </div>
                <div className="border rounded-lg p-4 border-yellow-600/50 bg-yellow-50 dark:bg-yellow-950/20">
                  <p className="text-sm text-muted-foreground">Discrepancias</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {reconciliation.details.discrepancies}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {((reconciliation.details.discrepancies / reconciliation.details.totalRecords) * 100).toFixed(1)}% de discrepancias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Descargar Reporte
            </Button>
            <Button variant="outline">
              Exportar a Excel
            </Button>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
