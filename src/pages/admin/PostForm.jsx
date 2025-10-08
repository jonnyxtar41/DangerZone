import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import ReactQuill from 'react-quill';
    import PostFormInputs from '@/pages/admin/post-form/PostFormInputs';
    import PostFormSidebar from '@/pages/admin/post-form/PostFormSidebar';
    import PostFormSeo from '@/pages/admin/post-form/PostFormSeo';
    import { CustomToolbar } from '@/pages/admin/post-form/CustomToolbar';
    import { getQuillModules } from '@/lib/quill/quill.modules';
    import { Save, Send, PlusCircle } from 'lucide-react';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { getCategories } from '@/lib/supabase/categories';
    import { getSubcategories } from '@/lib/supabase/subcategories';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/customSupabaseClient';
    
    
    const PostForm = ({ sections, onSave, onNewPost, initialData = {} }) => {
        const { toast } = useToast();
        const { user, role } = useAuth();
        const navigate = useNavigate();
        const quillRef = useRef(null);
        const [title, setTitle] = useState(initialData.title || '');
        const [postSectionId, setPostSectionId] = useState(initialData.section_id || '');
        const [postCategoryId, setPostCategoryId] = useState(initialData.category_id || '');
        const [postSubcategoryId, setPostSubcategoryId] = useState(initialData.subcategory_id || '');
        const [availableCategories, setAvailableCategories] = useState([]);
        const [availableSubcategories, setAvailableSubcategories] = useState([]);
        const [excerpt, setExcerpt] = useState(initialData.excerpt || '');
        const [content, setContent] = useState(initialData.content || '');
        const [hasDownload, setHasDownload] = useState(!!initialData.download);
        const [downloadType, setDownloadType] = useState(initialData.download?.type || 'url');
        const [downloadUrl, setDownloadUrl] = useState(initialData.download?.type === 'url' ? initialData.download.url : '');
        const [downloadFile, setDownloadFile] = useState(null);
        const [mainImage, setMainImage] = useState(null);
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
        
        const [isPremium, setIsPremium] = useState(initialData.is_premium || false);
        const [price, setPrice] = useState(initialData.price || '');
        const [currency, setCurrency] = useState(initialData.currency || 'USD');
    
        const [isSaved, setIsSaved] = useState(false);
        const [isAiLoading, setIsAiLoading] = useState(false);
    
        const isEditing = !!initialData.id;
        const isAdmin = role === 'admin';
    
        const handleAiAction = useCallback(async (action, customPrompt = '') => {
            setIsAiLoading(true);
            toast({ title: '🤖 IA en progreso...', description: 'El asistente de IA está trabajando en tu solicitud.' });
    
            const quill = quillRef.current.getEditor();
            const selection = quill.getSelection();
            const selectedText = selection ? quill.getText(selection.index, selection.length) : '';
            const fullContent = quill.getText();
    
            let prompt;
            let targetField = 'content';
    
            switch (action) {
                case 'generate-content':
                    prompt = `Basado en el título "${title}", genera el contenido principal para un artículo de blog.`;
                    break;
                case 'improve-writing':
                    prompt = `Mejora la redacción del siguiente texto: "${selectedText || fullContent}"`;
                    break;
                case 'fix-grammar':
                    prompt = `Corrige la gramática y la ortografía del siguiente texto: "${selectedText || fullContent}"`;
                    break;
                case 'make-shorter':
                    prompt = `Haz más corto y conciso el siguiente texto: "${selectedText || fullContent}"`;
                    break;
                case 'make-longer':
                    prompt = `Expande y haz más largo el siguiente texto: "${selectedText || fullContent}"`;
                    break;
                case 'generate-meta-title':
                    prompt = `Genera un meta título optimizado para SEO (máximo 60 caracteres) para un artículo con el siguiente contenido: "${fullContent}"`;
                    targetField = 'metaTitle';
                    break;
                case 'generate-meta-description':
                    prompt = `Genera una meta descripción optimizada para SEO (máximo 160 caracteres) para un artículo con el siguiente contenido: "${fullContent}"`;
                    targetField = 'metaDescription';
                    break;
                case 'generate-keywords':
                    prompt = `Genera una lista de 5 a 10 palabras clave (keywords) relevantes y separadas por comas para un artículo con el siguiente contenido: "${fullContent}"`;
                    targetField = 'keywords';
                    break;
                case 'generate-excerpt':
                    prompt = `Genera un resumen o extracto (excerpt) atractivo y conciso para un artículo con el siguiente contenido: "${fullContent}"`;
                    targetField = 'excerpt';
                    break;
                case 'custom':
                    prompt = customPrompt;
                    break;
                default:
                    setIsAiLoading(false);
                    return;
            }
    
            try {
                const { data, error } = await supabase.functions.invoke('ai-assistant', {
                body: JSON.stringify({ prompt }),
            });
    
                if (error) throw error;
                if (data.error) throw new Error(data.error)
    
                const aiResponse = data.response;
    
                if (targetField === 'content') {
                    if (selection && selection.length > 0) {
                        quill.deleteText(selection.index, selection.length);
                        quill.insertText(selection.index, aiResponse);
                    } else {
                        const delta = quill.clipboard.convert(aiResponse);
                        quill.setContents(delta, 'silent');
                    }
                    setContent(quill.root.innerHTML);
                } else if (targetField === 'metaTitle') {
                    setMetaTitle(aiResponse.replace(/["']/g, '')); // Limpiar comillas
                } else if (targetField === 'metaDescription') {
                    setMetaDescription(aiResponse.replace(/["']/g, '')); // Limpiar comillas
                } else if (targetField === 'keywords') {
                    setKeywords(aiResponse.split(',').map(k => k.trim()).filter(Boolean));
                } else if (targetField === 'excerpt') {
                    setExcerpt(aiResponse);
                }
                toast({ title: '✅ ¡Éxito!', description: 'La IA ha completado tu solicitud.' });
            } catch (error) {
                toast({
                    title: '❌ Error de IA',
                    description: 'No se pudo procesar la solicitud. Asegúrate de que la Edge Function "ai-assistant" y el secreto de la API estén configurados en Supabase.',
                    variant: 'destructive',
                });
                console.error('AI Assistant Error:', error);
            } finally {
                setIsAiLoading(false);
            }
        }, [toast, title]);
    
        const quillModules = useMemo(() => getQuillModules(quillRef), []);
    
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
            return str
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };
    
        const resetForm = () => {
            setTitle('');
            setPostSectionId('');
            setPostCategoryId('');
            setPostSubcategoryId('');
            setExcerpt('');
            setContent('');
            setHasDownload(false);
            setDownloadType('url');
            setDownloadUrl('');
            setDownloadFile(null);
            setMainImage(null);
            setMainImagePreview('');
            setMetaTitle('');
            setMetaDescription('');
            setSlug('');
            setKeywords([]);
            setCustomAuthorName('');
            setShowAuthor(false);
            setShowDate(true);
            setShowMainImageInPost(true);
            setMainImageSizeInPost('medium');
            setIsPremium(false);
            setPrice('');
            setCurrency('USD');
            setIsSaved(false);
            if(onNewPost) onNewPost();
        };
    
        useEffect(() => {
            if (title && !isEditing && !isSaved) {
                setSlug(generateSlug(title));
            }
            if (title && !metaTitle) {
                setMetaTitle(title);
            }
        }, [title, metaTitle, isEditing, isSaved]);
    
        useEffect(() => {
            if (excerpt && !metaDescription) {
                setMetaDescription(excerpt);
            }
        }, [excerpt, metaDescription]);
    
        const handleFormSubmit = async (status) => {
            if (!title || !postSectionId || !postCategoryId) {
                toast({
                    title: "❌ Campos incompletos",
                    description: "Por favor, rellena título, sección y categoría.",
                    variant: "destructive",
                });
                return;
            }
    
            if (isPremium && (!price || parseFloat(price) <= 0)) {
                toast({
                    title: "❌ Precio no válido",
                    description: "Si el recurso es premium, debe tener un precio mayor a cero.",
                    variant: "destructive",
                });
                return;
            }
    
            let downloadData = null;
            if (hasDownload) {
                if (downloadType === 'url' && !downloadUrl) {
                    toast({ title: "❌ URL de descarga requerida", variant: "destructive" });
                    return;
                }
                if (downloadType === 'file' && !downloadFile && (!initialData.download || initialData.download.type !== 'file')) {
                    toast({ title: "❌ Archivo de descarga requerido", variant: "destructive" });
                    return;
                }
                downloadData = {
                    type: downloadType,
                    url: downloadType === 'url' ? downloadUrl : (downloadFile ? `#file-placeholder:${downloadFile.name}` : initialData.download.url)
                };
            }
    
            const postData = {
                title,
                author: user.email,
                section_id: postSectionId,
                category_id: postCategoryId,
                subcategory_id: postSubcategoryId || null,
                excerpt,
                content,
                image_description: metaDescription || excerpt,
                download: downloadData,
                main_image_url: mainImagePreview,
                meta_title: metaTitle || title,
                meta_description: metaDescription || excerpt,
                slug: slug ? generateSlug(slug) : generateSlug(title),
                keywords,
                status,
                custom_author_name: customAuthorName,
                show_author: showAuthor,
                show_date: showDate,
                show_main_image_in_post: showMainImageInPost,
                main_image_size_in_post: mainImageSizeInPost,
                is_premium: isPremium,
                price: isPremium ? parseFloat(price) : null,
                currency: isPremium ? currency : null,
            };
            const success = await onSave(postData, isEditing, initialData);
    
            if (success && !isEditing) {
                setIsSaved(true);
            } else if (success && isEditing) {
                navigate('/control-panel-7d8a2b3c4f5e/dashboard');
            }
        };
    
        if (isSaved && !isEditing) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center py-20 glass-effect rounded-lg"
                >
                    <h2 className="text-3xl font-bold mb-4">¡Recurso Guardado!</h2>
                    <p className="text-lg text-gray-300 mb-8">El recurso ha sido guardado correctamente.</p>
                    <Button size="lg" onClick={resetForm}>
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Añadir otro recurso
                    </Button>
                </motion.div>
            );
        }
    
        return (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <PostFormInputs
                                title={title}
                                setTitle={setTitle}
                                postSection={postSectionId}
                                setPostSection={handleSectionChange}
                                sections={sections}
                                postCategory={postCategoryId}
                                setPostCategory={handleCategoryChange}
                                availableCategories={availableCategories}
                                postSubcategory={postSubcategoryId}
                                setPostSubcategory={setPostSubcategoryId}
                                availableSubcategories={availableSubcategories}
                                excerpt={excerpt}
                                setExcerpt={setExcerpt}
                                onAiAction={handleAiAction}
                                isAiLoading={isAiLoading}
                            />
                            <div>
                                <CustomToolbar onAiAction={handleAiAction} />
                                 <ReactQuill 
                                    ref={quillRef}
                                    theme="snow" 
                                    value={content} 
                                    onChange={setContent}
                                    modules={quillModules}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                        <PostFormSidebar
                            hasDownload={hasDownload}
                            setHasDownload={setHasDownload}
                            downloadType={downloadType}
                            setDownloadType={setDownloadType}
                            downloadUrl={downloadUrl}
                            setDownloadUrl={setDownloadUrl}
                            setDownloadFile={setDownloadFile}
                            initialData={initialData}
                            customAuthorName={customAuthorName}
                            setCustomAuthorName={setCustomAuthorName}
                            showAuthor={showAuthor}
                            setShowAuthor={setShowAuthor}
                            showDate={showDate}
                            setShowDate={setShowDate}
                            showMainImageInPost={showMainImageInPost}
                            setShowMainImageInPost={setShowMainImageInPost}
                            mainImageSizeInPost={mainImageSizeInPost}
                            setMainImageSizeInPost={setMainImageSizeInPost}
                            isPremium={isPremium}
                            setIsPremium={setIsPremium}
                            price={price}
                            setPrice={setPrice}
                            currency={currency}
                            setCurrency={setCurrency}
                        />
                    </div>
                    <PostFormSeo
                        metaTitle={metaTitle}
                        setMetaTitle={setMetaTitle}
                        slug={slug}
                        setSlug={setSlug}
                        generateSlug={generateSlug}
                        metaDescription={metaDescription}
                        setMetaDescription={setMetaDescription}
                        mainImagePreview={mainImagePreview}
                        setMainImage={setMainImage}
                        setMainImagePreview={setMainImagePreview}
                        keywords={keywords}
                        setKeywords={setKeywords}
                        onAiAction={handleAiAction}
                        isAiLoading={isAiLoading}
                    />
                    <div className="pt-8 mt-8 border-t-2 border-white/10 flex flex-col sm:flex-row justify-end gap-4">
                        {!isAdmin ? (
                            <Button type="button" size="lg" onClick={() => handleFormSubmit('pending_approval')} className="bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white px-8 py-6 text-lg font-semibold">
                                <Send className="mr-2 h-5 w-5" />
                                {isEditing ? 'Proponer Edición' : 'Enviar para Revisión'}
                            </Button>
                        ) : (
                            <>
                                <Button type="button" variant="outline" size="lg" onClick={() => handleFormSubmit('draft')} className="px-8 py-6 text-lg">
                                    <Save className="mr-2 h-5 w-5" />
                                    Guardar Borrador
                                </Button>
                                <Button type="button" size="lg" onClick={() => handleFormSubmit('published')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold">
                                    <Send className="mr-2 h-5 w-5" />
                                    {isEditing ? 'Actualizar Recurso' : 'Publicar Recurso'}
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </motion.div>
        );
    };
    
    export default PostForm;