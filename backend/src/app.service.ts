import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// Estructura básica para un caso en memoria (simulando persistencia local)
export interface Caso {
  id: number;
  solicitante: string;
  convocado: string;
  pretension: string;
  fechaRadicacion: Date;
  estado: 'INICIADO' | 'EN_PROCESO' | 'FINALIZADO';
}

export interface Factura {
  id: string;
  number: string;
  client: string;
  concept: string;
  date: string;
  amount: string;
  status: 'pagada' | 'pendiente' | 'anulada';
}

export interface EventoAgenda {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'conciliacion' | 'notificacion';
}

export interface Documento {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  uploadedBy: string;
  uploadedAt: string;
  filePath?: string;
}

@Injectable()
export class AppService implements OnModuleInit {
  private casos: Caso[] = [];
  private facturas: Factura[] = [];
  private eventos: EventoAgenda[] = [];
  private documentos: Documento[] = [];
  private readonly dbPath = path.join(process.cwd(), 'base-datos-conciliacion.json');

  // Al iniciar el módulo, cargamos los datos del archivo si existe
  onModuleInit() {
    console.log('Verificando base de datos en:', this.dbPath);
    if (fs.existsSync(this.dbPath)) {
      try {
        const data = fs.readFileSync(this.dbPath, 'utf-8');
        const raw = JSON.parse(data);
        
        // Migración simple: si el archivo era un array (versión vieja), lo movemos a la propiedad casos
        if (Array.isArray(raw)) {
          this.casos = raw;
        } else {
          this.casos = raw.casos || [];
          this.facturas = raw.facturas || [];
          this.eventos = raw.eventos || [];
          this.documentos = raw.documentos || [];
        }
        console.log(`Base de datos cargada: ${this.casos.length} casos, ${this.eventos.length} eventos, ${this.facturas.length} facturas, ${this.documentos.length} documentos`);
        console.log('Casos cargados:', this.casos);
      } catch (error) {
        console.error('Error cargando base de datos, iniciando nueva...:', error);
        this.crearBaseDatosVacia();
      }
    } else {
      console.log('No existe base de datos, creando nueva...');
      this.crearBaseDatosVacia();
    }
  }

  private crearBaseDatosVacia() {
    this.casos = [];
    this.facturas = [];
    this.eventos = [];
    this.documentos = [];
    this.guardarCambios();
    console.log('Base de datos vacía creada sin datos de prueba');
  }

  private guardarCambios() {
    try {
      const db = {
        casos: this.casos,
        facturas: this.facturas,
        eventos: this.eventos,
        documentos: this.documentos
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2));
      console.log('Datos guardados exitosamente en:', this.dbPath);
    } catch (error) {
      console.error('Error al guardar datos:', error);
      throw new Error('No se pudieron guardar los cambios');
    }
  }

  // --- Métodos para la API REST ---

  /**
   * Retorna todos los casos registrados.
   */
  getCasos(): Caso[] {
    return this.casos;
  }

  getCasoById(id: number): Caso {
    const caso = this.casos.find(c => c.id === id);
    if (!caso) {
      throw new NotFoundException(`Caso con ID "${id}" no encontrado.`);
    }
    return caso;
  }

  getFacturas(): Factura[] {
    return this.facturas;
  }

  getEventos(): EventoAgenda[] {
    return this.eventos;
  }

  getDocumentos(): Documento[] {
    return this.documentos;
  }

  crearDocumento(data: Omit<Documento, 'id'>): Documento {
    const nuevoDocumento: Documento = {
      id: Date.now().toString(),
      ...data,
    };
    this.documentos.push(nuevoDocumento);
    this.guardarCambios();
    console.log('Documento creado:', nuevoDocumento);
    return nuevoDocumento;
  }

  eliminarDocumento(id: string): boolean {
    const index = this.documentos.findIndex(d => d.id === id);
    if (index === -1) {
      throw new NotFoundException(`Documento con ID "${id}" no encontrado.`);
    }
    const documentoEliminado = this.documentos[index];
    this.documentos.splice(index, 1);
    this.guardarCambios();
    console.log('Documento eliminado:', documentoEliminado);
    return true;
  }

  crearFactura(data: Omit<Factura, 'id'>): Factura {
    const nuevaFactura: Factura = {
      id: Date.now().toString(),
      ...data,
    };
    this.facturas.push(nuevaFactura);
    this.guardarCambios();
    return nuevaFactura;
  }

  crearEvento(data: Omit<EventoAgenda, 'id'>): EventoAgenda {
    const nuevoEvento: EventoAgenda = {
      id: Date.now().toString(),
      ...data,
    };
    this.eventos.push(nuevoEvento);
    this.guardarCambios();
    console.log('Evento creado:', nuevoEvento);
    return nuevoEvento;
  }

  eliminarEvento(id: string): boolean {
    const index = this.eventos.findIndex(e => e.id === id);
    if (index !== -1) {
      const eventoEliminado = this.eventos[index];
      this.eventos.splice(index, 1);
      this.guardarCambios();
      console.log('Evento eliminado:', eventoEliminado);
      return true;
    }
    console.log('Evento no encontrado para eliminar:', id);
    return false;
  }

  /**
   * Radica un nuevo caso de conciliación.
   * @param data - Datos del nuevo caso.
   */
  radicarCaso(data: { solicitante: string; convocado: string; pretension: string }): Caso {
    console.log('Creando nuevo caso con datos:', data);
    console.log('Casos actuales antes de crear:', this.casos.length);
    
    const nuevoCaso: Caso = {
      id: this.casos.length > 0 ? Math.max(...this.casos.map(c => c.id)) + 1 : 1,
      solicitante: data.solicitante,
      convocado: data.convocado,
      pretension: data.pretension,
      fechaRadicacion: new Date(),
      estado: 'INICIADO',
    };
    
    this.casos.push(nuevoCaso);
    console.log('Caso creado exitosamente:', nuevoCaso);
    console.log('Total casos después de crear:', this.casos.length);
    
    this.guardarCambios();
    return nuevoCaso;
  }

  /**
   * Cambia el estado de un caso.
   * @param id - El ID del caso.
   * @param nuevoEstado - Nuevo estado del caso.
   */
  cambiarEstado(id: number, nuevoEstado: 'INICIADO' | 'EN_PROCESO' | 'FINALIZADO'): Caso {
    const caso = this.casos.find(c => c.id === id);
    if (!caso) {
      throw new NotFoundException(`Caso con ID "${id}" no encontrado.`);
    }

    caso.estado = nuevoEstado;
    this.guardarCambios();
    return caso;
  }

  /**
   * Elimina un caso por su ID.
   */
  eliminarCaso(id: number): boolean {
    const index = this.casos.findIndex(c => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Caso con ID "${id}" no encontrado.`);
    }
    this.casos.splice(index, 1);
    this.guardarCambios();
    return true;
  }
}
