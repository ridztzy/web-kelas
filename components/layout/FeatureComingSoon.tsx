// Lokasi: components/layout/FeatureComingSoon.tsx

import { ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const FeatureComingSoon = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-full p-4 sm:p-8">
      <Card className="w-full max-w-lg text-center shadow-lg border-dashed border-primary/50 bg-background">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <ShieldAlert className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">
            Fitur Ini Belum Tersedia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Kami sedang bekerja keras untuk menyiapkan fitur ini untuk Anda. Mohon bersabar dan nantikan pembaruan selanjutnya!
          </p>
          <Button onClick={() => router.back()}>
            Kembali ke Halaman Sebelumnya
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureComingSoon;