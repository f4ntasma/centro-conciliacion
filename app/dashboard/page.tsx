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
import { Spinner } from '@/components/ui/spinner';
import { Users, FileText, CheckSquare, Activity } from 'lucide-react';
import Link from 'next/link';

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  trend?: string;
}

interface Activity {
  id: string;
  type: 'document' | 'reconciliation' | 'user';
  title: string;
  description: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard stats
    const loadStats = async () => {
      try {
        // Mock data - replace with actual API call
        setStats([
          {
            title: 'Usuarios Totales',
            value: 24,
            icon: <Users className="h-6 w-6" />,
            href: '/users',
            trend: '+3 esta semana',
          },
          {
            title: 'Documentos',
            value: 156,
            icon: <FileText className="h-6 w-6" />,
            href: '/documents',
            trend: '+24 esta semana',
          },
          {
            title: 'Conciliaciones',
            value: 12,
            icon: <CheckSquare className="h-6 w-6" />,
            href: '/reconciliations',
            trend: '2 pendientes',
          },
          {
            title: 'Actividad Reciente',
            value: 48,
            icon: <Activity className="h-6 w-6" />,
            href: '#',
            trend: 'últimas 24 horas',
          },
        ]);

        setActivities([
          {
            id: '1',
            type: 'document',
            title: 'Documento subido',
            description: 'documento-ventas-2024.pdf',
            timestamp: 'Hace 2 horas',
          },
          {
            id: '2',
            type: 'reconciliation',
            title: 'Conciliación completada',
            description: 'Conciliación de marzo - Banco Central',
            timestamp: 'Hace 4 horas',
          },
          {
            id: '3',
            type: 'user',
            title: 'Usuario creado',
            description: 'juan@empresa.com',
            timestamp: 'Hace 1 día',
          },
          {
            id: '4',
            type: 'document',
            title: 'Documento procesado',
            description: 'registro-compras.xlsx',
            timestamp: 'Hace 2 días',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Bienvenido al sistema de gestión documental
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className="text-primary">{stat.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                  {stat.href !== '#' && (
                    <Link href={stat.href}>
                      <Button variant="ghost" size="sm" className="mt-4">
                        Ver detalles →
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimas actividades en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="mt-1">
                      {activity.type === 'document' && (
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      {activity.type === 'reconciliation' && (
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                      {activity.type === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
