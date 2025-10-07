import { supabase } from '@/lib/customSupabaseClient';
import { logActivity } from '@/lib/supabase/log';

export const getSections = async () => {
    const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('order', { ascending: true });

    if (error) {
        console.error('Error fetching sections:', error);
        return [];
    }
    return data;
};

export const addSection = async (sectionData) => {
    const { data, error } = await supabase
        .from('sections')
        .insert([sectionData])
        .select();
    
    if (!error) {
        logActivity(`Admin creó una nueva sección: "${sectionData.name}"`);
    }

    return { data, error };
};

export const updateSection = async (sectionId, sectionData) => {
    const { data, error } = await supabase
        .from('sections')
        .update(sectionData)
        .eq('id', sectionId)
        .select();

    if (!error) {
        logActivity(`Admin actualizó la sección: "${sectionData.name}"`, { sectionId });
    }

    return { data, error };
};

export const updateMultipleSections = async (sections) => {
    const { data, error } = await supabase
        .from('sections')
        .upsert(sections)
        .select();

    if (!error) {
        logActivity(`Admin actualizó el orden/estado de las secciones`);
    }

    return { data, error };
};

export const deleteSection = async (sectionId, sectionName) => {
    const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId);

    if (!error) {
        logActivity(`Admin eliminó la sección: "${sectionName}"`, { sectionId });
    }

    return { error };
};

export const getPostCountForSection = async (sectionId) => {
    const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('section_id', sectionId);
    
    if (error) {
        console.error('Error counting posts for section:', error);
        return 0;
    }

    return count;
};

export const getCategoryCountForSection = async (sectionId) => {
    const { count, error } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('section_id', sectionId);
    
    if (error) {
        console.error('Error counting categories for section:', error);
        return 0;
    }

    return count;
};