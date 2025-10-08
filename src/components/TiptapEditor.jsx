
import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Youtube from '@tiptap/extension-youtube';
import TiptapToolbar from './TiptapToolbar';
import { useToast } from '@/components/ui/use-toast';

const TiptapEditor = ({ content, onChange, placeholder = "Empieza a escribir aquí...", onAiAction, getEditor }) => {
  const { toast } = useToast();

  const handleImageUpload = useCallback((file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "❌ Tipo de archivo no válido",
        description: "Por favor, selecciona un archivo de imagen.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Youtube.configure({
        controls: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[200px] bg-background text-foreground p-4 rounded-b-lg border border-input border-t-0',
      },
      handleDrop: (view, event) => {
        if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          handleImageUpload(file);
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length) {
          event.preventDefault();
          const file = event.clipboardData.files[0];
          handleImageUpload(file);
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (getEditor && editor) {
      getEditor(editor);
    }
  }, [editor, getEditor]);
  
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className="w-full">
      <TiptapToolbar editor={editor} onAiAction={onAiAction} onImageUpload={handleImageUpload} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
  