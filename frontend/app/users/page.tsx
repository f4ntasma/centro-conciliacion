'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  date: string; // Format YYYY-MM-DD
  title: string;
  time: string;
  type: 'conciliacion' | 'notificacion';
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Datos de ejemplo iniciales
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      title: 'Audiencia Caso #102 - Pérez vs Gómez',
      time: '09:00',
      type: 'conciliacion'
    },
    {
      id: '2',
      date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
      title: 'Enviar Citación - Caso #105',
      time: '14:30',
      type: 'notificacion'
    }
  ]);

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventType, setNewEventType] = useState<'conciliacion' | 'notificacion'>('conciliacion');
  
  const { toast } = useToast();

  // --- Lógica del Calendario ---
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleDateClick = (day: number) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newSelectedDate);
  };

  const formatDateStr = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // --- Gestión de Eventos ---
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventTime.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor completa el título y la hora.',
        variant: 'destructive',
      });
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: formatDateStr(selectedDate),
      title: newEventTitle,
      time: newEventTime,
      type: newEventType,
    };

    setEvents([...events, newEvent]);
    setNewEventTitle('');
    setNewEventTime('');
    
    toast({
      title: 'Agendado',
      description: 'Evento guardado en el calendario.',
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    toast({
      title: 'Eliminado',
      description: 'El evento ha sido removido.',
    });
  };

  // --- Renderizado ---
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const selectedDateStr = formatDateStr(selectedDate);
  const selectedDateEvents = events.filter(e => e.date === selectedDateStr);

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Encabezado */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Agenda de Conciliaciones</h1>
              <p className="text-muted-foreground mt-2">
                Organiza audiencias y notificaciones pendientes
              </p>
            </div>
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="font-semibold min-w-[150px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            
            {/* Columna Izquierda: Calendario Grande */}
            <Card className="lg:col-span-2 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Vista Mensual
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-7 gap-1 h-full grid-rows-[auto_1fr]">
                  {/* Días de la semana */}
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div key={day} className="text-center font-medium py-2 text-muted-foreground border-b">
                      {day}
                    </div>
                  ))}
                  
                  {/* Cuadrícula de días */}
                  <div className="col-span-7 grid grid-cols-7 gap-1 mt-2 auto-rows-fr">
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`empty-${i}`} className="bg-muted/10 rounded-md" />
                    ))}
                    
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayEvents = events.filter(e => e.date === dateStr);
                      const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();

                      return (
                        <div
                          key={day}
                          onClick={() => handleDateClick(day)}
                          className={`
                            border rounded-md p-2 cursor-pointer transition-all relative group
                            ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}
                          `}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                              {day}
                            </span>
                            {dayEvents.length > 0 && (
                              <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                {dayEvents.length}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                            {dayEvents.map((evt) => (
                              <div 
                                key={evt.id} 
                                className={`text-[10px] truncate px-1.5 py-0.5 rounded border-l-2 ${
                                  evt.type === 'conciliacion' 
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20' 
                                    : 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/20'
                                }`}
                                title={evt.title}
                              >
                                {evt.time} {evt.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Columna Derecha: Panel de Detalles */}
            <Card className="flex flex-col h-full">
              <CardHeader className="bg-muted/50 pb-4">
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </CardTitle>
                <CardDescription>
                  {selectedDateEvents.length} eventos programados
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-hidden flex flex-col gap-4 pt-4">
                {/* Lista de Eventos */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>No hay eventos para este día.</p>
                      <p className="text-xs mt-1">Utiliza el formulario para agregar uno.</p>
                    </div>
                  ) : (
                    selectedDateEvents.map((evt) => (
                      <div key={evt.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow group">
                        <div className={`mt-0.5 p-1.5 rounded-full ${
                          evt.type === 'conciliacion' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {evt.type === 'conciliacion' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{evt.title}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3 mr-1" />
                            {evt.time}
                            <span className="mx-1">•</span>
                            <span className="capitalize">{evt.type}</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteEvent(evt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulario de Agregar */}
                <div className="border-t pt-4 mt-auto">
                  <h4 className="font-semibold text-sm mb-3">Agregar a la agenda</h4>
                  <form onSubmit={handleAddEvent} className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <Label htmlFor="event-type" className="sr-only">Tipo</Label>
                        <select
                          id="event-type"
                          value={newEventType}
                          onChange={(e) => setNewEventType(e.target.value as any)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="conciliacion">Conciliación</option>
                          <option value="notificacion">Notificación</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="event-time" className="sr-only">Hora</Label>
                        <Input
                          id="event-time"
                          type="time"
                          value={newEventTime}
                          onChange={(e) => setNewEventTime(e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="event-title" className="sr-only">Título</Label>
                      <Input
                        id="event-title"
                        placeholder="Descripción del evento..."
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <Button type="submit" className="w-full" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Agendar Evento
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
