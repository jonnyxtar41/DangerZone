import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, FileText, PlusCircle, Trash2, Upload, Bell } from 'lucide-react';
import { getAllSiteContent, updateSiteContent } from '@/lib/supabase/siteContent';
import { uploadSiteAsset } from '@/lib/supabase/assets';
import { getSections, addSection, updateSection, deleteSection } from '@/lib/supabase/sections';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allIcons } from '@/lib/icons.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TiptapEditor from '@/components/TiptapEditor';

const ManageSiteContent = ({ onUpdate }) => {
    const { toast } = useToast();
    const [content, setContent] = useState({});
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState(null);
    const [iconImageFile, setIconImageFile] = useState(null);
    const [iconImagePreview, setIconImagePreview] = useState('');

    const fetchAllData = async () => {
        setLoading(true);
        const [allContent, sectionsData] = await Promise.all([
            getAllSiteContent(),
            getSections(),
        ]);
        const contentMap = allContent.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {});
        setContent(contentMap);
        setSections(sectionsData);
        setLoading(false);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleContentChange = (key, value) => {
        setContent(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            await Promise.all(
                Object.entries(content).map(([key, value]) =>
                    updateSiteContent(key, value)
                )
            );
            toast({
                title: "✅ Contenido Guardado",
                description: "El contenido del sitio ha sido actualizado.",
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            toast({
                title: "❌ Error al guardar",
                description: "No se pudo actualizar el contenido del sitio.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    
    const handleSectionFormChange = (e) => {
        const { name, value } = e.target;
        setEditingSection(prev => ({ ...prev, [name]: value }));
    };
    
    const generateSlug = (str) => {
      if (!str) return '';
      return str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    };

    const handleIconImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIconImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setIconImagePreview(previewUrl);
            setEditingSection(prev => ({ ...prev, icon_image_url: '', icon: '' }));
        }
    };

    const handleSaveSection = async () => {
        if (!editingSection.name) {
            toast({ title: "❌ Falta el nombre", description: "El nombre de la sección es requerido.", variant: "destructive" });
            return;
        }
        if (!editingSection.icon && !editingSection.icon_image_url && !iconImageFile) {
            toast({ title: "❌ Falta el icono", description: "Debes seleccionar un icono o subir una imagen.", variant: "destructive" });
            return;
        }

        let sectionData = { ...editingSection };

        if (iconImageFile) {
            const imageUrl = await uploadSiteAsset(iconImageFile, `section-icons/${Date.now()}-${iconImageFile.name}`);
            if (imageUrl) {
                sectionData.icon_image_url = imageUrl;
                sectionData.icon = null; // Prioritize image over icon
            } else {
                toast({ title: "❌ Error al subir imagen", description: "No se pudo subir la imagen del icono.", variant: "destructive" });
                return;
            }
        }

        sectionData.slug = sectionData.slug ? generateSlug(sectionData.slug) : generateSlug(sectionData.name);
        
        let error;
        if (sectionData.id) {
            ({ error } = await updateSection(sectionData.id, sectionData));
        } else {
            ({ error } = await addSection(sectionData));
        }

        if (error) {
            toast({ title: "❌ Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "✅ Sección guardada", description: `La sección "${sectionData.name}" ha sido guardada.` });
            setEditingSection(null);
            setIconImageFile(null);
            setIconImagePreview('');
            await fetchAllData();
            if(onUpdate) onUpdate();
        }
    };

    const handleDeleteSection = async (sectionId, sectionName) => {
        const { error } = await deleteSection(sectionId, sectionName);
        if (error) {
            toast({ title: "❌ Error", description: "No se pudo eliminar la sección.", variant: "destructive" });
        } else {
            toast({ title: "🗑️ Sección eliminada" });
            await fetchAllData();
            if(onUpdate) onUpdate();
        }
    };
    
    const openEditDialog = (section) => {
        setEditingSection(section);
        setIconImageFile(null);
        setIconImagePreview(section.icon_image_url || '');
    };

    const openNewDialog = () => {
        setEditingSection({ name: '', slug: '', icon: '', icon_image_url: '' });
        setIconImageFile(null);
        setIconImagePreview('');
    };

    if (loading && Object.keys(content).length === 0) {
        return <p>Cargando contenido del sitio...</p>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    Contenido y Estructura del Sitio
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Edita textos, secciones y configuraciones generales de tu plataforma.
                </p>
            </div>

            <div className="space-y-8">
                <div className="glass-effect p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold mb-4">Gestionar Secciones</h3>
                    <div className="space-y-4">
                        {sections.map(sec => (
                            <div key={sec.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {sec.icon_image_url ? (
                                    <img src={sec.icon_image_url} alt={sec.name} className="w-5 h-5 object-contain" />
                                  ) : (
                                    sec.icon && allIcons[sec.icon] && React.createElement(allIcons[sec.icon], { className: "w-5 h-5 text-accent" })
                                  )}
                                  <span className="font-medium">{sec.name}</span>
                                  <span className="text-xs text-muted-foreground">/{sec.slug}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(sec)}>Editar</Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Eliminar</Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente la sección.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSection(sec.id, sec.name)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="mt-6" onClick={openNewDialog}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Añadir Nueva Sección
                    </Button>
                </div>
                
                <Dialog open={!!editingSection} onOpenChange={(isOpen) => !isOpen && setEditingSection(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSection?.id ? 'Editando' : 'Nueva'} Sección</DialogTitle>
                        </DialogHeader>
                        {editingSection && (
                            <div className="space-y-4 py-4">
                                <Input name="name" placeholder="Nombre de la sección" value={editingSection.name} onChange={handleSectionFormChange} className="bg-black/30 border-white/20" />
                                <Input name="slug" placeholder="Slug (auto-generado)" value={editingSection.slug} onChange={handleSectionFormChange} className="bg-black/30 border-white/20" />
                                
                                <div className="space-y-2">
                                    <Label>Icono</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select name="icon" value={editingSection.icon || ''} onValueChange={(value) => setEditingSection(prev => ({...prev, icon: value, icon_image_url: ''}))}>
                                            <SelectTrigger className="bg-black/30 border-white/20"><SelectValue placeholder="Seleccionar icono" /></SelectTrigger>
                                            <SelectContent><SelectItem value="">Ninguno</SelectItem>{Object.entries(allIcons).map(([name, IconComponent]) => (<SelectItem key={name} value={name}><div className="flex items-center gap-2"><IconComponent className="w-4 h-4" /><span>{name}</span></div></SelectItem>))}</SelectContent>
                                        </Select>
                                        <Button asChild variant="outline"><label htmlFor="icon-upload" className="cursor-pointer w-full"><Upload className="w-4 h-4 mr-2" /> Subir Imagen<Input id="icon-upload" type="file" className="hidden" accept="image/*" onChange={handleIconImageFileChange} /></label></Button>
                                    </div>
                                    {(iconImagePreview || editingSection.icon_image_url) && <img src={iconImagePreview || editingSection.icon_image_url} alt="Icono" className="w-8 h-8 mt-2 rounded object-contain bg-slate-700 p-1" />}
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="ghost" onClick={() => setEditingSection(null)}>Cancelar</Button>
                                    <Button onClick={handleSaveSection}>Guardar Sección</Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <div className="glass-effect p-6 rounded-2xl">
                    <Label htmlFor="site_name" className="text-xl font-semibold">Nombre de la Web</Label>
                    <Input id="site_name" value={content.site_name || ''} onChange={(e) => handleContentChange('site_name', e.target.value)} className="mt-2 bg-black/30 border-white/20" placeholder="Ej: Mi increíble blog" />
                </div>
                <div className="glass-effect p-6 rounded-2xl">
                    <Label htmlFor="license_text" className="text-xl font-semibold">Texto de Licencia (Footer)</Label>
                    <Textarea id="license_text" value={content.license_text || ''} onChange={(e) => handleContentChange('license_text', e.target.value)} className="mt-2 bg-black/30 border-white/20" rows={4} />
                </div>
                <div className="glass-effect p-6 rounded-2xl">
                    <Label htmlFor="notification_prompt_frequency_days" className="text-xl font-semibold flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Frecuencia de Notificaciones (Días)
                    </Label>
                    <Input 
                        id="notification_prompt_frequency_days" 
                        type="number"
                        value={content.notification_prompt_frequency_days || '30'} 
                        onChange={(e) => handleContentChange('notification_prompt_frequency_days', e.target.value)} 
                        className="mt-2 bg-black/30 border-white/20" 
                        placeholder="Ej: 30" 
                    />
                    <p className="text-sm text-muted-foreground mt-2">Días a esperar antes de volver a pedir permiso para notificaciones si el usuario lo ignora.</p>
                </div>
                <div className="glass-effect p-6 rounded-2xl">
                    <Label className="text-xl font-semibold">Contenido de la Página de Políticas</Label>
                    <div className="mt-2">
                        <TiptapEditor
                            content={content.policies_page_content || ''}
                            onChange={(newContent) => handleContentChange('policies_page_content', newContent)}
                            placeholder="Escribe el contenido de las políticas aquí..."
                        />
                    </div>
                </div>
            </div>

            <div className="text-center mt-12">
                <Button onClick={handleSaveChanges} size="lg" disabled={loading} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    <Save className="w-5 h-5 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar Cambios Generales'}
                </Button>
            </div>
        </motion.div>
    );
};

export default ManageSiteContent;