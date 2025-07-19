"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function MobileCard({ 
  title, 
  children, 
  className, 
  headerAction,
  padding = 'md' 
}: MobileCardProps) {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <Card className={cn(
      'mx-4 mb-4 shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl',
      className
    )}>
      {title && (
        <CardHeader className={cn(
          'pb-3',
          padding === 'none' ? 'px-4 pt-4' : paddingClasses[padding]
        )}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {headerAction}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        title ? 'pt-0' : '',
        padding === 'none' ? 'p-0' : paddingClasses[padding]
      )}>
        {children}
      </CardContent>
    </Card>
  );
}