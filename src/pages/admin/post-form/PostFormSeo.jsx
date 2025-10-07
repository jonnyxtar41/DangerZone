import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import KeywordInput from './KeywordInput';
import { Button } from '@/components/ui/button';

const PostFormSeo = ({
    metaTitle,
    setMetaTitle,
    slug,
    setSlug,
    generateSlug,
    metaDescription,
    setMetaDescription,
    mainImagePreview,
    setMainImage,
    setMainImagePreview,
    keywords,
    setKeywords,
    onAiAction,
    isAiLoading,
}) => {
    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMainImage(reader.result);
                setMainImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const defaultKeywords = [
        "React", "JavaScript", "Tutorial", "Desarrollo Web", "Guía", "TailwindCSS", "Vite", "Frontend"
    ];

    return (
        <div className="grid lg:grid-cols-3 gap-8 pt-8 border-t border-white/20">
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-2xl font-bold">Optimización SEO</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center">
                            <Label htmlFor="metaTitle">Meta Título</Label>
                            <Button variant="ghost" size="sm" onClick={() => onAiAction('generate-meta-title')} disabled={isAiLoading}>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generar
                            </Button>
                        </div>
                        <Input id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Título para SEO (máx 60 caracteres)" className="mt-2 bg-black/30 border-white/20" />
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug (URL amigable)</Label>
                        <Input id="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} placeholder="ej-url-amigable" className="mt-2 bg-black/30 border-white/20" />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="metaDescription">Meta Descripción</Label>
                        <Button variant="ghost" size="sm" onClick={() => onAiAction('generate-meta-description')} disabled={isAiLoading}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generar
                        </Button>
                    </div>
                    <Textarea id="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Descripción para SEO (máx 160 caracteres)" className="mt-2 bg-black/30 border-white/20" />
                </div>
                 <div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="keywords">Palabras Clave (Keywords)</Label>
                        <Button variant="ghost" size="sm" onClick={() => onAiAction('generate-keywords')} disabled={isAiLoading}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generar
                        </Button>
                    </div>
                    <KeywordInput
                        keywords={keywords}
                        setKeywords={setKeywords}
                        defaultKeywords={defaultKeywords}
                    />
                </div>
            </div>
            <div className="space-y-6">
                 <h3 className="text-2xl font-bold">Imagen Principal</h3>
                <div className="w-full aspect-video bg-black/30 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center mb-4 overflow-hidden">
                    {mainImagePreview ? (
                        <img src={mainImagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center text-gray-400">
                            <ImageIcon className="mx-auto h-12 w-12" />
                            <p>Sube una imagen</p>
                        </div>
                    )}
                </div>
                <Input id="mainImage" type="file" accept="image/*" onChange={handleMainImageChange} className="bg-black/30 border-white/20 file:text-white" />
            </div>
        </div>
    );
};

export default PostFormSeo;