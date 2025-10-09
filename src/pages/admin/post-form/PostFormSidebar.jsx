import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { DollarSign, Percent } from 'lucide-react';

const PostFormSidebar = ({
    hasDownload,
    setHasDownload,
    downloadType,
    setDownloadType,
    downloadUrl,
    setDownloadUrl,
    setDownloadFile,
    initialData,
    customAuthorName,
    setCustomAuthorName,
    showAuthor,
    setShowAuthor,
    showDate,
    setShowDate,
    showMainImageInPost,
    setShowMainImageInPost,
    mainImageSizeInPost,
    setMainImageSizeInPost,
    isPremium,
    setIsPremium,
    price,
    setPrice,
    currency,
    setCurrency,
    isDiscountActive,
    setIsDiscountActive,
    discountPercentage,
    setDiscountPercentage,

}) => {
    const { permissions } = useAuth();
    const canManageContent = permissions?.['manage-content'];
    const canMonetize = permissions?.['payments'];
    return (
        <div className="space-y-6 glass-effect p-6 rounded-lg">
            {canManageContent && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Opciones de Autor</h3>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="show-author">Mostrar Autor</Label>
                        <Switch id="show-author" checked={showAuthor} onCheckedChange={setShowAuthor} />
                    </div>
                    {showAuthor && (
                        <div>
                            <Label htmlFor="custom-author-name">Nombre de Autor Personalizado</Label>
                            <Input
                                id="custom-author-name"
                                value={customAuthorName}
                                onChange={(e) => setCustomAuthorName(e.target.value)}
                                placeholder="Dejar en blanco para usar el predeterminado"
                                className="mt-1 bg-input"
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Opciones de Visualización</h3>
                <div className="flex items-center justify-between">
                    <Label htmlFor="show-date">Mostrar Fecha de Publicación</Label>
                    <Switch id="show-date" checked={showDate} onCheckedChange={setShowDate} />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="show-main-image">Mostrar Imagen Principal en Post</Label>
                    <Switch id="show-main-image" checked={showMainImageInPost} onCheckedChange={setShowMainImageInPost} />
                </div>
                {showMainImageInPost && (
                    <div>
                        <Label>Tamaño de Imagen en Post</Label>
                        <Select value={mainImageSizeInPost} onValueChange={setMainImageSizeInPost}>
                            <SelectTrigger className="mt-1 bg-input">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Pequeño</SelectItem>
                                <SelectItem value="medium">Mediano</SelectItem>
                                <SelectItem value="large">Grande</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Descarga</h3>
                <div className="flex items-center justify-between">
                    <Label htmlFor="has-download">Habilitar Descarga</Label>
                    <Switch id="has-download" checked={hasDownload} onCheckedChange={setHasDownload} />
                </div>
                {hasDownload && (
                    <div className="space-y-4">
                        <RadioGroup value={downloadType} onValueChange={setDownloadType}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="url" id="url" />
                                <Label htmlFor="url">URL Externa</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="file" id="file" />
                                <Label htmlFor="file">Subir Archivo</Label>
                            </div>
                        </RadioGroup>
                        {downloadType === 'url' ? (
                            <Input
                                type="text"
                                placeholder="https://ejemplo.com/descarga"
                                value={downloadUrl}
                                onChange={(e) => setDownloadUrl(e.target.value)}
                                className="bg-input"
                            />
                        ) : (
                            <div>
                                <Input
                                    type="file"
                                    onChange={(e) => setDownloadFile(e.target.files[0])}
                                    className="bg-input"
                                />
                                {initialData?.download?.type === 'file' && initialData?.download?.url && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Archivo actual: {initialData.download.url.split('/').pop()}. Sube uno nuevo para reemplazarlo.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>


            {canManageContent && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Monetización</h3>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="is-premium">Recurso Premium (de pago)</Label>
                        <Switch id="is-premium" checked={isPremium} onCheckedChange={setIsPremium} />
                    </div>
                    {isPremium && (
                        <div className="space-y-4 pt-4 border-t border-border">
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio</Label>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="19.99"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="bg-input"
                                    />
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger className="w-[120px] bg-input"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="MXN">MXN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                    
                            <div className="flex items-center justify-between pt-4">
                                <Label htmlFor="is-discount-active">Aplicar Descuento</Label>
                                <Switch id="is-discount-active" checked={isDiscountActive} onCheckedChange={setIsDiscountActive} />
                            </div>
                            {isDiscountActive && (
                                <div className="space-y-2">
                                    <Label htmlFor="discount">Porcentaje de Descuento</Label>
                                    <div className="flex items-center gap-2">
                                        <Percent className="h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="discount"
                                            type="number"
                                            step="1"
                                            min="1"
                                            max="100"
                                            placeholder="Ej: 25"
                                            value={discountPercentage}
                                            onChange={(e) => setDiscountPercentage(e.target.value)}
                                            className="bg-input"
                                        />
                                    </div>
                                </div>
                            )}
                         
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default PostFormSidebar;