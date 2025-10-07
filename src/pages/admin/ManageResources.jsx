import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Database, Server, HardDrive, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StatCard = ({ title, value, icon, status, unit }) => {
    const statusColor = status === 'ok' ? 'text-green-400' : 'text-yellow-400';
    const StatusIcon = status === 'ok' ? CheckCircle : AlertTriangle;

    return (
        <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                    {React.createElement(icon, { className: "w-6 h-6 text-primary" })}
                    {title}
                </h3>
                <div className={`flex items-center gap-2 text-sm ${statusColor}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span>{status === 'ok' ? 'Operacional' : 'Advertencia'}</span>
                </div>
            </div>
            <p className="text-4xl font-bold text-white">{value} <span className="text-2xl text-gray-400">{unit}</span></p>
        </div>
    );
};

const FunctionCard = ({ name, status }) => {
    const statusColor = status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500';
    return (
        <div className="bg-background/50 p-4 rounded-lg flex justify-between items-center">
            <p className="font-mono text-white">{name}</p>
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
                <span className="text-sm text-gray-300">{status}</span>
            </div>
        </div>
    );
};

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ManageResources = () => {
    const { toast } = useToast();
    const { session } = useAuth();
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchHealthData = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('system-health');
            if (error) throw error;
            setHealthData(data);
        } catch (error) {
            toast({ title: 'Error al cargar el estado del sistema', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [session, toast]);

    useEffect(() => {
        fetchHealthData();
    }, [fetchHealthData]);

    const dbSize = healthData?.database?.size || 'N/A';
    const storageSize = healthData?.storage?.size ? formatBytes(healthData.storage.size) : 'N/A';
    const functions = healthData?.functions?.list || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold">Herramientas de Recursos</h2>
                <Button onClick={fetchHealthData} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </div>

            {loading && !healthData ? (
                <p className="text-center text-muted-foreground">Cargando estado del sistema...</p>
            ) : healthData ? (
                <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <StatCard
                            title="Base de Datos"
                            value={dbSize.split(' ')[0]}
                            unit={dbSize.split(' ')[1]}
                            icon={Database}
                            status={healthData.database.status}
                        />
                        <StatCard
                            title="Almacenamiento"
                            value={storageSize.split(' ')[0]}
                            unit={storageSize.split(' ')[1]}
                            icon={HardDrive}
                            status={healthData.storage.status}
                        />
                    </div>

                    <div className="glass-effect p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2 mb-4">
                            <Server className="w-6 h-6 text-primary" />
                            Funciones del Servidor (Edge Functions)
                        </h3>
                        <div className="space-y-3">
                            {functions.length > 0 ? (
                                functions.map(fn => <FunctionCard key={fn.name} name={fn.name} status={fn.status} />)
                            ) : (
                                <p className="text-muted-foreground">No se encontraron funciones.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center text-muted-foreground">No se pudo cargar la información del sistema.</p>
            )}
        </motion.div>
    );
};

export default ManageResources;