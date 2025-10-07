import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Hash, Folder, Users, PlusSquare, Edit, BarChart, DollarSign, MessageSquare, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-effect p-4 md:p-6 rounded-2xl flex items-center justify-between">
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-3xl md:text-4xl font-bold text-white">{value}</p>
        </div>
        {React.createElement(icon, { className: `w-10 h-10 md:w-12 md:h-12 ${color}` })}
    </div>
);

const QuickAccessCard = ({ title, to, icon }) => (
    <Link to={to} className="glass-effect p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors duration-300">
        {React.createElement(icon, { className: "w-8 h-8 md:w-10 md:h-10 mb-3 text-primary" })}
        <span className="font-semibold text-gray-200 text-sm md:text-base">{title}</span>
        <ArrowRight className="w-4 h-4 mt-2 text-muted-foreground" />
    </Link>
);

const RecentItem = ({ item, type }) => {
    const isPost = type === 'post';
    const title = isPost ? item.title : item.message;
    const date = formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es });

    return (
        <div className="flex items-start gap-4 py-3 border-b border-white/10 last:border-b-0">
            <div className="bg-primary/20 p-2 rounded-full">
                {React.createElement(isPost ? BookOpen : MessageSquare, { className: "w-5 h-5 text-primary" })}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-white truncate">{title}</p>
                <p className="text-xs text-muted-foreground">{date}</p>
            </div>
        </div>
    );
};

const Dashboard = ({ user, posts, categories, sections }) => {
    const [userCount, setUserCount] = useState(0);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { count } = await supabase.from('user_roles').select('*', { count: 'exact', head: true });
            setUserCount(count || 0);

            const { data: suggestionsData } = await supabase
                .from('suggestions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            setSuggestions(suggestionsData || []);
        };

        fetchDashboardData();
    }, []);

    const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Bienvenido de nuevo, {user.email.split('@')[0]}!</h2>
            <p className="text-gray-400 mb-8">Aquí tienes un resumen de la actividad de tu sitio.</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <StatCard title="Recursos" value={posts.length} icon={FileText} color="text-blue-400" />
                <StatCard title="Categorías" value={categories.length} icon={Hash} color="text-purple-400" />
                <StatCard title="Secciones" value={sections.length} icon={Folder} color="text-green-400" />
                <StatCard title="Usuarios" value={userCount} icon={Users} color="text-yellow-400" />
            </div>

            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Accesos Rápidos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <QuickAccessCard title="Añadir Recurso" to="../add-resource" icon={PlusSquare} />
                    <QuickAccessCard title="Gestionar Contenido" to="../manage-content" icon={Edit} />
                    <QuickAccessCard title="Ver Estadísticas" to="../analytics" icon={BarChart} />
                    <QuickAccessCard title="Gestionar Pagos" to="../payments" icon={DollarSign} />
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass-effect p-4 md:p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Actividad Reciente</h3>
                    <div className="space-y-2">
                        {sortedPosts.slice(0, 5).map(post => (
                            <RecentItem key={post.id} item={post} type="post" />
                        ))}
                    </div>
                </div>
                <div className="glass-effect p-4 md:p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Últimas Sugerencias</h3>
                    <div className="space-y-2">
                        {suggestions.map(suggestion => (
                            <RecentItem key={suggestion.id} item={suggestion} type="suggestion" />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;