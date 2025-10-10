import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { useAd } from '@/context/AdContext';
import { Button } from '@/components/ui/button';
import { getAdsConfig } from '@/lib/ads';
import parse from 'html-react-parser';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

const InterstitialAd = () => {
    const adContext = useAd();
    const [countdown, setCountdown] = useState(5);
    const [adConfig, setAdConfig] = useState(null);

    useEffect(() => {
        const config = getAdsConfig();
        setAdConfig(config.interstitial);
    }, []);

    const { isAdVisible, hideAd, navigateToUrl } = adContext || {};

    useEffect(() => {
        if (!isAdVisible || !adContext) return;

        let timer;
        if (adConfig?.visible) {
            const adCountdown = adConfig.countdown || 5;
            setCountdown(adCountdown);
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (adConfig !== null) {
            hideAd();
            navigateToUrl();
        }

        return () => clearInterval(timer);
    }, [isAdVisible, adConfig, adContext, hideAd, navigateToUrl]);

    if (!adContext) {
        return null;
    }
    
    const handleSkip = () => {
        hideAd();
        navigateToUrl();
    };

    const onOpenChange = (open) => {
        if (!open) {
            handleSkip();
        }
    };
    
    const shouldBeOpen = isAdVisible && !!adConfig?.visible;

    return (
        <Dialog open={shouldBeOpen} onOpenChange={onOpenChange}>
            <DialogContent 
              showCloseButton={false} 
              className={cn(
                "bg-gray-800 border-2 border-yellow-400 text-center",
                "p-4 sm:p-8",
                "w-[95vw] sm:max-w-lg" // Ancho responsivo
              )}
            >
                <DialogHeader>
                  <DialogTitle className="text-2xl sm:text-3xl font-bold text-white">Un Anuncio Antes de Continuar</DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-2">
                    Gracias por tu paciencia. El contenido se mostrará en breve.
                  </DialogDescription>
                </DialogHeader>
                 <div className="absolute top-4 right-4">
                        {countdown > 0 ? (
                            <div className="flex items-center gap-2 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm">
                                <Loader className="w-4 h-4 animate-spin" />
                                <span>{countdown}</span>
                            </div>
                        ) : (
                            <Button variant="ghost" size="icon" onClick={handleSkip} className="rounded-full hover:bg-white/10">
                                <X className="w-6 h-6" />
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-6 mt-8">
                        <div
                            className="w-full bg-gray-700 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center"
                            style={{ 
                                maxWidth: adConfig?.width ? `${adConfig.width}px` : '100%', 
                                height: adConfig?.height ? `${adConfig.height}px` : '256px', 
                                margin: '0 auto' 
                            }}
                        >
                            {adConfig?.code ? parse(adConfig.code) : <p className="text-gray-400">Simulación de anuncio</p>}
                        </div>
                        <Button
                            onClick={handleSkip}
                            disabled={countdown > 0}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg py-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {countdown > 0 ? `Continuar en ${countdown}...` : 'Saltar Anuncio y Continuar'}
                        </Button>
                    </div>
            </DialogContent>
        </Dialog>
    );
};

export default InterstitialAd;