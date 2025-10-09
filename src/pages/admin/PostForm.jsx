
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import PostFormInputs from '@/pages/admin/post-form/PostFormInputs';
import PostFormSidebar from '@/pages/admin/post-form/PostFormSidebar';
import PostFormSeo from '@/pages/admin/post-form/PostFormSeo';
import { Save, Send, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getCategories } from '@/lib/supabase/categories';
import { getSubcategories } from '@/lib/supabase/subcategories';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import TiptapEditor from '@/components/TiptapEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deletePost } from '@/lib/supabase/posts';
import { uploadDownloadableAsset } from '@/lib/supabase/assets';

const PostForm = ({ sections, onSave, onNewPost, initialData = {}, onUpdate }) => {
  const { toast } = useToast();
  const { user, permissions } = useAuth();
  const navigate = useNavigate();
  const editorRef = useRef(null);
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
  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = !!initialData.id;
  const isAdmin = permissions?.['manage-content'];

  const handleAiAction = useCallback(async (action, promptOverride = '') => {
    setIsAiLoading(true);
    toast({ title: '🤖 IA en progreso...', description: 'El asistente de IA está trabajando en tu solicitud.' });

    const editor = editorRef.current;
    if (!editor && action !== 'generate-title' && action !== 'generate-meta-title' && action !== 'generate-meta-description' && action !== 'generate-keywords' && action !== 'generate-excerpt') {
      toast({ title: '❌ Editor no listo', description: 'El editor de texto no está disponible.', variant: 'destructive' });
      setIsAiLoading(false);
      return;
    }

    const { from, to } = editor ? editor.state.selection : { from: 0, to: 0 };
    const selectedText = editor ? editor.state.doc.textBetween(from, to, ' ') : '';
    const fullContent = editor ? editor.getHTML() : '';

    let prompt;
    let targetField = 'content';

    switch (action) {
      case 'generate-title':
        prompt = `Mejora este título para un blog, hazlo más atractivo y optimizado para SEO: "${title}"`;
        targetField = 'title';
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
        prompt = `Genera un resumen o extracto (excerpt) atractivo y conciso de blogger profesional para un artículo con el siguiente contenido: "${fullContent}"`;
        targetField = 'excerpt';
        break;
      case 'custom':
        prompt = promptOverride;
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

      if (targetField === 'content' && editor) {
        const newContent = `<mark>${aiResponse}</mark>`;
        if (selectedText) {
          editor.chain().focus().deleteRange({ from, to }).insertContent(newContent).run();
        } else {
          editor.chain().focus().insertContentAt(editor.state.selection.from, newContent).run();
        }
      } else if (targetField === 'title') {
        setTitle(aiResponse.replace(/["']/g, ''));
      } else if (targetField === 'metaTitle') {
        setMetaTitle(aiResponse.replace(/["']/g, ''));
      } else if (targetField === 'metaDescription') {
        setMetaDescription(aiResponse.replace(/["']/g, ''));
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
      if (action === 'custom') {
        setIsAiPromptOpen(false);
        setCustomPrompt('');
      }
    }
  }, [toast, title, editorRef]);

  const handleGenerateContentClick = () => {
    setIsAiPromptOpen(true);
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
    if (onNewPost) onNewPost();
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
    if (isUploading) {
        toast({
            title: "Subida en progreso",
            description: "Por favor, espera a que termine de subir el archivo.",
            variant: "destructive"
        });
        return;
    }
    if (!title || !postSectionId || !postCategoryId) {
      toast({
        title: "❌ Campos incompletos",
        description: "Por favor, rellena título, sección y categoría.",
        variant: "destructive",
      });
      return;
    }

    if (status === 'published' && !mainImagePreview) {
      toast({
        title: "❌ Imagen destacada requerida",
        description: "No se puede publicar un recurso sin una imagen principal. Por favor, añade una o guárdalo como borrador.",
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

      let finalDownloadUrl = downloadUrl;
      if (downloadType === 'file' && downloadFile) {
        setIsUploading(true);
        toast({ title: "Subiendo archivo...", description: "Por favor espera." });
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

      downloadData = {
        type: downloadType,
        url: finalDownloadUrl
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





  const handleDeletePost = async () => {
    if (!isEditing) return;
    const { error } = await deletePost(initialData.id, initialData.title, true);
    if (error) {
      toast({
        title: '❌ Error al eliminar',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '🗑️ Recurso eliminado',
        description: `"${initialData.title}" ha sido eliminado permanentemente.`,
      });
      if (onUpdate) onUpdate();
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
            <TiptapEditor
              content={content}
              onChange={setContent}
              onAiAction={handleAiAction}
              onGenerateContent={handleGenerateContentClick}
              getEditor={(editor) => { editorRef.current = editor; }}
            />
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
        <div className="pt-8 mt-8 border-t-2 border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex-1">
            {isEditing && isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="lg" className="px-8 py-6 text-lg" disabled={isUploading}>
                    <Trash2 className="mr-2 h-5 w-5" />
                    Eliminar Recurso
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción es irreversible y eliminará permanentemente el recurso "{title}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePost}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="flex-1 flex flex-col sm:flex-row justify-end gap-4">
            {isAdmin ? (
              <>
                <Button type="button" variant="outline" size="lg" onClick={() => handleFormSubmit('draft')} className="px-8 py-6 text-lg" disabled={isUploading}>
                  <Save className="mr-2 h-5 w-5" />
                  {isUploading ? 'Subiendo...' : 'Guardar Borrador'}
                </Button>
                <Button type="button" size="lg" onClick={() => handleFormSubmit('published')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold" disabled={isUploading}>
                  <Send className="mr-2 h-5 w-5" />
                  {isUploading ? 'Subiendo...' : (isEditing ? 'Actualizar y Publicar' : 'Publicar Recurso')}
                </Button>
              </>
            ) : (
              <Button type="button" size="lg" onClick={() => handleFormSubmit('pending_approval')} className="bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white px-8 py-6 text-lg font-semibold" disabled={isUploading}>
                <Send className="mr-2 h-5 w-5" />
                 {isUploading ? 'Subiendo...' : (isEditing ? 'Proponer Edición' : 'Enviar para Revisión')}
              </Button>
            )}
          </div>
        </div>
      </form>
      <Dialog open={isAiPromptOpen} onOpenChange={setIsAiPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Contenido con IA</DialogTitle>
            <DialogDescription>
              Escribe una instrucción clara para la IA. Por ejemplo: "Crea una introducción sobre los verbos irregulares en inglés".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="custom-prompt">Tu Prompt:</Label>
            <Textarea
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ej: Escribe 3 párrafos sobre la importancia de la lectura..."
              className="bg-black/30 border-white/20 min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAiPromptOpen(false)}>Cancelar</Button>
            <Button onClick={() => handleAiAction('custom', customPrompt)} disabled={isAiLoading || !customPrompt}>
              {isAiLoading ? 'Generando...' : 'Generar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PostForm;
  