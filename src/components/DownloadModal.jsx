import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDownloadModal } from "@/context/DownloadModalContext";
import AdBlock from '@/components/AdBlock';
import { FolderHeart as HandHeart, Coffee, Download, Loader2 } from 'lucide-react';

const DonationButton = ({ amount, onDonate }) => (
    <Button
        variant="outline"
        size="lg"
        className="flex-1 text-md border-primary/50 text-primary hover:bg-primary/10"
        onClick={() => onDonate(amount)}
    >
        ${amount}
    </Button>
);

const DownloadModal = () => {
    const { isModalOpen, hideModal, downloadInfo, confirmDownload } = useDownloadModal();
    const { toast } = useToast();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        let timer;
        if (isModalOpen) {
            setCountdown(10); 
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isModalOpen]);

    if (!isModalOpen || !downloadInfo) {
        return null;
    }

    const handleDonation = (amount) => {
        toast({
            title: "💖 ¡Muchas gracias por tu apoyo!",
            description: `Tu donación de $${amount} nos ayuda a seguir creando contenido increíble. (Esta es una simulación)`,
        });
    };

    const handleConfirm = () => {
        confirmDownload();
        hideModal();
    };

    const onOpenChange = (open) => {
        if (!open) {
            hideModal();
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gray-900 border-accent text-white p-0 max-w-md w-full">
                <DialogHeader className="p-6">
                    <DialogTitle className="text-2xl font-bold text-center gradient-text flex items-center justify-center gap-2">
                        <HandHeart className="w-7 h-7"/>
                        Apoya Nuestro Trabajo
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground text-sm pt-1">
                        Tu descarga estará disponible en segundos. ¡Considera apoyarnos!
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                         <AdBlock adKey="interstitial" />
                    </motion.div>
                </div>

                <div className="bg-background/20 px-6 py-6">
                     <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center gap-2">
                        <Coffee className="w-5 h-5 text-primary"/>
                        Invítanos a un café
                     </h3>
                     <div className="flex gap-3">
                        <DonationButton amount={1} onDonate={handleDonation} />
                        <DonationButton amount={5} onDonate={handleDonation} />
                        <DonationButton amount={10} onDonate={handleDonation} />
                     </div>
                </div>

                <DialogFooter className="p-6 bg-gray-900 flex flex-col gap-3">
                     <Button
                        onClick={handleConfirm}
                        disabled={countdown > 0}
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-md py-6 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {countdown > 0 ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {`Descarga gratuita en ${countdown}s`}
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5 mr-2" />
                                Descargar Gratis
                            </>
                        )}
                    </Button>
                     <DialogClose asChild>
                        <Button variant="ghost" size="sm" className="w-full">Cancelar</Button>
                     </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DownloadModal;