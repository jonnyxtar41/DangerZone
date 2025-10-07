
import { supabase } from '@/lib/customSupabaseClient';

export const listSiteAssets = async () => {
    const { data, error } = await supabase.storage
        .from('site-assets')
        .list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });

    return { data, error };
};

export const deleteSiteAsset = async (assetName) => {
    const { data, error } = await supabase.storage
        .from('site-assets')
        .remove([assetName]);

    return { data, error };
};

export const uploadSiteAsset = async (file, path) => {
    const { data, error } = await supabase.storage
      .from('site-assets')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Error uploading asset:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('site-assets')
      .getPublicUrl(data.path);
      
    return publicUrlData.publicUrl;
};
