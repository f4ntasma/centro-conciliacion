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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Calendar as CalendarIcon,
  FileText,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  href?: string;
  trend?: string;
}

interface CalendarEvent {
  id: string;
  date: string; // Format YYYY-MM-DD
  title: string;
  type?: 'conciliacion' | 'notificacion';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados del Calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar datos en paralelo para mejor rendimiento
      const [casosReq, eventosReq] = await Promise.all([
        apiClient.get('/casos'),
        apiClient.get('/casos/eventos')
      ]);
      
      const casos = casosReq.data || [];
      const eventos = eventosReq.data || [];
      const activos = casos.filter((c: any) => c.estado === 'EN_PROCESO').length;

      // Actualizar estado de eventos
      setEvents(eventos);

      // Actualizar tarjetas de estadísticas
      setStats([
        {
          title: 'Conciliaciones Activas',
          value: activos,
          icon: <CheckSquare className="h-6 w-6" />,
          href: '/reconciliations',
          trend: 'En trámite',
        },
        {
          title: 'Documentos',
          value: 0, // Se conectará con endpoint de documentos cuando esté disponible
          icon: <FileText className="h-6 w-6" />,
          href: '/documents',
          trend: 'Total sistema',
        },
        {
          title: 'Agenda',
          value: eventos.length,
          icon: <Bell className="h-6 w-6" />,
          href: '/users',
          trend: 'Eventos programados',
        },
      ]);

      console.log('Datos cargados:', { casos: casos.length, eventos: eventos.length });

    } catch (error) {
      console.error('Error cargando dashboard:', error);
      toast({ 
        title: 'Error de carga', 
        description: 'No se pudieron cargar los datos del servidor', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lógica del Calendario
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleDateClick = (day: number) => {
    const newSelectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(newSelectedDate);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    try {
      const newEventData = {
        title: newEventTitle,
        date: formatDateStr(selectedDate),
        type: 'conciliacion',
      };

      const response = await apiClient.post('/casos/eventos', newEventData);
      const nuevoEvento = response.data;
      
      // Optimistic UI: agregar al estado local inmediatamente
      setEvents((prev) => [...prev, nuevoEvento]);
      
      toast({ title: 'Evento Agregado', description: 'Se ha guardado en la agenda.' });
      setNewEventTitle('');
      
      // Recargar para asegurar sincronización completa
      await loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar el evento', variant: 'destructive' });
      console.error('Error agregando evento:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await apiClient.delete(`/casos/eventos/${id}`);
      
      // Optimistic UI: remover del estado local inmediatamente
      setEvents((prev) => prev.filter((e) => e.id !== id));
      
      toast({ title: 'Eliminado', description: 'Evento eliminado correctamente.' });
      
      // Recargar datos para asegurar sincronización
      await loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el evento', variant: 'destructive' });
      // En caso de error, recargar para revertir cambios optimistic
      await loadData();
    }
  };

  const formatDateStr = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const daysInCurrentMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate); // 0 = Domingo
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className="text-primary">{stat.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                  {stat.href && stat.href !== '#' && (
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
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
