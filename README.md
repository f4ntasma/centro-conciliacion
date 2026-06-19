# Sistema de Gestión Documental y Conciliaciones

Una aplicación SaaS moderna construida con Next.js, React, TypeScript y TailwindCSS para gestionar documentos y realizar conciliaciones contables empresariales.


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

### Cambiar Logo
Reemplaza el texto "DocManage" en `components/layout/sidebar.tsx`

### Cambiar Tema
El tema oscuro está habilitado automáticamente basado en preferencias del sistema.

## 📊 Integraciones

### Conexión con Backend NestJS

### Otros Servicios

Consulta documentación de Next.js para deployment en Netlify, Railway, etc.

## 📝 Licencia

Proyecto privado - Derechos reservados

---

**Versión**: 1.0.0  
**Última actualización**: Marzo 2024
