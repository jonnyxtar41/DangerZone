import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, User, ChevronLeft, Download, Share2, BookOpen, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { getPostBySlug, getPosts, incrementPostStat } from '@/lib/supabase/posts';
import AdBlock from '@/components/AdBlock';
import AdLink from '@/components/AdLink';
import { useDownloadModal } from '@/context/DownloadModalContext';
import parse, { domToReact } from 'html-react-parser';

const PostCard = ({ post, section }) => (
    <AdLink to={`/${section}/${post.slug}`} className="block group">
        <div className="glass-effect p-4 rounded-lg transition-all duration-300 hover:bg-white/10 hover:scale-105">
            <div className="w-full aspect-video rounded-md mb-4 overflow-hidden">
                <img  
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    alt={post.image_description || post.title} 
                    src={post.main_image_url || "https://images.unsplash.com/photo-1681308919176-484da2600cb5"} />
            </div>
            <h3 className="font-bold text-md mb-1 group-hover:text-link-hover transition-colors">{post.title}</h3>
            <p className="text-xs text-muted-foreground">{post.categories?.name || 'Sin categoría'}</p>
        </div>
    </AdLink>
);

const Post = ({ section }) => {
    const { postSlug } = useParams();
    const [post, setPost] = useState(null);
    const [recommendedPosts, setRecommendedPosts] = useState([]);
    const [similarPosts, setSimilarPosts] = useState([]);
    const { toast } = useToast();
    const { showModal } = useDownloadModal();

    const fetchData = useCallback(async () => {
        const foundPost = await getPostBySlug(postSlug);
        setPost(foundPost);

        if (foundPost) {
            incrementPostStat(foundPost.id, 'visits');
            const { data: allPosts } = await getPosts({ section: foundPost.sections?.slug });
            const recommended = allPosts
                .filter(p => p.id !== foundPost.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 4);
            setRecommendedPosts(recommended);

            const similar = allPosts
                .filter(p => p.category_id === foundPost.category_id && p.id !== foundPost.id)
                .slice(0, 3);
            setSimilarPosts(similar);
        }
        
        window.scrollTo(0, 0);
    }, [postSlug]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = (action) => {
        toast({
            title: `🚧 ${action} no implementado`,
            description: `¡Esta función estará disponible pronto! 🚀`,
        });
    };
    
    const handleDownload = () => {
        if (!post.download) {
            handleAction("Descargar");
            return;
        }

        const downloadFunction = () => {
            incrementPostStat(post.id, 'downloads');
            if (post.download.type === 'url') {
                window.open(post.download.url, '_blank', 'noopener,noreferrer');
                toast({
                    title: "📥 ¡Descarga iniciada!",
                    description: `${post.title} se está abriendo en una nueva pestaña.`
                });
            } else {
                toast({
                    title: "🚧 Descarga de archivo no disponible",
                    description: "La descarga directa de archivos requiere un backend. ¡Puedes solicitar esta función!",
                });
            }
        };

        showModal({ title: post.title, onConfirm: downloadFunction });
    };
    
    const parseOptions = {
        replace: domNode => {
            if (domNode.attribs && domNode.attribs['data-ad-block']) {
                return <AdBlock />;
            }
            if (domNode.name === 'iframe') {
                return (
                    <div className="relative h-0 pb-[56.25%] overflow-hidden my-6">
                        <iframe
                            {...domNode.attribs}
                            className="absolute top-0 left-0 w-full h-full"
                        />
                    </div>
                );
            }
            if (domNode.name === 'img') {
                const { class: className, style, ...attribs } = domNode.attribs;
                const alignClass = className?.match(/ql-align-(center|right|left)/)?.[0] || '';
                
                const styleObject = {};
                if (style) {
                    style.split(';').forEach(declaration => {
                        const [property, value] = declaration.split(':');
                        if (property && value) {
                            const camelCaseProperty = property.trim().replace(/-(\w)/g, (match, letter) => letter.toUpperCase());
                            styleObject[camelCaseProperty] = value.trim();
                        }
                    });
                }

                return <img {...attribs} className={alignClass} style={styleObject} />;
            }
            if (domNode.children && domNode.children.length > 0) {
                return domToReact(domNode.children, parseOptions);
            }
        }
    };
    
    const getImageSizeClass = (size) => {
        switch (size) {
            case 'small':
                return 'max-w-md mx-auto';
            case 'large':
                return 'w-full';
            case 'medium':
            default:
                return 'max-w-2xl mx-auto';
        }
    };

    if (!post) {
        return (
             <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Cargando contenido...</p>
            </div>
        );
    }

    const currentSectionSlug = post.sections?.slug || section;

    const backLinkText = {
        'blog': 'Volver al Blog',
        'recursos-de-ingles': 'Volver a Recursos de Inglés',
        'resenas': 'Volver a Reseñas'
    };
    
    const categoryLink = post.categories ? `/${currentSectionSlug}?categoria=${encodeURIComponent(post.categories.name)}` : `/${currentSectionSlug}`;
    const subcategoryLink = post.categories && post.subcategories ? `/${currentSectionSlug}?categoria=${encodeURIComponent(post.categories.name)}&subcategoria=${encodeURIComponent(post.subcategories.name)}` : `/${currentSectionSlug}`;

    return (
        <>
            <Helmet>
                <title>{post.meta_title || post.title} - Zona Vortex</title>
                <meta name="description" content={post.meta_description || post.excerpt} />
                <meta property="og:title" content={post.meta_title || post.title} />
                <meta property="og:description" content={post.meta_description || post.excerpt} />
                {post.main_image_url && <meta property="og:image" content={post.main_image_url} />}
                {post.keywords && post.keywords.length > 0 && <meta name="keywords" content={post.keywords.join(', ')} />}
            </Helmet>
            <main className="pt-8 pb-20">
                <div className="container mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Link to={`/${currentSectionSlug}`} className="inline-flex items-center text-text-muted hover:text-foreground transition-colors mb-8 group">
                            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                            {backLinkText[currentSectionSlug] || 'Volver'}
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <article className="lg:col-span-8">
                            <motion.header 
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="mb-12">
                                <div className="mb-4 flex items-center text-sm font-semibold text-foreground flex-wrap gap-2">
                                    {post.categories && (
                                        <Link to={categoryLink} className={`bg-gradient-to-r ${post.categories.gradient || 'from-gray-500 to-gray-700'} px-4 py-1 rounded-full hover:brightness-125 transition-all`}>
                                            {post.categories.name}
                                        </Link>
                                    )}
                                    {post.subcategories && (
                                        <>
                                            <ChevronsRight className="w-5 h-5 text-text-subtle" />
                                            <Link to={subcategoryLink} className="bg-white/10 px-4 py-1 rounded-full hover:bg-white/20 transition-all">
                                                {post.subcategories.name}
                                            </Link>
                                        </>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold mb-6">{post.title}</h1>
                                <div className="flex items-center space-x-6 text-muted-foreground">
                                    {post.show_author && (
                                        <div className="flex items-center space-x-2">
                                            <User size={16} />
                                            <span>{post.custom_author_name || post.author}</span>
                                        </div>
                                    )}
                                    {post.show_date && (
                                        <div className="flex items-center space-x-2">
                                            <Calendar size={16} />
                                            <span>{new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.header>

                            {post.show_main_image_in_post && post.main_image_url && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className={`mb-12 ${getImageSizeClass(post.main_image_size_in_post)}`}
                                >
                                    <img src={post.main_image_url} className="w-full h-auto object-cover rounded-2xl shadow-2xl" alt={post.image_description || post.title} />
                                </motion.div>
                            )}

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <div className="prose prose-invert prose-lg max-w-none text-muted-foreground prose-headings:text-foreground prose-h2:text-3xl prose-p:leading-relaxed prose-a:text-link hover:prose-a:text-link-hover prose-img:rounded-xl">
                                    {post.content && parse(post.content, parseOptions)}
                                </div>
                                
                                <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <p className="text-muted-foreground text-sm">¿Te gustó este contenido?</p>
                                    <div className="flex gap-4">
                                        <Button variant="outline" className="border-border text-foreground hover:bg-secondary" onClick={() => handleAction("Compartir")}>
                                            <Share2 size={16} className="mr-2"/> Compartir
                                        </Button>
                                        {post.download && (
                                            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" onClick={handleDownload}>
                                                <Download size={16} className="mr-2"/> Descargar Material
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </article>

                        <aside className="lg:col-span-4">
                            <div className="sticky top-28 space-y-12">
                                <AdBlock />
                                <div className="glass-effect p-6 rounded-2xl">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                                        <BookOpen className="mr-3 text-primary" />
                                        Recomendados
                                    </h2>
                                    <div className="space-y-6">
                                        {recommendedPosts.map(recPost => (
                                            <AdLink to={`/${recPost.sections?.slug || 'blog'}/${recPost.slug}`} key={recPost.id} className="flex items-center gap-4 group">
                                                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                                    <img  
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                        alt={recPost.image_description || recPost.title} 
                                                        src={recPost.main_image_url || "https://images.unsplash.com/photo-1540159453465-731d5a46060a"} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold leading-tight group-hover:text-link-hover transition-colors">{recPost.title}</h3>
                                                    <p className="text-xs text-text-subtle mt-1">{new Date(recPost.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                            </AdLink>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {similarPosts.length > 0 && (
                        <motion.section 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="mt-24 pt-16 border-t-2 border-border"
                        >
                            <h2 className="text-4xl font-bold text-center mb-12">Entradas Similares</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {similarPosts.map(simPost => (
                                    <PostCard key={simPost.id} post={simPost} section={currentSectionSlug} />
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>
            </main>
        </>
    );
};

export default Post;