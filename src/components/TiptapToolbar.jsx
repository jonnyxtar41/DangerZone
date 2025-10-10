import React, { useCallback } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3, Pilcrow,
  List, ListOrdered,
  Quote, Code,
  Undo, Redo,
  Link, Image as ImageIcon, Youtube,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Sparkles,
  Table, Columns, Rows, Merge, Split, Trash2, PaintBucket, EyeOff
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from './ui/button';

const TiptapToolbar = ({ editor, onAiAction, onImageUpload, onGenerateContent }) => {
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube URL');
    if (url) editor.commands.addYoutubeVideo({ src: url });
  };

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) onImageUpload(file);
    };
    input.click();
  };

  const ToolbarButton = ({ command, args = [], icon, tooltip, isActiveCheck, canCheck, disabledCondition }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain()[command](...args).run()}
          disabled={disabledCondition ?? (canCheck ? !editor.can()[canCheck]() : false)}
          className={`p-2 rounded transition-colors hover:bg-accent/20 ${editor.isActive(isActiveCheck || command, ...args) ? 'is-active bg-accent text-accent-foreground' : ''}`}
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
        <TooltipTrigger asChild><button onMouseDown={(e) => e.preventDefault()} onClick={setLink} className={`p-2 rounded transition-colors hover:bg-accent/20 ${editor.isActive('link') ? 'is-active bg-accent text-accent-foreground' : ''}`}><Link className="w-4 h-4" /></button></TooltipTrigger>
        <TooltipContent><p>Añadir enlace</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><button onMouseDown={(e) => e.preventDefault()} onClick={handleImageClick} className="p-2 rounded transition-colors hover:bg-accent/20"><ImageIcon className="w-4 h-4" /></button></TooltipTrigger>
        <TooltipContent><p>Añadir imagen</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild><button onMouseDown={(e) => e.preventDefault()} onClick={addYoutubeVideo} className="p-2 rounded transition-colors hover:bg-accent/20"><Youtube className="w-4 h-4" /></button></TooltipTrigger>
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
            onInput={event => editor.chain().setColor(event.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#ffffff'}
            className="w-6 h-6 bg-transparent border-none cursor-pointer"
          />
        </TooltipTrigger>
        <TooltipContent><p>Color de texto</p></TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button onMouseDown={(e) => e.preventDefault()} variant="ghost" size="icon" className="h-8 w-8">
                <Table className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Herramientas de Tabla</TooltipContent>
        </Tooltip>
        <DropdownMenuContent onMouseDown={(e) => e.preventDefault()}>
          <DropdownMenuItem onSelect={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table className="w-4 h-4 mr-2" />Insertar Tabla</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()}><Columns className="w-4 h-4 mr-2" />Añadir Columna Antes</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}><Columns className="w-4 h-4 mr-2" />Añadir Columna Después</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}><Trash2 className="w-4 h-4 mr-2" />Eliminar Columna</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}><Rows className="w-4 h-4 mr-2" />Añadir Fila Antes</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}><Rows className="w-4 h-4 mr-2" />Añadir Fila Después</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}><Trash2 className="w-4 h-4 mr-2" />Eliminar Fila</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}><Trash2 className="w-4 h-4 mr-2 text-destructive" />Eliminar Tabla</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()}><Merge className="w-4 h-4 mr-2" />Combinar Celdas</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()}><Split className="w-4 h-4 mr-2" />Dividir Celda</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeaderRow().run()} disabled={!editor.can().toggleHeaderRow()}><Rows className="w-4 h-4 mr-2" />Alternar Fila de Encabezado</DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              const { invisible } = editor.getAttributes('table');
              editor.chain().focus().updateAttributes('table', { invisible: !invisible }).run();
            }}
            disabled={!editor.isActive('table')}
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Alternar Bordes Visibles
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative w-6 h-6">
            <PaintBucket className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="color"
              onInput={event => editor.chain().setCellAttribute('backgroundColor', event.target.value).run()}
              className="w-full h-full opacity-0 cursor-pointer"
              disabled={!editor.can().setCellAttribute('backgroundColor', '')}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent><p>Color de fondo de celda</p></TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      <ToolbarButton command="undo" icon={<Undo className="w-4 h-4" />} canCheck="undo" tooltip="Deshacer" />
      <ToolbarButton command="redo" icon={<Redo className="w-4 h-4" />} canCheck="redo" tooltip="Rehacer" />

      <div className="w-px h-6 bg-muted-foreground mx-1" />

      {onAiAction && <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button onMouseDown={(e) => e.preventDefault()} variant="ghost" size="icon" className="h-8 w-8">
                <Sparkles className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Asistente de IA</TooltipContent>
        </Tooltip>
        <DropdownMenuContent onMouseDown={(e) => e.preventDefault()}>
          <DropdownMenuItem onSelect={onGenerateContent}>Generar contenido con prompt...</DropdownMenuItem>
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