import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AppService, type Caso, type Factura, type EventoAgenda, type Documento } from './app.service';

// DTO para la creación de un nuevo caso
class CreateCasoDto {
  solicitante: string;
  convocado: string;
  pretension: string;
}

// DTO para cambiar estado de caso
class CambiarEstadoDto {
  estado: 'INICIADO' | 'EN_PROCESO' | 'FINALIZADO';
}

// DTO para facturas
class CreateFacturaDto {
  number: string;
  client: string;
  concept: string;
  date: string;
  amount: string;
  status: 'pagada' | 'pendiente' | 'anulada';
}

// DTO para eventos de agenda
class CreateEventoDto {
  title: string;
  date: string;
  type: 'conciliacion' | 'notificacion';
}

// DTO para documentos
class CreateDocumentoDto {
  name: string;
  type: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  uploadedBy: string;
  uploadedAt: string;
  filePath?: string;
}

@Controller('api/casos')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // --- Rutas de Facturas ---
  // Las definimos PRIMERO para evitar conflictos con rutas genéricas
  @Get('facturas')
  getFacturas(): Factura[] {
    return this.appService.getFacturas();
  }

  @Post('facturas')
  crearFactura(@Body() dto: CreateFacturaDto): Factura {
    return this.appService.crearFactura(dto);
  }

  // --- Rutas de Agenda (Calendario) ---
  @Get('eventos')
  getEventos(): EventoAgenda[] {
    return this.appService.getEventos();
  }

  @Post('eventos')
  crearEvento(@Body() dto: CreateEventoDto): EventoAgenda {
    return this.appService.crearEvento(dto);
  }

  @Delete('eventos/:id')
  eliminarEvento(@Param('id') id: string) {
    return this.appService.eliminarEvento(id);
  }

  // --- Rutas de Documentos ---
  @Get('documentos')
  getDocumentos(): Documento[] {
    return this.appService.getDocumentos();
  }

  @Post('documentos')
  crearDocumento(@Body() dto: CreateDocumentoDto): Documento {
    return this.appService.crearDocumento(dto);
  }

  @Delete('documentos/:id')
  eliminarDocumento(@Param('id') id: string) {
    return this.appService.eliminarDocumento(id);
  }

  // --- Rutas de Casos ---
  @Get()
  getCasos(): Caso[] {
    return this.appService.getCasos();
  }

  @Get(':id')
  getCasoById(@Param('id') id: string): Caso {
    return this.appService.getCasoById(Number(id));
  }

  @Post()
  radicarCaso(@Body() createCasoDto: CreateCasoDto): Caso {
    return this.appService.radicarCaso(createCasoDto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body() cambiarEstadoDto: CambiarEstadoDto,
  ): Caso {
    return this.appService.cambiarEstado(Number(id), cambiarEstadoDto.estado);
  }

  @Delete(':id')
  eliminarCaso(@Param('id') id: string) {
    return this.appService.eliminarCaso(Number(id));
  }
}
