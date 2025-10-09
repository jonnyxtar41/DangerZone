import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import BaseImage from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Youtube from '@tiptap/extension-youtube';
import Highlight from '@tiptap/extension-highlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import BaseTableCell from '@tiptap/extension-table-cell';
import TiptapToolbar from './TiptapToolbar';
import { useToast } from '@/components/ui/use-toast';
import { AlignCenter, AlignLeft, AlignRight, Trash2 } from 'lucide-react';

// --- Componente para la imagen redimensionable ---
const ResizableImageTemplate = ({ node, updateAttributes, editor, getPos }) => {
  const { src, alt, align, width, height } = node.attrs;

  const handleAlign = (newAlign) => {
    updateAttributes({ align: newAlign });
  };

  const handleDelete = () => {
    const pos = getPos();
    editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      e.target.blur();
    }
  };

  const handleSizeChange = (attribute, value) => {
    const trimmedValue = value.trim();
    if (/^\d+$/.test(trimmedValue)) {
      updateAttributes({ [attribute]: `${trimmedValue}%` });
    } else {
      updateAttributes({ [attribute]: trimmedValue });
    }
  };

  return (
    <NodeViewWrapper
      className="resizable-image-wrapper relative group"
      data-align={align}
    >
      <div style={{ width }} className={`mx-auto ${align === 'left' ? 'mr-auto ml-0' : align === 'right' ? 'ml-auto mr-0' : 'mx-auto'}`}>
        <img src={src} alt={alt} className="w-full h-auto" style={{ height }} />
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm rounded p-1">
        <button onClick={() => handleAlign('left')} className={`p-1 rounded ${align === 'left' ? 'bg-muted' : ''}`}><AlignLeft className="w-4 h-4" /></button>
        <button onClick={() => handleAlign('center')} className={`p-1 rounded ${align === 'center' ? 'bg-muted' : ''}`}><AlignCenter className="w-4 h-4" /></button>
        <button onClick={() => handleAlign('right')} className={`p-1 rounded ${align === 'right' ? 'bg-muted' : ''}`}><AlignRight className="w-4 h-4" /></button>
        <button onClick={handleDelete} className="p-1 rounded bg-destructive"><Trash2 className="w-4 h-4" /></button>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm rounded p-1">
        <input
          type="text"
          className="w-24 bg-input text-foreground text-xs p-1 rounded"
          placeholder="Ancho (ej: 50%)"
          defaultValue={width}
          onBlur={(e) => handleSizeChange('width', e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="text"
          className="w-24 bg-input text-foreground text-xs p-1 rounded"
          placeholder="Alto (ej: auto)"
          defaultValue={height}
          onBlur={(e) => handleSizeChange('height', e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </NodeViewWrapper>
  );
};
// --- Extensión de Tiptap para la imagen ---
const ResizableImage = BaseImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: (attributes) => ({ style: `width: ${attributes.width};` }),
      },
      height: {
        default: 'auto',
        renderHTML: (attributes) => ({ style: `height: ${attributes.height};` }),
      },
      align: {
        default: 'center',
        renderHTML: (attributes) => ({ 'data-align': attributes.align }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageTemplate);
  },
});

// --- Extensión para las celdas de la tabla (soluciona el espaciado) ---
const TableCell = BaseTableCell.extend({
  content: 'block+',
});

// --- Componente principal del editor ---
const TiptapEditor = ({ content, onChange, placeholder = "Empieza a escribir aquí...", onAiAction, onGenerateContent, getEditor }) => {
  const { toast } = useToast();

  const handleImageUpload = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({
        title: "❌ Tipo de archivo no válido",
        description: "Por favor, selecciona un archivo de imagen.",
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => editor.chain().focus().setImage({ src: e.target.result }).run();
    reader.readAsDataURL(file);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        validate: href => /^https?:\/\//.test(href),
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Youtube.configure({ controls: false }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'bg-yellow-200/50 dark:bg-yellow-400/50',
        },
      }),
      Table.configure({ resizable: true, allowTableNodeSelection: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[200px] bg-background text-foreground p-4 rounded-b-lg border border-input border-t-0',
      },
      handleDrop: (view, event) => {
        const file = event.dataTransfer?.files?.[0];
        if (file) {
          event.preventDefault();
          handleImageUpload(file);
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const file = event.clipboardData?.files?.[0];
        if (file) {
          event.preventDefault();
          handleImageUpload(file);
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (getEditor && editor) getEditor(editor);
  }, [editor, getEditor]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className="w-full">
      <TiptapToolbar editor={editor} onAiAction={onAiAction} onImageUpload={handleImageUpload} onGenerateContent={onGenerateContent} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;