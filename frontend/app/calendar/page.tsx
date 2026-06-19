'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, CheckSquare, ChevronLeft, ChevronRight, Plus, Trash2, CalendarPlus } from 'lucide-react';
import { getEventos, crearEvento, eliminarEvento } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type?: 'conciliacion' | 'notificacion';
  time?: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventos = await getEventos();
      setEvents(eventos || []);
    } catch (error) {
      console.warn('Error cargando eventos:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDateStr = (date: Date) => date.toISOString().split('T')[0];

  const changeMonth = (offset: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + offset);
    setCurrentDate(d);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    try {
      const nuevoEvento = await crearEvento({ title: newEventTitle, date: formatDateStr(selectedDate), type: 'conciliacion', time: newEventTime || undefined });
      setEvents((prev) => [...prev, nuevoEvento]);
      toast({
        title: 'Evento Agregado',
        description: (
          <span>
            Guardado en la agenda.{' '}
            <a
              href={buildGoogleCalendarUrl(nuevoEvento)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium text-blue-500"
            >
              Agregar a Google Calendar
            </a>
          </span>
        ) as any,
      });
      setNewEventTitle('');
      setNewEventTime('');
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar el evento', variant: 'destructive' });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await eliminarEvento(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast({ title: 'Eliminado', description: 'Evento eliminado correctamente.' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el evento', variant: 'destructive' });
    }
  };

  const buildGoogleCalendarUrl = (event: CalendarEvent): string => {
    // Construir fechas en formato YYYYMMDDTHHmmSSZ para Google Calendar
    const [year, month, day] = event.date.split('-').map(Number);
    let startDate: string;
    let endDate: string;

    if (event.time) {
      const [hours, minutes] = event.time.split(':').map(Number);
      const start = new Date(year, month - 1, day, hours, minutes);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hora por defecto
      const fmt = (d: Date) =>
        `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}00`;
      startDate = fmt(start);
      endDate = fmt(end);
    } else {
      // Evento de todo el día
      const fmt = (y: number, m: number, d: number) =>
        `${y}${String(m).padStart(2,'0')}${String(d).padStart(2,'0')}`;
      startDate = fmt(year, month, day);
      const nextDay = new Date(year, month - 1, day + 1);
      endDate = fmt(nextDay.getFullYear(), nextDay.getMonth() + 1, nextDay.getDate());
    }

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: `Tipo: ${event.type === 'notificacion' ? 'Notificación' : 'Conciliación'}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const daysInCurrentMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  if (isLoading) {
    return (
      <ProtectedRoute><AppLayout>
        <div className="flex items-center justify-center min-h-screen"><Spinner className="h-8 w-8" /></div>
      </AppLayout></ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendario de Conciliaciones</h1>
            <p className="text-muted-foreground mt-2">Organiza tus audiencias y notificaciones</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5" />Calendario Completo</CardTitle>
              <CardDescription>Gestiona todos tus eventos de conciliación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" onClick={() => changeMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((d) => (
                      <div key={d} className="text-xs font-semibold text-muted-foreground py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-24 bg-muted/20 rounded-md" />
                    ))}
                    {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                      const dayEvents = events.filter((e) => e.date === dateStr);
                      const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
                      return (
                        <div key={day} onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                          className={`h-24 border rounded-md p-1 cursor-pointer transition-colors hover:bg-muted ${isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : ''}`}>
                          <div className="flex justify-between items-start">
                            <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>{day}</span>
                            {dayEvents.length > 0 && <span className="h-2 w-2 rounded-full bg-red-500" />}
                          </div>
                          <div className="mt-1 space-y-1 overflow-hidden">
                            {dayEvents.map((evt) => (
                              <div key={evt.id} className="text-[10px] truncate bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded px-1 py-0.5">
                                {evt.time && <span className="font-semibold mr-1">{evt.time}</span>}{evt.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="w-full lg:w-80 space-y-6">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <h4 className="font-semibold mb-4">Eventos para el {selectedDate.toLocaleDateString()}</h4>
                    <div className="space-y-3 mb-6">
                      {events.filter(e => e.date === formatDateStr(selectedDate)).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay eventos para este día.</p>
                      ) : (
                        events.filter(e => e.date === formatDateStr(selectedDate)).map(e => (
                          <div key={e.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md group">
                            <div className="flex items-center gap-2">
                              <CheckSquare className="h-4 w-4 text-primary" />
                              <div>
                                <span>{e.title}</span>
                                {e.time && <span className="block text-xs text-muted-foreground">{e.time}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title="Agregar a Google Calendar"
                                onClick={() => window.open(buildGoogleCalendarUrl(e), '_blank')}
                              >
                                <CalendarPlus className="h-3 w-3 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteEvent(e.id)}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <form onSubmit={handleAddEvent} className="space-y-3 pt-4 border-t">
                      <Label htmlFor="event-title">Nuevo Evento</Label>
                      <Input id="event-title" placeholder="Ej: Audiencia Caso #505" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} />
                      <Label htmlFor="event-time">Hora: (darle click en el reloj para agregar hora)</Label>
                      <Input id="event-time" type="time" value={newEventTime} onChange={(e) => setNewEventTime(e.target.value)} />
                      <Button type="submit" className="w-full" size="sm"><Plus className="h-4 w-4 mr-2" /> Agendar</Button>
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
