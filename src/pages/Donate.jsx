
    import React, { useState, useEffect, useCallback } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { loadStripe } from '@stripe/stripe-js';
    import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { supabase } from '@/lib/customSupabaseClient';
    import { getAllSiteContent, addPayment } from '@/lib/supabase/siteContent';
    import { Heart, CreditCard, Loader2 } from 'lucide-react';
    import LoadingSpinner from '@/components/LoadingSpinner';
    import { useAuth } from '@/contexts/SupabaseAuthContext';


    const StripeDonationForm = ({ amount, currency, name, email }) => {
        const stripe = useStripe();
        const elements = useElements();
        const { user } = useAuth();
        const { toast } = useToast();
        const [isLoading, setIsLoading] = useState(false);
        const [message, setMessage] = useState(null);

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!stripe || !elements) return;
            setIsLoading(true);

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/donar?status=success`
                },
                redirect: 'if_required'
            });

            if (error) {
                setMessage(error.type === "card_error" || error.type === "validation_error" ? error.message : "Ocurrió un error inesperado.");
                setIsLoading(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                await addPayment({
                    user_id: user?.id,
                    email: email,
                    amount: amount,
                    currency: currency,
                    payment_provider: 'stripe',
                    provider_payment_id: paymentIntent.id,
                    status: 'succeeded',
                    item_type: 'donation',
                    donor_name: name,
                });
                toast({
                    title: '💖 ¡Donación Exitosa!',
                    description: 'Muchas gracias por tu apoyo. ¡Significa mucho para nosotros!',
                });
                window.location.href = `${window.location.origin}/donar?status=success_local`;
            } else {
                setMessage("El pago no se completó. Por favor, inténtalo de nuevo.");
                setIsLoading(false);
            }
        };

        return (
            <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
                <PaymentElement id="payment-element" options={{layout: 'tabs'}} />
                <Button disabled={isLoading || !stripe || !elements} id="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <span id="button-text">{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Donar $${amount} ${currency}`}</span>
                </Button>
                {message && <div id="payment-message" className="text-red-500 text-sm mt-2">{message}</div>}
            </form>
        );
    };


    const Donate = () => {
        const { toast } = useToast();
        const { user } = useAuth();
        const [stripePromise, setStripePromise] = useState(null);
        const [clientSecret, setClientSecret] = useState('');
        const [config, setConfig] = useState({
            donation_page_title: 'Apoya Nuestro Proyecto',
            donation_page_description: 'Tu generosidad nos permite seguir creando contenido de calidad y mantener la plataforma funcionando. ¡Cada contribución, grande o pequeña, hace una gran diferencia!',
            donation_options: '5,10,25,50,100',
            donation_currency: 'USD',
            stripe_publishable_key: null,
            paypal_client_id: null,
        });
        const [amount, setAmount] = useState(0);
        const [customAmount, setCustomAmount] = useState('');
        const [name, setName] = useState('');
        const [email, setEmail] = useState('');
        const [loading, setLoading] = useState(true);
        const [isProcessing, setIsProcessing] = useState(false);

        const donationOptions = config.donation_options.split(',').map(Number).filter(n => n > 0);

        const checkStatus = useCallback(() => {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('status') === 'success' || urlParams.get('status') === 'success_local') {
                toast({
                    title: '💖 ¡Donación Exitosa!',
                    description: 'Muchas gracias por tu apoyo. ¡Significa mucho para nosotros!',
                });
                window.history.replaceState({}, document.title, "/donar");
            }
        }, [toast]);

        const setupPayPal = useCallback(() => {
            if (!config.paypal_client_id || !document.getElementById('paypal-button-container') || window.paypal) return;

            const script = document.createElement("script");
            script.src = `https://www.paypal.com/sdk/js?client-id=${config.paypal_client_id}&currency=${config.donation_currency}&intent=capture`;
            script.onload = () => {
                if (window.paypal) {
                    window.paypal.Buttons({
                        createOrder: (data, actions) => {
                            if (amount <= 0) {
                                toast({ title: '💰 El monto debe ser mayor a cero.', variant: 'destructive' });
                                return;
                            }
                            return actions.order.create({
                                purchase_units: [{ amount: { value: String(amount) } }]
                            });
                        },
                        onApprove: (data, actions) => actions.order.capture().then(async (details) => {
                            await addPayment({
                                user_id: user?.id,
                                email: details.payer.email_address,
                                amount: details.purchase_units[0].amount.value,
                                currency: details.purchase_units[0].amount.currency_code,
                                payment_provider: 'paypal',
                                provider_payment_id: details.id,
                                status: 'succeeded',
                                item_type: 'donation',
                                donor_name: `${details.payer.name.given_name} ${details.payer.name.surname}`,
                            });
                            toast({ title: '💖 ¡Donación con PayPal exitosa!', description: `Gracias por tu donación, ${details.payer.name.given_name}!` });
                        })
                    }).render('#paypal-button-container').catch(err => console.error("PayPal render error:", err));
                }
            };
            document.body.appendChild(script);

        }, [config.paypal_client_id, config.donation_currency, amount, toast, user]);

        useEffect(() => {
            checkStatus();
            const fetchConfig = async () => {
                const allContent = await getAllSiteContent();
                const contentMap = allContent.reduce((acc, item) => {
                    acc[item.key] = item.value;
                    return acc;
                }, {});
                setConfig(prev => ({ ...prev, ...contentMap }));
                if (contentMap.stripe_publishable_key) {
                    setStripePromise(loadStripe(contentMap.stripe_publishable_key));
                }
                const defaultAmount = (contentMap.donation_options || '5').split(',').map(Number)[0] || 5;
                setAmount(defaultAmount);
                setLoading(false);
            };
            fetchConfig();
        }, [checkStatus]);

        useEffect(() => {
            if (user) {
                setName(user.user_metadata?.full_name || '');
                setEmail(user.email || '');
            }
        }, [user]);

        useEffect(() => {
            if (!loading) {
                setupPayPal();
            }
        }, [loading, setupPayPal]);

        const handleAmountSelection = (selectedAmount) => {
            setAmount(selectedAmount);
            setCustomAmount('');
            if (clientSecret) setClientSecret('');
        };

        const handleCustomAmountChange = (e) => {
            const value = e.target.value;
            setCustomAmount(value);
            if (value && !isNaN(value) && Number(value) > 0) {
                setAmount(Number(value));
            } else if (!value) {
                const defaultAmount = donationOptions[0] || 5;
                setAmount(defaultAmount);
            }
            if (clientSecret) setClientSecret('');
        };

        const createPaymentIntent = async (e) => {
            e.preventDefault();
            if (!name || !email) {
                toast({ title: '✋ Por favor, completa tu nombre y email.', variant: 'destructive' });
                return;
            }
            if (amount <= 0) {
                toast({ title: '💰 El monto debe ser mayor a cero.', variant: 'destructive' });
                return;
            }
            setIsProcessing(true);
            try {
                const { data, error } = await supabase.functions.invoke('create-payment-intent', {
                    body: {
                        amount: Math.round(amount * 100),
                        currency: config.donation_currency,
                        name,
                        email
                    },
                });
                if (error) throw new Error(error.message);
                if (data.error) throw new Error(data.error);
                setClientSecret(data.clientSecret);
            } catch (error) {
                console.error(error);
                toast({ title: '❌ Error al procesar el pago', description: 'No se pudo iniciar la transacción.', variant: 'destructive' });
            } finally {
                setIsProcessing(false);
            }
        };

        if (loading) {
            return <div className="w-full h-screen flex items-center justify-center bg-background"><LoadingSpinner /></div>;
        }
        
        const stripeOptions = {
            clientSecret,
            appearance: {
                theme: 'night',
                labels: 'floating',
            },
        };

        return (
            <>
                <Helmet>
                    <title>{config.donation_page_title}</title>
                    <meta name="description" content={config.donation_page_description} />
                </Helmet>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="container mx-auto px-4 py-16 sm:py-24">
                    <div className="max-w-2xl mx-auto text-center">
                        <Heart className="mx-auto h-16 w-16 text-primary animate-pulse" />
                        <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight gradient-text">{config.donation_page_title}</h1>
                        <p className="mt-6 text-lg text-muted-foreground">{config.donation_page_description}</p>
                    </div>

                    <div className="mt-16 max-w-lg mx-auto">
                        <div className="glass-effect p-8 rounded-2xl shadow-lg">
                            {!clientSecret ? (
                                <form onSubmit={createPaymentIntent} className="space-y-6">
                                    <div>
                                        <Label className="text-lg font-semibold">Elige un monto ({config.donation_currency})</Label>
                                        <div className="mt-4 grid grid-cols-3 gap-4">
                                            {donationOptions.map((val) => (
                                                <Button key={val} type="button" variant={amount === val && !customAmount ? 'secondary' : 'outline'} onClick={() => handleAmountSelection(val)} className="h-12 text-lg">
                                                    ${val}
                                                </Button>
                                            ))}
                                            <Input type="number" placeholder="Otro" value={customAmount} onChange={handleCustomAmountChange} className="h-12 text-lg text-center col-span-3 sm:col-span-1 bg-input" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Nombre</Label>
                                            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 bg-input" />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 bg-input" />
                                        </div>
                                    </div>
                                    {config.stripe_publishable_key && (
                                        <Button type="submit" disabled={isProcessing} className="w-full h-12 text-lg">
                                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><CreditCard className="mr-2 h-5 w-5" /> Pagar con Tarjeta</>}
                                        </Button>
                                    )}
                                </form>
                            ) : (
                                stripePromise && clientSecret && (
                                    <Elements options={stripeOptions} stripe={stripePromise}>
                                        <StripeDonationForm amount={amount} currency={config.donation_currency} name={name} email={email} />
                                    </Elements>
                                )
                            )}

                            {config.paypal_client_id && !clientSecret && (
                                <>
                                    <div className="relative my-8">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-white/20" /></div>
                                        <div className="relative flex justify-center"><span className="bg-gray-800 px-2 text-sm text-muted-foreground">o</span></div>
                                    </div>
                                    <div id="paypal-button-container" className="text-center"></div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </>
        );
    };

    export default Donate;
  