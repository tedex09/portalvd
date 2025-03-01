"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSettingsStore } from '@/stores/settings';

const ALLOWED_PATHS = ['/login', '/admin', '/admin/settings', '/admin/users'];

export function PlatformGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (!settings.platformEnabled && !ALLOWED_PATHS.includes(pathname)) {
      router.push('/maintenance');
    }
  }, [settings.platformEnabled, pathname, router]);

  if (!settings.platformEnabled && !ALLOWED_PATHS.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Plataforma Offline</h1>
          <p className="text-lg text-muted-foreground">
            {settings.disabledMessage || "A plataforma está temporariamente indisponível para manutenção."}
          </p>
        </div>
      </div>
    );
  }

  return children;
}