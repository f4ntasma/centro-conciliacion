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
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  date: string; // Format YYYY-MM-DD
  title: string;
  type?: 'conciliacion' | 'notificacion';
}

export default function CalendarPage() {
  // Estados del Calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/casos/eventos');
      const eventos = await response.json();
      setEvents(eventos || []);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los eventos del calendario',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
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

      const response = await fetch('/api/casos/eventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEventData),
      });
      
      if (!response.ok) {
        throw new Error('No se pudo guardar el evento');
      }
      
      const nuevoEvento = await response.json();
      
      // Optimistic UI: agregar al estado local inmediatamente
      setEvents((prev) => [...prev, nuevoEvento]);
      
      toast({ title: 'Evento Agregado', description: 'Se ha guardado en la agenda.' });
      setNewEventTitle('');
      
      // Recargar para asegurar sincronización completa
      await loadEvents();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar el evento', variant: 'destructive' });
      console.error('Error agregando evento:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await fetch(`/api/casos/eventos/${id}`, {
        method: 'DELETE',
      });
      
      // Optimistic UI: remover del estado local inmediatamente
      setEvents((prev) => prev.filter((e) => e.id !== id));
      
      toast({ title: 'Eliminado', description: 'Evento eliminado correctamente.' });
      
      // Recargar datos para asegurar sincronización
      await loadEvents();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el evento', variant: 'destructive' });
      // En caso de error, recargar para revertir cambios optimistic
      await loadEvents();
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
            <h1 className="text-3xl font-bold tracking-tight">Calendario de Conciliaciones</h1>
            <p className="text-muted-foreground mt-2">
              Organiza tus audiencias y notificaciones
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendario Completo
              </CardTitle>
              <CardDescription>
                Gestiona todos tus eventos de conciliación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Columna Izquierda: Calendario Visual */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
                      <div key={d} className="text-xs font-semibold text-muted-foreground py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-24 bg-muted/20 rounded-md" />
                    ))}
                    {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayEvents = events.filter((e) => e.date === dateStr);
                      const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();

                      return (
                        <div
                          key={day}
                          onClick={() => handleDateClick(day)}
                          className={`h-24 border rounded-md p-1 cursor-pointer transition-colors hover:bg-muted ${
                            isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
                              {day}
                            </span>
                            {dayEvents.length > 0 && (
                              <span className="h-2 w-2 rounded-full bg-red-500" />
                            )}
                          </div>
                          <div className="mt-1 space-y-1 overflow-hidden">
                            {dayEvents.map((evt) => (
                              <div key={evt.id} className="text-[10px] truncate bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded px-1 py-0.5">
                                {evt.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Columna Derecha: Detalles y Formulario */}
                <div className="w-full lg:w-80 space-y-6">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <h4 className="font-semibold mb-4">
                      Eventos para el {selectedDate.toLocaleDateString()}
                    </h4>
                    
                    <div className="space-y-3 mb-6">
                      {events.filter(e => e.date === formatDateStr(selectedDate)).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay eventos para este día.</p>
                      ) : (
                        events.filter(e => e.date === formatDateStr(selectedDate)).map(e => (
                          <div key={e.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md group">
                            <div className="flex items-center gap-2">
                              <CheckSquare className="h-4 w-4 text-primary" />
                              <span>{e.title}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteEvent(e.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleAddEvent} className="space-y-3 pt-4 border-t">
                      <Label htmlFor="event-title">Nuevo Evento</Label>
                      <Input 
                        id="event-title" 
                        placeholder="Ej: Audiencia Caso #505" 
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                      />
                      <Button type="submit" className="w-full" size="sm">
                        <Plus className="h-4 w-4 mr-2" /> Agendar
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
