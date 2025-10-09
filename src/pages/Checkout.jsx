import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { getAllSiteContent, addPayment } from '@/lib/supabase/siteContent';
import { getPostBySlug, incrementPostStat } from '@/lib/supabase/posts';
import { ShoppingCart, CreditCard, Loader2, Tag } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const StripeCheckoutForm = ({ clientSecret, post, finalAmount, name, email }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            toast({ title: 'Error en el formulario', description: submitError.message, variant: 'destructive' });
            setIsProcessing(false);
            return;
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `${window.location.origin}/`,
                receipt_email: email,
            },
            redirect: 'if_required',
        });

        if (error) {
            toast({ title: 'Error en el pago', description: error.message, variant: 'destructive' });
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            await addPayment({
                user_id: user?.id,
                email: email,
                amount: finalAmount,
                currency: post.currency,
                payment_provider: 'stripe',
                provider_payment_id: paymentIntent.id,
                status: 'succeeded',
                item_type: 'post',
                item_id: post.id,
                donor_name: name,
            });

            await incrementPostStat(post.id, 'downloads');

            toast({ title: '¡Pago exitoso!', description: 'Gracias por tu compra. Tu descarga comenzará en breve.' });
            
            setTimeout(() => {
                const downloadUrl = post.download.url;
                if(downloadUrl) {
                    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                }
                navigate(`/`);
            }, 2000);
            
        } else {
            toast({ title: 'Pago no completado', description: `Estado: ${paymentIntent.status}`, variant: 'destructive' });
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <Button disabled={isProcessing || !stripe || !elements} className="w-full text-lg py-6" size="lg">
                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                {isProcessing ? 'Procesando...' : `Pagar $${finalAmount} ${post.currency}`}
            </Button>
        </form>
    );
};

const Checkout = () => {
    const { postSlug } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const [post, setPost] = useState(null);
    const [config, setConfig] = useState({});
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postData, allContent] = await Promise.all([
                    getPostBySlug(postSlug),
                    getAllSiteContent(),
                ]);

                if (!postData || !postData.is_premium) {
                    toast({ title: 'Recurso no válido', description: 'Este recurso no está a la venta.', variant: 'destructive' });
                    navigate('/');
                    return;
                }
                
                setPost(postData);
                const contentMap = allContent.reduce((acc, item) => ({...acc, [item.key]: item.value}), {});
                setConfig(contentMap);
                
                if (contentMap.stripe_publishable_key) {
                    setStripePromise(loadStripe(contentMap.stripe_publishable_key));
                } else {
                    toast({ title: 'Configuración incompleta', description: 'La clave publicable de Stripe no está configurada.', variant: 'destructive' });
                }

                if (user) {
                    setName(user.user_metadata?.full_name || '');
                    setEmail(user.email || '');
                }

            } catch (error) {
                 toast({ title: 'Error', description: 'No se pudo cargar la información del producto.', variant: 'destructive' });
                 navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [postSlug, navigate, toast, user]);

    const finalAmount = useMemo(() => {
        if (!post) return 0;
        if (post.is_discount_active && post.discount_percentage > 0) {
            const discount = (post.price * post.discount_percentage) / 100;
            return (post.price - discount).toFixed(2);
        }
        return parseFloat(post.price).toFixed(2);
    }, [post]);
    
    const createPaymentIntent = async (e) => {
        e.preventDefault();
        if (!name || !email) {
            toast({ title: 'Información requerida', description: 'Por favor, ingresa tu nombre y correo electrónico.', variant: 'destructive' });
            return;
        }

        setIsProcessing(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-payment-intent', {
                body: {
                    amount: Math.round(finalAmount * 100),
                    currency: post.currency,
                    name,
                    email,
                    metadata: {
                        product_id: post.id,
                        product_name: post.title,
                        type: 'premium_content',
                    },
                },
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setClientSecret(data.clientSecret);
        } catch (error) {
            console.error('Error creating payment intent:', error);
            toast({ title: 'Error al iniciar pago', description: 'No se pudo conectar con el servicio de pago. Inténtalo de nuevo.', variant: 'destructive' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return <div className="w-full h-screen flex items-center justify-center bg-background"><LoadingSpinner /></div>;
    }
    
    if (!post) {
      return null;
    }

    return (
        <>
            <Helmet>
                <title>Comprar: {post.title}</title>
                <meta name="description" content={`Página de pago para adquirir ${post.title}.`} />
            </Helmet>
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 py-16 sm:py-24">
                <div className="max-w-2xl mx-auto text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-primary" />
                    <h1 className="mt-6 text-4xl font-bold tracking-tight gradient-text">Finalizar Compra</h1>
                    <p className="mt-4 text-lg text-muted-foreground">Estás a punto de adquirir "{post.title}".</p>
                </div>

                <div className="mt-12 max-w-lg mx-auto">
                    <div className="glass-effect p-8 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white">{post.title}</h2>
                                <p className="text-sm text-muted-foreground">{post.categories?.name}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                {post.is_discount_active && (
                                    <p className="text-lg text-gray-400 line-through">${parseFloat(post.price).toFixed(2)} {post.currency}</p>
                                )}
                                <p className="text-3xl font-bold text-primary">${finalAmount} {post.currency}</p>
                                {post.is_discount_active && (
                                    <p className="text-sm font-bold text-green-400 flex items-center justify-end gap-1 mt-1">
                                        <Tag size={14}/> {post.discount_percentage}% OFF
                                    </p>
                                )}
                            </div>
                        </div>

                        {clientSecret && stripePromise ? (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <StripeCheckoutForm clientSecret={clientSecret} post={post} finalAmount={finalAmount} name={name} email={email} />
                            </Elements>
                        ) : (
                            <form onSubmit={createPaymentIntent} className="space-y-6">
                                <div>
                                    <Label htmlFor="name">Nombre Completo</Label>
                                    <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Tu nombre" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" className="mt-1" />
                                </div>
                                <Button type="submit" disabled={isProcessing} className="w-full text-lg py-6" size="lg">
                                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                                    Continuar al Pago
                                </Button>
                            </form>
                        )}
                         <p className="text-xs text-center text-muted-foreground mt-4">Transacción segura impulsada por Stripe.</p>
                    </div>
                </div>
            </motion.main>
        </>
    );
};

export default Checkout;