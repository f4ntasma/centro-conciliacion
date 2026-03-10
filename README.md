# DocManage - Sistema de Gestión Documental y Conciliaciones

Una aplicación SaaS moderna construida con Next.js, React, TypeScript y TailwindCSS para gestionar documentos y realizar conciliaciones contables empresariales.

## 🚀 Características

### Autenticación y Seguridad
- Autenticación basada en JWT
- Gestión segura de sesiones con localStorage
- Interceptores Axios para manejo de tokens
- Rutas protegidas con validación de rol
- Recuperación automática de sesión al iniciar la app

### Dashboard
- Panel de control con estadísticas en tiempo real
- Tarjetas de métricas (usuarios, documentos, conciliaciones)
- Actividad reciente con categorización por tipo
- Interfaz intuitiva y responsiva

### Gestión de Usuarios
- CRUD completo de usuarios
- Búsqueda y filtrado en tiempo real
- Asignación de roles (Admin/Usuario)
- Tabla paginada con información detallada
- Eliminación de usuarios con confirmación

### Gestión de Documentos
- Subida de documentos (PDF, Excel, Word)
- Estados de procesamiento (Pendiente, Procesando, Completado, Error)
- Búsqueda y filtrado por estado y tipo
- Descarga de documentos
- Gestión de almacenamiento

### Conciliaciones
- Crear y gestionar conciliaciones
- Seguimiento de progreso con barras visuales
- Estados de conciliación (Borrador, En Progreso, Completada, Falló)
- Vista detallada con estadísticas
- Descarga de reportes

### Perfil de Usuario
- Actualización de información personal
- Cambio de contraseña seguro
- Avatar de usuario
- Información de membresía

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout raíz con proveedores
│   ├── page.tsx           # Página de redireccionamiento
│   ├── login/             # Página de inicio de sesión
│   ├── register/          # Página de registro
│   ├── dashboard/         # Panel de control
│   ├── users/             # Gestión de usuarios
│   ├── documents/         # Gestión de documentos
│   ├── reconciliations/   # Gestión de conciliaciones
│   │   ├── page.tsx       # Lista de conciliaciones
│   │   └── [id]/          # Vista detallada
│   └── profile/           # Perfil de usuario
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   ├── layout/            # Componentes de layout
│   │   ├── sidebar.tsx    # Barra lateral navegación
│   │   ├── navbar.tsx     # Barra superior
│   │   └── app-layout.tsx # Layout principal
│   └── protected-route.tsx # Componente de ruta protegida
├── context/
│   └── auth-context.tsx   # Contexto de autenticación global
├── services/              # Capas de servicios API
│   ├── auth.service.ts    # Servicio de autenticación
│   ├── user.service.ts    # Servicio de usuarios
│   ├── document.service.ts # Servicio de documentos
│   └── reconciliation.service.ts # Servicio de conciliaciones
├── lib/
│   ├── api-client.ts      # Cliente Axios configurado
│   └── utils.ts           # Utilidades generales
├── types/
│   └── index.ts           # Tipos TypeScript compartidos
└── hooks/
    ├── use-toast.ts       # Hook para notificaciones
    └── use-mobile.ts      # Hook para detectar dispositivo
```

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 con shadcn/ui
- **Estilos**: TailwindCSS 4
- **Formularios**: React Hook Form + Zod
- **HTTP**: Axios con interceptores
- **Estado**: Context API
- **Temas**: next-themes (Dark Mode)
- **TypeScript**: 5.7
- **Validación**: Zod

## 🔧 Instalación

### Requisitos previos
- Node.js 18+ 
- npm o pnpm
- Backend API NestJS ejecutándose en `http://localhost:3001`

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd docmanage
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. **Ejecutar el servidor de desarrollo**
   ```bash
   pnpm dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📚 Guía de Uso

### Autenticación
1. Abre `http://localhost:3000/login`
2. Ingresa credenciales (o regístrate primero)
3. El token JWT se almacena en localStorage automáticamente
4. Serás redireccionado al dashboard

