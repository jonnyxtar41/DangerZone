import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { getPostBySlug, updatePost, addPostEdit } from '@/lib/supabase/posts';
import { getCategories } from '@/lib/supabase/categories';
import { getSections } from '@/lib/supabase/sections';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PostForm from '@/pages/admin/PostForm';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';

const EditPost = () => {
    const { postSlug } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, permissions, signOut } = useAuth();
    
    const [post, setPost] = useState(null);
    const [categories, setCategories] = useState([]);
    const [sections, setSections] = useState([]); 
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const postData = await getPostBySlug(postSlug);
        const categoriesData = await getCategories();
        const sectionsData = await getSections();
        
        if (postData) {
            setPost(postData);
            setCategories(categoriesData);
            setSections(sectionsData);
        } else {
            toast({ title: "Error", description: "No se encontró el recurso.", variant: "destructive" });
            navigate('/control-panel-7d8a2b3c4f5e/dashboard');
        }
        setLoading(false);
    }, [postSlug, navigate, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdatePost = async (updatedData, isEditing, initialData) => {
        const isAdmin = permissions?.['manage-content'];
        const statusToSubmit = updatedData.status;
        
        if (isAdmin) {
            const { data, error } = await updatePost(post.id, { ...updatedData, status: statusToSubmit });
            if (error) {
                 toast({
                    title: "❌ Error al actualizar",
                    description: error.message,
                    variant: "destructive",
                });
                return false;
            } else {
                toast({
                    title: "✅ ¡Recurso actualizado!",
                    description: `"${updatedData.title}" ha sido actualizado correctamente.`,
                });
                return true;
            }
        } else {
            const editPayload = {
                post_id: post.id,
                editor_id: user.id,
                proposed_data: updatedData,
                status: 'pending_approval'
            };
            const { error } = await addPostEdit(editPayload);
            if (error) {
                toast({ title: "❌ Error al enviar para revisión", description: error.message, variant: "destructive" });
                return false;
            } else {
                toast({ title: "✅ ¡Enviado para revisión!", description: "Tus cambios han sido enviados para que un administrador los apruebe." });
                return true;
            }
        }
    };
    
    if (loading || !post) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-white">Cargando...</div>;
    }

    return (
        <>
            <Helmet>
                <title>Editar Recurso - {post.title}</title>
                <meta name="description" content={`Editando el recurso ${post.title}`} />
            </Helmet>
            <div className="min-h-screen bg-background text-foreground">
                 <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                         <h1 className="text-2xl font-bold gradient-text">Zona Vortex</h1>
                         <div className="flex items-center gap-4">
                            <Link to="/control-panel-7d8a2b3c4f5e/dashboard">
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver al Panel
                                </Button>
                            </Link>
                             <Button onClick={signOut} variant="ghost">
                                <LogOut className="mr-2 h-4 w-4" />
                                Cerrar Sesión
                            </Button>
                         </div>
                    </div>
                </header>
                <main className="pt-32 pb-20 px-6">
                    <div className="container mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                                Editar <span className="gradient-text">{post.title}</span>
                            </h1>
                        </motion.div>
                        
                        <PostForm 
                            sections={sections} 
                            categories={categories}
                            onSave={handleUpdatePost}
                            onUpdate={fetchData}
                            initialData={{
                                ...post,
                                show_author: post.show_author ?? true,
                                show_date: post.show_date ?? true,
                                show_main_image_in_post: post.show_main_image_in_post ?? true,
                                main_image_size_in_post: post.main_image_size_in_post || 'medium'
                            }}
                        />
                    </div>
                </main>
            </div>
        </>
    );
};

export default EditPost;