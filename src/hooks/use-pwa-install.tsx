
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>;
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

interface PwaInstallContextType {
    isInstallable: boolean;
    triggerInstall: () => void;
}

const PwaInstallContext = createContext<PwaInstallContextType | null>(null);

export function PwaInstallProvider({ children }: { children: ReactNode }) {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        const handleAppInstalled = () => {
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const triggerInstall = useCallback(async () => {
        if (!deferredPrompt) {
            console.log("Installation not available.");
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the PWA installation prompt');
        } else {
            console.log('User dismissed the PWA installation prompt');
        }
        setDeferredPrompt(null);
        setIsInstallable(false);
    }, [deferredPrompt]);

    const value = { isInstallable, triggerInstall };

    return (
        <PwaInstallContext.Provider value={value}>
            {children}
        </PwaInstallContext.Provider>
    );
}

export function usePwaInstall() {
    const context = useContext(PwaInstallContext);
    if (!context) {
        throw new Error('usePwaInstall must be used within a PwaInstallProvider');
    }
    return context;
}

export function InstallPwaButton() {
    const { isInstallable, triggerInstall } = usePwaInstall();

    if (!isInstallable) {
        return null;
    }

    return (
        <Button onClick={triggerInstall} className="w-full mt-4">
            <Download className="mr-2 h-4 w-4" />
            Install App
        </Button>
    );
}
