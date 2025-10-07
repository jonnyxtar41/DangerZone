import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { session, updateUserPassword } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (!session) {
            toast({
                title: 'Sesión no válida',
                description: 'El enlace de recuperación puede haber expirado. Por favor, solicita uno nuevo.',
                variant: 'destructive',
            });
            navigate('/request-password-reset');
        }
    }, [session, navigate, toast]);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({
                title: 'Las contraseñas no coinciden',
                variant: 'destructive',
            });
            return;
        }
        setLoading(true);
        const { error } = await updateUserPassword(password);
        if (error) {
            toast({
                title: 'Error al actualizar',
                description: error.message,
                variant: 'destructive',
            });
        } else {
            toast({
                title: '¡Contraseña actualizada!',
                description: 'Ahora puedes iniciar sesión con tu nueva contraseña.',
            });
            navigate('/control-panel-7d8a2b3c4f5e');
        }
        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Actualizar Contraseña - Admin Panel</title>
            </Helmet>
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md glass-effect p-8 rounded-2xl"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold gradient-text mb-2">Actualizar Contraseña</h1>
                        <p className="text-muted-foreground">Introduce tu nueva contraseña.</p>
                    </div>
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nueva Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-input border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-input border-border"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default UpdatePassword;