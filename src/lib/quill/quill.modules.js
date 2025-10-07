import { Quill } from 'react-quill';
    import { toast } from '@/components/ui/use-toast';
    import ImageResize from 'quill-image-resize-module-react';
    
    Quill.register('modules/imageResize', ImageResize);
    
    const insertAdBlock = (quillRef) => {
        if (!quillRef.current) return;
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'adblock', true, Quill.sources.USER);
        quill.setSelection(range.index + 1, Quill.sources.SILENT);
    };
    
    const insertDivider = (quillRef) => {
        if (!quillRef.current) return;
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'divider', true, Quill.sources.USER);
        quill.setSelection(range.index + 1, Quill.sources.SILENT);
    }
    
    export const getQuillModules = (quillRef) => ({
        toolbar: {
            container: "#toolbar",
            handlers: {
                'adblock': () => insertAdBlock(quillRef),
                'divider': () => insertDivider(quillRef),
                'image': function() {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();
                    input.onchange = async () => {
                        const file = input.files[0];
                        if (/^image\//.test(file.type)) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const range = this.quill.getSelection(true);
                                this.quill.insertEmbed(range.index, 'image', e.target.result, Quill.sources.USER);
                                this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
                            };
                            reader.readAsDataURL(file);
                        } else {
                             toast({
                                title: "❌ Tipo de archivo no válido",
                                description: "Por favor, selecciona un archivo de imagen.",
                                variant: "destructive",
                            });
                        }
                    };
                }
            }
        },
        imageResize: {
            parchment: Quill.import('parchment'),
            modules: ['Resize', 'DisplaySize', 'Toolbar']
        },
        table: false, 
    });