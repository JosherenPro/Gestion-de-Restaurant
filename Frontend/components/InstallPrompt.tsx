import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Card } from './UI';

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-500">
            <Card className="bg-[#03081F] text-white p-4 shadow-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <Download className="w-6 h-6 text-[#FC8A06]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Installer l'application</h3>
                        <p className="text-xs text-white/60">Pour une meilleure expérience</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleInstallClick}
                        className="bg-[#FC8A06] hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                        Installer
                    </button>
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-white/60" />
                    </button>
                </div>
            </Card>
        </div>
    );
};
