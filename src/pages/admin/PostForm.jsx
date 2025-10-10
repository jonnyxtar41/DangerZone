import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import PostFormInputs from '@/pages/admin/post-form/PostFormInputs';
import PostFormSidebar from '@/pages/admin/post-form/PostFormSidebar';
import PostFormSeo from '@/pages/admin/post-form/PostFormSeo';
import PostFormCustomFields from '@/pages/admin/post-form/PostFormCustomFields';
import PostPreview from '@/pages/admin/post-form/PostPreview';
import { Save, Send, PlusCircle, Trash2, Edit, Eye, CalendarClock } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getCategories } from '@/lib/supabase/categories';
import { getSubcategories } from '@/lib/supabase/subcategories';
import { useNavigate } from 'react-router-dom';
import TiptapEditor from '@/components/TiptapEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deletePost } from '@/lib/supabase/posts';
import { uploadDownloadableAsset } from '@/lib/supabase/assets';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/customSupabaseClient'; // <-- Importante: Añadir esta línea

const PostForm = ({ sections, onSave, onNewPost, initialData = {}, onUpdate }) => {
    const { toast } = useToast();
    const { user, permissions } = useAuth();
    const navigate = useNavigate();
    const editorRef = useRef(null);

    // Form state
    const [title, setTitle] = useState(initialData.title || '');
    const [postSectionId, setPostSectionId] = useState(initialData.section_id || '');
    const [postCategoryId, setPostCategoryId] = useState(initialData.category_id || '');
    const [postSubcategoryId, setPostSubcategoryId] = useState(initialData.subcategory_id || '');
    const [excerpt, setExcerpt] = useState(initialData.excerpt || '');
    const [content, setContent] = useState(initialData.content || '');
    const [mainImagePreview, setMainImagePreview] = useState(initialData.main_image_url || '');
    const [metaTitle, setMetaTitle] = useState(initialData.meta_title || '');
    const [metaDescription, setMetaDescription] = useState(initialData.meta_description || '');
    const [slug, setSlug] = useState(initialData.slug || '');
    const [keywords, setKeywords] = useState(initialData.keywords || []);
    const [customAuthorName, setCustomAuthorName] = useState(initialData.custom_author_name || '');
    const [showAuthor, setShowAuthor] = useState(initialData.show_author ?? false);
    const [showDate, setShowDate] = useState(initialData.show_date ?? true);
    const [showMainImageInPost, setShowMainImageInPost] = useState(initialData.show_main_image_in_post ?? true);
    const [mainImageSizeInPost, setMainImageSizeInPost] = useState(initialData.main_image_size_in_post || 'medium');
    const [hasDownload, setHasDownload] = useState(!!initialData.download);
    const [downloadType, setDownloadType] = useState(initialData.download?.type || 'url');
    const [downloadUrl, setDownloadUrl] = useState(initialData.download?.type === 'url' ? initialData.download.url : '');
    const [downloadFile, setDownloadFile] = useState(null);
    const [isPremium, setIsPremium] = useState(initialData.is_premium || false);
    const [price, setPrice] = useState(initialData.price || '');
    const [currency, setCurrency] = useState(initialData.currency || 'USD');
    const [isDiscountActive, setIsDiscountActive] = useState(initialData.is_discount_active || false);
    const [discountPercentage, setDiscountPercentage] = useState(initialData.discount_percentage || '');
    const [isFeatured, setIsFeatured] = useState(initialData.is_featured || false);
    // New features state
    const [view, setView] = useState('edit'); // 'edit' or 'preview'
    const [isScheduled, setIsScheduled] = useState(!!initialData.published_at && new Date(initialData.published_at) > new Date());
    const [publishedAt, setPublishedAt] = useState(initialData.published_at ? new Date(initialData.published_at).toISOString().slice(0, 16) : '');
    const [customFields, setCustomFields] = useState(initialData.custom_fields || []);
    const [commentsEnabled, setCommentsEnabled] = useState(initialData.comments_enabled || false);

    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableSubcategories, setAvailableSubcategories] = useState([]);
    const [isSaved, setIsSaved] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const isEditing = !!initialData.id;
    const isAdmin = permissions?.['manage-content'];

    const handleAiAction = useCallback(async (action, promptOverride = '') => {
        setIsAiLoading(true);
        toast({ title: '🤖 La IA está pensando...' });
        try {
            const getSelectedText = () => editorRef.current ? editorRef.current.state.doc.cut(editorRef.current.state.selection.from, editorRef.current.state.selection.to).textContent : '';
            const selectedText = getSelectedText();
            let prompt;

            switch(action) {
                case 'generate-title':
                    prompt = `Genera un título SEO optimizado y atractivo para un artículo basado en el siguiente borrador: "${title}".`;
                    break;
                case 'generate-excerpt':
                    prompt = `Crea un resumen (excerpt) atractivo y conciso para un artículo titulado "${title}".`;
                    break;
                case 'generate-meta-title':
                    prompt = `Genera un meta título SEO (máximo 60 caracteres) para un artículo titulado "${title}".`;
                    break;
                case 'generate-meta-description':
                    prompt = `Genera una meta descripción SEO (máximo 160 caracteres) para un artículo titulado "${title}" con el resumen: "${excerpt}".`;
                    break;
                case 'generate-keywords':
                    prompt = `Sugiere 5-7 palabras clave (keywords) relevantes en formato CSV (ej: keyword1, keyword2, keyword3) para un artículo titulado "${title}".`;
                    break;
                case 'improve-writing':
                    if (!selectedText) throw new Error('Selecciona un texto para mejorar.');
                    prompt = `Mejora la redacción del siguiente texto: "${selectedText}".`;
                    break;
                case 'fix-grammar':
                    if (!selectedText) throw new Error('Selecciona un texto para corregir.');
                    prompt = `Corrige la gramática y ortografía del siguiente texto: "${selectedText}".`;
                    break;
                case 'make-shorter':
                    if (!selectedText) throw new Error('Selecciona un texto para acortar.');
                    prompt = `Haz más corto el siguiente texto: "${selectedText}".`;
                    break;
                case 'make-longer':
                    if (!selectedText) throw new Error('Selecciona un texto para alargar.');
                    prompt = `Haz más largo y detallado el siguiente texto: "${selectedText}".`;
                    break;
                case 'generate-content':
                     if (!promptOverride) throw new Error('El prompt no puede estar vacío.');
                    prompt = promptOverride;
                    break;
                default:
                    throw new Error('Acción de IA no reconocida');
            }

            // --- LLAMADA A TU FUNCIÓN DE SUPABASE ---
            const { data, error } = await supabase.functions.invoke('ai-assistant', {
                body: { prompt },
            });

            if (error) {
                throw new Error(`Error en la función de Supabase: ${error.message}`);
            }

            if (data.error) {
                throw new Error(`Error devuelto por la IA: ${data.error}`);
            }

            const response = data.response;
            // --- FIN DE LA LLAMADA ---

            if (!response) {
                throw new Error('La IA no devolvió una respuesta válida.');
            }

            if (action.startsWith('generate-')) {
                if (action === 'generate-title') setTitle(response);
                if (action === 'generate-excerpt') setExcerpt(response);
                if (action === 'generate-meta-title') setMetaTitle(response);
                if (action === 'generate-meta-description') setMetaDescription(response);
                if (action === 'generate-keywords') setKeywords(response.split(',').map(k => k.trim()));
                if (action === 'generate-content' && editorRef.current) {
                    editorRef.current.commands.insertContent(response);
                }
            } else if (editorRef.current && selectedText) {
                const { from, to } = editorRef.current.state.selection;
                editorRef.current.chain().focus().insertContentAt({ from, to }, response).run();
            } else if (editorRef.current) {
                editorRef.current.chain().focus().insertContent(response).run();
            }

            toast({ title: '✅ Contenido generado por IA' });

        } catch (error) {
            toast({ title: '❌ Error de IA', description: error.message, variant: 'destructive' });
        } finally {
            setIsAiLoading(false);
            setIsAiPromptOpen(false);
            setCustomPrompt('');
        }
    }, [toast, title, excerpt, editorRef]);

    const getPostData = useCallback(() => ({
        title, postSectionId, postCategoryId, postSubcategoryId, excerpt, content, main_image_url: mainImagePreview, meta_title: metaTitle, meta_description: metaDescription, slug, keywords, custom_author_name: customAuthorName, show_author: showAuthor, show_date: showDate, show_main_image_in_post: showMainImageInPost, main_image_size_in_post: mainImageSizeInPost, hasDownload, downloadType, downloadUrl, isPremium, price, currency, isDiscountActive, discountPercentage, published_at: publishedAt, isScheduled, custom_fields: customFields, isFeatured,  comments_enabled: commentsEnabled
    }), [title, postSectionId, postCategoryId, postSubcategoryId, excerpt, content, mainImagePreview, metaTitle, metaDescription, slug, keywords, customAuthorName, showAuthor, showDate, showMainImageInPost, mainImageSizeInPost, hasDownload, downloadType, downloadUrl, isPremium, price, currency, isDiscountActive, discountPercentage, publishedAt, isScheduled, customFields,isFeatured, commentsEnabled]);

    const handleLoadTemplate = (template) => {
        if (!template || !template.content) return;
        const data = template.content;
        setTitle(data.title || '');
        setPostSectionId(data.postSectionId || '');
        setPostCategoryId(data.postCategoryId || '');
        setPostSubcategoryId(data.postSubcategoryId || '');
        setExcerpt(data.excerpt || '');
        setContent(data.content || '');
        toast({ title: `Plantilla "${template.name}" cargada` });
    };

    const handleFormSubmit = async (statusOverride) => {
        if (isUploading) {
            toast({ title: "Subida en progreso...", variant: "destructive" });
            return;
        }

        let status = statusOverride;
        if (isScheduled && isAdmin) {
            if (!publishedAt) {
                toast({ title: "❌ Fecha de programación requerida", description: "Por favor, establece una fecha y hora para programar.", variant: "destructive" });
                return;
            }
            status = 'scheduled';
        } else if (status === 'published' && !isAdmin) {
            status = 'pending_approval';
        }

        if ((status === 'published' || status === 'scheduled') && !mainImagePreview) {
            toast({ title: "❌ Imagen destacada requerida", description: "Añade una imagen para publicar o programar.", variant: "destructive" });
            return;
        }

        let downloadData = null;
        if (hasDownload) {
             let finalDownloadUrl = downloadUrl;
            if (downloadType === 'file' && downloadFile) {
                setIsUploading(true);
                toast({ title: "Subiendo archivo..." });
                const uploadedUrl = await uploadDownloadableAsset(downloadFile);
                setIsUploading(false);
                if (!uploadedUrl) {
                    toast({ title: "❌ Error al subir el archivo", variant: "destructive" });
                    return;
                }
                finalDownloadUrl = uploadedUrl;
            } else if (downloadType === 'file' && initialData.download) {
                finalDownloadUrl = initialData.download.url;
            }
            downloadData = { type: downloadType, url: finalDownloadUrl };
        }

        const postData = {
            title,
            section_id: postSectionId,
            category_id: postCategoryId,
            subcategory_id: postSubcategoryId,
            excerpt,
            content,
            main_image_url: mainImagePreview,
            meta_title: metaTitle,
            meta_description: metaDescription,
            slug,
            keywords,
            custom_author_name: customAuthorName,
            show_author: showAuthor,
            show_date: showDate,
            show_main_image_in_post: showMainImageInPost,
            main_image_size_in_post: mainImageSizeInPost,
            is_premium: isPremium,
            price,
            currency,
            is_discount_active: isDiscountActive,
            discount_percentage: discountPercentage,
            custom_fields: customFields.filter(f => f.key && f.value),
            comments_enabled: commentsEnabled,
            status,
            published_at: isScheduled ? new Date(publishedAt).toISOString() : (status === 'published' ? new Date().toISOString() : null),
            author: user.email,
            download: downloadData,
            is_featured: isFeatured,
            user_id: user.id
        };

        const success = await onSave(postData, isEditing, initialData);

        if (success && !isEditing) setIsSaved(true);
        else if (success && isEditing) navigate('/control-panel-7d8a2b3c4f5e/dashboard');
    };
    
    useEffect(() => {
        const fetchCategories = async () => {
            if (postSectionId) {
                const categoriesData = await getCategories({ sectionId: postSectionId });
                setAvailableCategories(categoriesData);
            } else {
                setAvailableCategories([]);
            }
        };
        fetchCategories();
    }, [postSectionId]);

    useEffect(() => {
        const fetchSubcategories = async () => {
            if (postCategoryId) {
                const subcategoriesData = await getSubcategories({ categoryId: postCategoryId });
                setAvailableSubcategories(subcategoriesData);
            } else {
                setAvailableSubcategories([]);
            }
        };
        fetchSubcategories();
    }, [postCategoryId]);

    const handleSectionChange = (sectionId) => {
        setPostSectionId(sectionId);
        setPostCategoryId('');
        setPostSubcategoryId('');
    };

    const handleCategoryChange = (categoryId) => {
        setPostCategoryId(categoryId);
        setPostSubcategoryId('');
    };
    
    const generateSlug = (str) => {
        if (!str) return '';
        return str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    };

    const resetForm = () => {
        setTitle('');
        setPostSectionId('');
        setPostCategoryId('');
        setPostSubcategoryId('');
        setExcerpt('');
        setContent('');
        if (editorRef.current) {
            editorRef.current.commands.clearContent();
        }
        setMainImagePreview('');
        setMetaTitle('');
        setMetaDescription('');
        setSlug('');
        setKeywords([]);
        setCustomAuthorName('');
        setShowAuthor(true);
        setShowDate(true);
        setShowMainImageInPost(true);
        setMainImageSizeInPost('medium');
        setHasDownload(false);
        setDownloadType('url');
        setDownloadUrl('');
        setDownloadFile(null);
        setIsPremium(false);
        setPrice('');
        setCurrency('USD');
        setIsDiscountActive(false);
        setDiscountPercentage('');
        setIsScheduled(false);
        setPublishedAt('');
        setCustomFields([]);
        setIsFeatured(false);
        setCommentsEnabled(false);
        setIsSaved(false); // Importante para volver a mostrar el formulario
        
        // Limpiar el input del archivo de descarga
        const downloadFileInput = document.querySelector('input[type="file"]');
        if (downloadFileInput) {
            downloadFileInput.value = '';
        }
        
        toast({
            title: "Formulario limpio",
            description: "Puedes añadir un nuevo recurso.",
        });
    };

    const handleDeletePost = async () => {
        if (!isEditing) return;
        const { error } = await deletePost(initialData.id, initialData.title, true);
        if (error) {
            toast({ title: '❌ Error al eliminar', variant: 'destructive' });
        } else {
            toast({ title: '🗑️ Recurso eliminado' });
            if (onUpdate) onUpdate();
            navigate('/control-panel-7d8a2b3c4f5e/dashboard');
        }
    };
    
    const handleGenerateContentClick = useCallback(() => setIsAiPromptOpen(true), []);

    if (isSaved && !isEditing) {
        return (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 glass-effect rounded-lg">
                <h2 className="text-3xl font-bold mb-4">¡Recurso Guardado!</h2>
                <p className="text-lg text-gray-300 mb-8">El recurso ha sido guardado correctamente.</p>
                <Button size="lg" onClick={resetForm}><PlusCircle className="mr-2 h-5 w-5" />Añadir otro recurso</Button>
            </motion.div>
        );
    }
    
    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 p-1 rounded-lg bg-background/50">
                    <Button variant={view === 'edit' ? 'secondary' : 'ghost'} onClick={() => setView('edit')}><Edit className="w-4 h-4 mr-2" />Editar</Button>
                    <Button variant={view === 'preview' ? 'secondary' : 'ghost'} onClick={() => setView('preview')}><Eye className="w-4 h-4 mr-2" />Previsualizar</Button>
                </div>
            </div>

            {view === 'edit' ? (
                <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <PostFormInputs
                                title={title} setTitle={setTitle}
                                postSection={postSectionId} setPostSection={handleSectionChange} sections={sections}
                                postCategory={postCategoryId} setPostCategory={handleCategoryChange} availableCategories={availableCategories}
                                postSubcategory={postSubcategoryId} setPostSubcategory={setPostSubcategoryId} availableSubcategories={availableSubcategories}
                                excerpt={excerpt} setExcerpt={setExcerpt} onAiAction={handleAiAction} isAiLoading={isAiLoading}
                            />
                            <TiptapEditor content={content} onChange={setContent} onAiAction={handleAiAction} onGenerateContent={handleGenerateContentClick} getEditor={(editor) => { editorRef.current = editor; }} />
                             <PostFormCustomFields customFields={customFields} setCustomFields={setCustomFields} />
                        </div>
                        <PostFormSidebar
                            hasDownload={hasDownload} setHasDownload={setHasDownload}
                            downloadType={downloadType} setDownloadType={setDownloadType}
                            downloadUrl={downloadUrl} setDownloadUrl={setDownloadUrl}
                            setDownloadFile={setDownloadFile} initialData={initialData}
                            customAuthorName={customAuthorName} setCustomAuthorName={setCustomAuthorName}
                            showAuthor={showAuthor} setShowAuthor={setShowAuthor}
                            showDate={showDate} setShowDate={setShowDate}
                            showMainImageInPost={showMainImageInPost} setShowMainImageInPost={setShowMainImageInPost}
                            mainImageSizeInPost={mainImageSizeInPost} setMainImageSizeInPost={setMainImageSizeInPost}
                            isPremium={isPremium} setIsPremium={setIsPremium} price={price} setPrice={setPrice}
                            currency={currency} setCurrency={setCurrency}
                            isDiscountActive={isDiscountActive} setIsDiscountActive={setIsDiscountActive}
                            discountPercentage={discountPercentage} setDiscountPercentage={setDiscountPercentage}
                            isScheduled={isScheduled} setIsScheduled={setIsScheduled}
                            publishedAt={publishedAt} setPublishedAt={setPublishedAt}
                            isFeatured={isFeatured} setIsFeatured={setIsFeatured}
                            onLoadTemplate={handleLoadTemplate}
                            getTemplateData={getPostData}
                            commentsEnabled={commentsEnabled} setCommentsEnabled={setCommentsEnabled}
                        />
                    </div>
                    <PostFormSeo metaTitle={metaTitle} setMetaTitle={setMetaTitle} slug={slug} setSlug={setSlug} generateSlug={generateSlug} metaDescription={metaDescription} setMetaDescription={setMetaDescription} mainImagePreview={mainImagePreview} setMainImagePreview={setMainImagePreview} keywords={keywords} setKeywords={setKeywords} onAiAction={handleAiAction} isAiLoading={isAiLoading} />
                    
                    <div className="pt-8 mt-8 border-t-2 border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="w-full sm:w-auto">
                            {isEditing && isAdmin && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="lg" className="px-8 py-6 text-lg w-full" disabled={isUploading}><Trash2 className="mr-2 h-5 w-5" />Eliminar Recurso</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción es irreversible.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeletePost}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-4 w-full sm:w-auto">
                            {isAdmin ? (
                                <>
                                    <Button type="button" variant="outline" size="lg" onClick={() => handleFormSubmit('draft')} className="px-8 py-6 text-lg w-full" disabled={isUploading}><Save className="mr-2 h-5 w-5" />Guardar Borrador</Button>
                                    {isScheduled ? (
                                        <Button type="button" size="lg" onClick={() => handleFormSubmit('scheduled')} className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-6 text-lg font-semibold w-full" disabled={isUploading}><CalendarClock className="mr-2 h-5 w-5" />Programar</Button>
                                    ) : (
                                        <Button type="button" size="lg" onClick={() => handleFormSubmit('published')} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-6 text-lg font-semibold w-full" disabled={isUploading}><Send className="mr-2 h-5 w-5" />{isEditing ? 'Actualizar y Publicar' : 'Publicar'}</Button>
                                    )}
                                </>
                            ) : (
                                <Button type="button" size="lg" onClick={() => handleFormSubmit('pending_approval')} className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white px-8 py-6 text-lg font-semibold w-full" disabled={isUploading}><Send className="mr-2 h-5 w-5" />{isEditing ? 'Proponer Edición' : 'Enviar para Revisión'}</Button>
                            )}
                        </div>
                    </div>
                </form>
            ) : (
                <PostPreview 
                    postData={getPostData()}
                    sectionData={sections.find(s => String(s.id) === postSectionId)}
                    categoryData={availableCategories.find(c => String(c.id) === postCategoryId)}
                    subcategoryData={availableSubcategories.find(s => String(s.id) === postSubcategoryId)}
                />
            )}

             <Dialog open={isAiPromptOpen} onOpenChange={setIsAiPromptOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generar Contenido con IA</DialogTitle>
                        <DialogDescription>
                            Escribe un prompt detallado para que la IA genere el contenido.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Ej: Escribe un artículo de 500 palabras sobre..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        rows={5}
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAiPromptOpen(false)}>Cancelar</Button>
                        <Button onClick={() => handleAiAction('generate-content', customPrompt)} disabled={isAiLoading}>
                            {isAiLoading ? 'Generando...' : 'Generar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default PostForm;