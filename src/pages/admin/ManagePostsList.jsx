import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Clock, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { deletePost } from '@/lib/supabase/posts';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ManagePostsList = ({ posts, onUpdate, silentDelete }) => {
    const { toast } = useToast();
    const { role } = useAuth();
    const isAdmin = role === 'admin';

    const handleDelete = async (postId, postTitle) => {
        const shouldLog = isAdmin ? !silentDelete : true;
        const { error } = await deletePost(postId, postTitle, shouldLog);
        if (error) {
            toast({
                title: '❌ Error al eliminar',
                description: error.message,
                variant: 'destructive',
            });
        } else {
            toast({
                title: '🗑️ Recurso eliminado',
                description: `"${postTitle}" ha sido eliminado.`,
            });
            onUpdate();
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'published':
                return <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">Publicado</span>;
            case 'draft':
                return <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-yellow-600 bg-yellow-200">Borrador</span>;
            case 'pending_approval':
                return <span className="flex items-center gap-1 text-xs font-semibold py-1 px-2 uppercase rounded-full text-orange-600 bg-orange-200"><Clock className="w-3 h-3" /> Pendiente</span>;
            default:
                return null;
        }
    };
    
    const getPostPath = (post) => {
      const sectionSlug = post.sections?.slug || 'blog';
      return `/${sectionSlug}/${post.slug}`;
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Recursos Existentes ({posts.length})</h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                <AnimatePresence>
                    {posts.length > 0 ? posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="glass-effect p-4 rounded-lg flex justify-between items-center"
                        >
                            <div className="flex-grow">
                                <h4 className="font-bold text-lg">{post.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    {getStatusChip(post.status)}
                                    <p className="text-sm text-gray-400">{post.categories?.name || 'Sin categoría'} - {new Date(post.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link to={getPostPath(post)} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10 h-9 w-9">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <Link to={`/control-panel-7d8a2b3c4f5e/edit/${post.slug}`}>
                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </Link>
                                {isAdmin && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon" className="h-9 w-9">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción es irreversible y eliminará permanentemente el recurso "{post.title}".
                                                    {silentDelete && <span className="block mt-2 font-bold text-yellow-400">La eliminación no será registrada.</span>}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(post.id, post.title)}>Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </motion.div>
                    )) : (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-gray-400 text-center py-8"
                        >
                            No se encontraron recursos con los filtros actuales.
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ManagePostsList;