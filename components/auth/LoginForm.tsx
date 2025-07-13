"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { loginWithNIM, testSupabaseConnection } from '@/lib/auth-supabase';
import { GraduationCap, Sun, Moon, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const { setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const testConnection = async () => {
    if (connectionTested) return;
    
    try {
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        setError('Koneksi ke database bermasalah. Silakan coba lagi.');
      }
      setConnectionTested(true);
    } catch (error) {
      console.error('Connection test error:', error);
      setError('Gagal menguji koneksi database.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Test connection first
    await testConnection();

    try {
      console.log('Attempting login with NIM:', nim);
      
      const result = await loginWithNIM(nim, password);
      
      console.log('Login result:', result);
      
      if (result.user) {
        console.log('Login successful, setting user:', result.user);
        setUser(result.user);
        router.push('/dashboard');
      } else {
        console.error('Login failed:', result.error);
        setError(result.error || 'NIM atau password salah');
      }
    } catch (err) {
      console.error('Login exception:', err);
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { nim: '2021001', role: 'Admin', password: '123456' },
    { nim: '2021002', role: 'Ketua Kelas', password: '123456' },
    { nim: '2021003', role: 'Sekretaris', password: '123456' },
    { nim: '2021004', role: 'Mahasiswa', password: '123456' }
  ];

  const handleDemoLogin = async (demoNim: string) => {
    setNim(demoNim);
    setPassword('123456');
    
    // Auto submit after setting values
    setTimeout(async () => {
      setError('');
      setIsLoading(true);

      try {
        const result = await loginWithNIM(demoNim, '123456');
        
        if (result.user) {
          setUser(result.user);
          router.push('/dashboard');
        } else {
          setError(result.error || 'Login demo gagal');
        }
      } catch (err) {
        console.error('Demo login error:', err);
        setError('Terjadi kesalahan saat login demo');
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center space-x-2">
          <GraduationCap className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sistem Kelas
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manajemen Kelas Ilmu Komputer
        </p>
      </div>

      <Card className="glass-effect">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nim">NIM</Label>
              <Input
                id="nim"
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="2021001"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-sm">Demo Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Klik tombol "Login" untuk login otomatis dengan akun demo
            </p>
            {demoAccounts.map((account, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">NIM: {account.nim}</span>
                  <span className="text-xs text-gray-500">Password: {account.password}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {account.role}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin(account.nim)}
                    disabled={isLoading}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Login
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}