'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsSubmitting(true);
      
      // Validación hardcodeada para sistema local
      if (data.username !== 'iustitiaetpax' || data.password !== 'admin') {
        throw new Error('Credenciales inválidas');
      }

      await login(data.username, data.password);
      
      toast({
        title: 'Éxito',
        description: 'Sesión iniciada correctamente',
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Usuario o contraseña incorrectos',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/iconjust.png" 
              alt="Iustitia Et Pax" 
              className="h-20 w-20 rounded-lg shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-white">Iustitia Et Pax</h1>
          <p className="text-blue-200">Sistema de Conciliación</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="text-white">
            <CardTitle className="text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-blue-200 text-center">
              Ingresa tus credenciales para acceder a la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="iustitiaetpax"
                  {...register('username')}
                  disabled={isSubmitting}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
                {errors.username && (
                  <p className="text-sm text-red-300">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="admin"
                  {...register('password')}
                  disabled={isSubmitting}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
                {errors.password && (
                  <p className="text-sm text-red-300">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