### Flujo de Autenticación
- Login → Token almacenado en localStorage
- AuthContext verifica token al cargar
- Rutas protegidas redirigen si no hay token
- Cierre de sesión limpia localStorage y limpia contexto

### Agregar un Nuevo Servicio API

Crea un archivo en `services/`:

```typescript
// services/example.service.ts
import apiClient from '@/lib/api-client';

export const exampleService = {
  getItems: async () => {
    const { data } = await apiClient.get('/items');
    return data;
  },
};
```

### Crear una Página Protegida

```typescript
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/layout/app-layout';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        {/* Contenido */}
      </AppLayout>
    </ProtectedRoute>
  );
}
```

### Usar el Contexto de Autenticación

```typescript
import { useAuth } from '@/context/auth-context';

export function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <p>Bienvenido {user?.name}</p>}
    </div>
  );
}
```

## 🔐 Seguridad

### Buenas Prácticas Implementadas
- ✅ Tokens JWT en Authorization header
- ✅ Renovación automática de sesión
- ✅ Validación de roles en rutas protegidas
- ✅ Interceptor 401 para manejo de tokens expirados
- ✅ Validación con Zod en formularios
- ✅ Sanitización de entrada en búsquedas
- ✅ CORS configurado en backend

### Tipos de Rol
- **Admin**: Acceso completo a todas las funciones
- **User**: Acceso limitado según permisos

## 🎨 Personalización

### Cambiar Colores
Edita variables CSS en `app/globals.css`:
```css
:root {
  --primary: #3b82f6;
  --secondary: #10b981;
}
```

### Cambiar Logo
Reemplaza el texto "DocManage" en `components/layout/sidebar.tsx`

### Cambiar Tema
El tema oscuro está habilitado automáticamente basado en preferencias del sistema.

## 📊 Integraciones

### Conexión con Backend NestJS

El cliente espera que el backend exponga los siguientes endpoints:

**Autenticación**
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `GET /auth/me` - Obtener usuario actual
- `PATCH /auth/profile` - Actualizar perfil
- `POST /auth/logout` - Cerrar sesión

**Usuarios**
- `GET /users` - Listar usuarios (paginado)
- `GET /users/:id` - Obtener usuario
- `POST /users` - Crear usuario
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

**Documentos**
- `GET /documents` - Listar documentos
- `POST /documents/upload` - Subir documento
- `GET /documents/:id/download` - Descargar documento
- `DELETE /documents/:id` - Eliminar documento

**Conciliaciones**
- `GET /reconciliations` - Listar conciliaciones
- `GET /reconciliations/:id` - Obtener conciliación
- `POST /reconciliations` - Crear conciliación
- `PATCH /reconciliations/:id` - Actualizar conciliación

## 🚀 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura variables de entorno en dashboard
3. Deploy automático en push a main

### Otros Servicios

Consulta documentación de Next.js para deployment en Netlify, Railway, etc.

## 📦 Build para Producción

```bash
# Build optimizado
pnpm build

# Iniciar servidor de producción
pnpm start
```

## 🐛 Troubleshooting

### Error: "Cannot GET /api/..."
- Verifica que el backend está corriendo en puerto 3001
- Comprueba NEXT_PUBLIC_API_URL en .env.local

### Error: "Unauthorized (401)"
- Token expirado o inválido
- Intenta cerrar sesión y iniciar nuevamente
- Limpia localStorage y cookies

### Error: "CORS blocked"
- Configura CORS en backend NestJS
- Incluye `http://localhost:3000` en origen permitido

## 📝 Licencia

Proyecto privado - Derechos reservados

## 👥 Contribuciones

Para contribuir:
1. Crea una rama feature
2. Haz commit de cambios
3. Push y crea Pull Request

## 📞 Soporte

Para reportar bugs o sugerencias, abre un issue en el repositorio.

---

**Versión**: 1.0.0  
**Última actualización**: Marzo 2024
