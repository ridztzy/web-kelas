import { User } from './types';
import { users } from './data';

export const getCurrentUser = (): User | null => {
  // In a real application, this would check authentication tokens
  // For demo purposes, we'll return the first user
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  }
  return null;
};

export const login = (email: string, password: string): User | null => {
  // Simple demo authentication
  const user = users.find(u => u.email === email);
  if (user && password === '123456') {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = (): void => {
  localStorage.removeItem('currentUser');
};

export const hasPermission = (userRole: string, requiredRole: string[]): boolean => {
  return requiredRole.includes(userRole);
};