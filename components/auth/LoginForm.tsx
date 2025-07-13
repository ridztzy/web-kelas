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
import { login } from '@/lib/auth';
import { GraduationCap, Sun, Moon, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = login(email, password);
      if (user) {
        setUser(user);
        router.push('/dashboard');
      } else {
        setError('Email atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'ahmad.rizki@student.ac.id', role: 'Admin' },
    { email: 'siti.nur@student.ac.id', role: 'Ketua Kelas' },
    { email: 'budi.santoso@student.ac.id', role: 'Sekretaris' },
    { email: 'dewi.sartika@student.ac.id', role: 'Mahasiswa' }
  ];

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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@student.ac.id"
                required
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
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
              Password untuk semua akun: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">123456</code>
            </p>
            {demoAccounts.map((account, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{account.email}</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {account.role}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}