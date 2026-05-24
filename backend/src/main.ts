import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Revertimos a una aplicación web completa para que el frontend pueda conectarse.
  const app = await NestFactory.create(AppModule);

  // Habilitamos CORS para permitir peticiones desde el frontend.
  app.enableCors();

  // Usar puerto dinámico desde variable de entorno o fallback a 3001
  const port = process.env.PORT || 3001;
  console.log(`Backend iniciando en puerto: ${port}`);
  
  // La aplicación escuchará en el puerto especificado.
  await app.listen(port);
}
bootstrap();
