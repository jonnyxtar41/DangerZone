import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const PostFormInputs = ({ 
    title, setTitle, 
    postSection, setPostSection, sections,
    postCategory, setPostCategory, availableCategories, 
    postSubcategory, setPostSubcategory, availableSubcategories, 
    excerpt, setExcerpt,
    onAiAction, isAiLoading
}) => {
    return (
        <div className="space-y-6">
            <div>
                <Label htmlFor="title">Título del Recurso</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Guía Completa de Tiempos Verbales" className="mt-2 bg-black/30 border-white/20" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <div>
                    <Label htmlFor="section">Sección</Label>
                    <Select value={postSection} onValueChange={setPostSection}>
                        <SelectTrigger id="section" className="mt-2 w-full bg-black/30 border-white/20">
                            <SelectValue placeholder="Selecciona una sección" />
                        </SelectTrigger>
                        <SelectContent>
                            {sections && sections.map(sec => (
                                <SelectItem key={sec.id} value={String(sec.id)}>{sec.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={postCategory} onValueChange={setPostCategory} disabled={!postSection || !availableCategories || availableCategories.length === 0}>
                        <SelectTrigger id="category" className="mt-2 w-full bg-black/30 border-white/20">
                            <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableCategories && availableCategories.map(cat => (
                                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="subcategory">Subcategoría</Label>
                    <Select value={postSubcategory} onValueChange={setPostSubcategory} disabled={!postCategory || !availableSubcategories || availableSubcategories.length === 0}>
                        <SelectTrigger id="subcategory" className="mt-2 w-full bg-black/30 border-white/20">
                            <SelectValue placeholder="Selecciona una subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.isArray(availableSubcategories) && availableSubcategories.map(sub => (
                                <SelectItem key={sub.id} value={String(sub.id)}>{sub.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <div className="flex justify-between items-center">
                    <Label htmlFor="excerpt">Resumen (Extracto)</Label>
                    <Button variant="ghost" size="sm" onClick={() => onAiAction('generate-excerpt')} disabled={isAiLoading}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generar con IA
                    </Button>
                </div>
                <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Un resumen corto y atractivo del recurso." className="mt-2 bg-black/30 border-white/20" />
            </div>
        </div>
    );
};

export default PostFormInputs;