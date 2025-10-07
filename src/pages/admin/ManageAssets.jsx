
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Trash2, Copy, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { listSiteAssets, deleteSiteAsset, uploadSiteAsset } from '@/lib/supabase/assets';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ManageAssets = () => {
    const { toast } = useToast();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        const { data, error } = await listSiteAssets();
        if (error) {
            toast({ title: 'Error al cargar archivos', description: error.message, variant: 'destructive' });
        } else {
            setAssets(data || []);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        const filePath = `${Date.now()}-${file.name}`;
        const url = await uploadSiteAsset(file, filePath);

        if (url) {
            toast({ title: 'Archivo subido', description: 'El archivo se ha subido correctamente.' });
            fetchAssets();
        } else {
            toast({ title: 'Error al subir', description: 'No se pudo subir el archivo.', variant: 'destructive' });
        }
        setUploading(false);
        event.target.value = '';
    };

    const handleDelete = async (assetName) => {
        const { error } = await deleteSiteAsset(assetName);
        if (error) {
            toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Archivo eliminado', description: 'El archivo ha sido eliminado.' });
            fetchAssets();
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copiado', description: 'URL copiada al portapapeles.' });
    };

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAssetUrl = (assetName) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        return `${supabaseUrl}/storage/v1/object/public/site-assets/${assetName}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-8"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold">Gestionar Archivos</h2>
                <Button asChild className="cursor-pointer">
                    <label htmlFor="asset-upload">
                        <Upload className="mr-2 h-4 w-4" /> {uploading ? 'Subiendo...' : 'Subir Archivo'}
                    </label>
                </Button>
                <Input
                    id="asset-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                />
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre de archivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-input border-border"
                />
            </div>

            {loading ? (
                <p>Cargando archivos...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredAssets.length > 0 ? filteredAssets.map((asset) => (
                            <motion.div
                                key={asset.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="glass-effect rounded-lg overflow-hidden group"
                            >
                                <div className="h-40 bg-background/50 flex items-center justify-center p-2">
                                    {asset.metadata && asset.metadata.mimetype && asset.metadata.mimetype.startsWith('image/') ? (
                                        <img
                                            src={getAssetUrl(asset.name)}
                                            alt={asset.name}
                                            className="max-h-full max-w-full object-contain"
                                         />
                                    ) : (
                                        <p className="text-center text-sm text-gray-400 break-all p-2">{asset.name}</p>
                                    )}
                                </div>
                                <div className="p-4">
                                    <p className="text-sm font-semibold truncate" title={asset.name}>{asset.name}</p>
                                    <p className="text-xs text-gray-400">{asset.metadata ? `${(asset.metadata.size / 1024).toFixed(2)} KB` : 'N/A'}</p>
                                    <div className="flex gap-2 mt-4">
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => copyToClipboard(getAssetUrl(asset.name))}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="destructive" className="h-8 w-8">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción es irreversible y eliminará permanentemente el archivo "{asset.name}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(asset.name)}>Eliminar</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-gray-400 col-span-full text-center py-10"
                            >
                                No se encontraron archivos.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default ManageAssets;
