'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/context/auth-context';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';

const profileSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Contraseña actual requerida'),
  newPassword: z.string().min(6, 'Nueva contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateProfile, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setIsUpdatingProfile(true);
      await updateProfile(data);
      toast({
        title: 'Éxito',
        description: 'Perfil actualizado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setIsUpdatingPassword(true);
      // Mock password change - replace with actual service call
      toast({
        title: 'Éxito',
        description: 'Contraseña actualizada correctamente',
      });
      resetPassword();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cambiar la contraseña',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (authIsLoading || !user) {
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

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6 max-w-2xl">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
            <p className="text-muted-foreground mt-2">
              Administra tu información personal y configuración
            </p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Perfil</CardTitle>
              <CardDescription>
                Actualiza tu información personal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Cambiar Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG o GIF. Máximo 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    {...registerProfile('name')}
                    disabled={isUpdatingProfile}
                  />
                  {profileErrors.name && (
                    <p className="text-sm text-destructive">{profileErrors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerProfile('email')}
                    disabled={isUpdatingProfile}
                  />
                  {profileErrors.email && (
                    <p className="text-sm text-destructive">{profileErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Rol</Label>
                  <div className="px-3 py-2 border rounded-md bg-muted">
                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Miembro desde</Label>
                  <div className="px-3 py-2 border rounded-md bg-muted">
                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Actualizando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Card */}
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...registerPassword('currentPassword')}
                    disabled={isUpdatingPassword}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...registerPassword('newPassword')}
                    disabled={isUpdatingPassword}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerPassword('confirmPassword')}
                    disabled={isUpdatingPassword}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Actualizando...
                    </>
                  ) : (
                    'Cambiar Contraseña'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
