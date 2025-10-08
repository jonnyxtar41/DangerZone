
import React, { useCallback } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3, Pilcrow,
  List, ListOrdered, ListX,
  Quote, Code,
  Undo, Redo,
  Link, Image as ImageIcon, Youtube,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Sparkles,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from './ui/button';

const TiptapToolbar = ({ editor, onAiAction, onImageUpload }) => {
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);
  
  if (!editor) {
    return null;
  }

  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube URL');

    if (url) {
      editor.commands.addYoutubeVideo({
        src: url,
      });
    }
  };

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        onImageUpload(file);
      }
    };
    input.click();
  };

  const ToolbarButton = ({ command, args = [], icon, tooltip, isActiveCheck }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => editor.chain().focus()[command](...args).run()}
          disabled={command === 'undo' ? !editor.can().undo() : command === 'redo' ? !editor.can().redo() : false}
          className={`p-2 rounded hover:bg-muted ${editor.isActive(isActiveCheck || command, ...args) ? 'is-active bg-muted' : ''}`}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent><p>{tooltip}</p></TooltipContent>
    </Tooltip>
  );

  return (
    <div className="border border-input bg-transparent rounded-t-lg p-2 flex flex-wrap items-center gap-1">
      <ToolbarButton command="toggleBold" icon={<Bold className="w-4 h-4" />} tooltip="Negrita" isActiveCheck="bold" />
      <ToolbarButton command="toggleItalic" icon={<Italic className="w-4 h-4" />} tooltip="Cursiva" isActiveCheck="italic" />
      <ToolbarButton command="toggleUnderline" icon={<Underline className="w-4 h-4" />} tooltip="Subrayado" isActiveCheck="underline" />
      <ToolbarButton command="toggleStrike" icon={<Strikethrough className="w-4 h-4" />} tooltip="Tachado" isActiveCheck="strike" />

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <ToolbarButton command="toggleHeading" args={[{ level: 1 }]} icon={<Heading1 className="w-4 h-4" />} tooltip="Encabezado 1" isActiveCheck="heading" />
      <ToolbarButton command="toggleHeading" args={[{ level: 2 }]} icon={<Heading2 className="w-4 h-4" />} tooltip="Encabezado 2" isActiveCheck="heading" />
      <ToolbarButton command="toggleHeading" args={[{ level: 3 }]} icon={<Heading3 className="w-4 h-4" />} tooltip="Encabezado 3" isActiveCheck="heading" />
      <ToolbarButton command="setParagraph" icon={<Pilcrow className="w-4 h-4" />} tooltip="Párrafo" isActiveCheck="paragraph" />
      
      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <ToolbarButton command="toggleBulletList" icon={<List className="w-4 h-4" />} tooltip="Lista de viñetas" isActiveCheck="bulletList" />
      <ToolbarButton command="toggleOrderedList" icon={<ListOrdered className="w-4 h-4" />} tooltip="Lista ordenada" isActiveCheck="orderedList" />
      <ToolbarButton command="toggleBlockquote" icon={<Quote className="w-4 h-4" />} tooltip="Cita" isActiveCheck="blockquote" />
      <ToolbarButton command="toggleCodeBlock" icon={<Code className="w-4 h-4" />} tooltip="Bloque de código" isActiveCheck="codeBlock" />
      
      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <Tooltip>
        <TooltipTrigger asChild><button onClick={setLink} className={`p-2 rounded hover:bg-muted ${editor.isActive('link') ? 'is-active bg-muted' : ''}`}><Link className="w-4 h-4" /></button></TooltipTrigger>
        <TooltipContent><p>Añadir enlace</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><button onClick={handleImageClick} className="p-2 rounded hover:bg-muted"><ImageIcon className="w-4 h-4" /></button></TooltipTrigger>
        <TooltipContent><p>Añadir imagen</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><button onClick={addYoutubeVideo} className="p-2 rounded hover:bg-muted"><Youtube className="w-4 h-4" /></button></TooltipTrigger>
        <TooltipContent><p>Añadir video de YouTube</p></TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <ToolbarButton command="setTextAlign" args={['left']} icon={<AlignLeft className="w-4 h-4" />} tooltip="Alinear a la izquierda" isActiveCheck={{ textAlign: 'left' }} />
      <ToolbarButton command="setTextAlign" args={['center']} icon={<AlignCenter className="w-4 h-4" />} tooltip="Centrar" isActiveCheck={{ textAlign: 'center' }} />
      <ToolbarButton command="setTextAlign" args={['right']} icon={<AlignRight className="w-4 h-4" />} tooltip="Alinear a la derecha" isActiveCheck={{ textAlign: 'right' }} />
      <ToolbarButton command="setTextAlign" args={['justify']} icon={<AlignJustify className="w-4 h-4" />} tooltip="Justificar" isActiveCheck={{ textAlign: 'justify' }} />
      
      <div className="w-px h-6 bg-muted-foreground mx-1" />
      
      <Tooltip>
        <TooltipTrigger asChild>
            <input
                type="color"
                onInput={event => editor.chain().focus().setColor(event.target.value).run()}
                value={editor.getAttributes('textStyle').color || '#ffffff'}
                className="w-6 h-6 bg-transparent border-none cursor-pointer"
            />
        </TooltipTrigger>
        <TooltipContent><p>Color de texto</p></TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <ToolbarButton command="undo" icon={<Undo className="w-4 h-4" />} tooltip="Deshacer" />
      <ToolbarButton command="redo" icon={<Redo className="w-4 h-4" />} tooltip="Rehacer" />
      
      <div className="w-px h-6 bg-muted-foreground mx-1" />

      {onAiAction && <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Sparkles className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Asistente de IA</TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => onAiAction('generate-content')}>Generar contenido</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onAiAction('improve-writing')}>Mejorar escritura</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onAiAction('fix-grammar')}>Corregir gramática</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onAiAction('make-shorter')}>Hacer más corto</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onAiAction('make-longer')}>Hacer más largo</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>}
    </div>
  );
};

export default TiptapToolbar;
  