import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sparkles } from 'lucide-react';

export const CustomToolbar = ({ onAiAction }) => (
  <div id="toolbar">
    <span className="ql-formats">
      <select className="ql-header" defaultValue="">
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="">Normal</option>
      </select>
    </span>
    <span className="ql-formats">
      <Tooltip><TooltipTrigger asChild><button className="ql-bold"></button></TooltipTrigger><TooltipContent>Negrita</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><button className="ql-italic"></button></TooltipTrigger><TooltipContent>Cursiva</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><button className="ql-underline"></button></TooltipTrigger><TooltipContent>Subrayado</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><button className="ql-strike"></button></TooltipTrigger><TooltipContent>Tachado</TooltipContent></Tooltip>
    </span>
    <span className="ql-formats">
      <Tooltip><TooltipTrigger asChild><button className="ql-list" value="ordered"></button></TooltipTrigger><TooltipContent>Lista ordenada</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><button className="ql-list" value="bullet"></button></TooltipTrigger><TooltipContent>Lista con viñetas</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><button className="ql-indent" value="-1"></button></TooltipTrigger><TooltipContent>Disminuir sangría</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><button className="ql-indent" value="+1"></button></TooltipTrigger><TooltipContent>Aumentar sangría</TooltipContent></Tooltip>
    </span>
    <span className="ql-formats">
      <Tooltip><TooltipTrigger asChild><button className="ql-blockquote"></button></TooltipTrigger><TooltipContent>Cita</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><button className="ql-code-block"></button></TooltipTrigger><TooltipContent>Bloque de código</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><button className="ql-link"></button></TooltipTrigger><TooltipContent>Insertar enlace</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><button className="ql-image"></button></TooltipTrigger><TooltipContent>Insertar imagen</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><button className="ql-video"></button></TooltipTrigger><TooltipContent>Insertar Video (iframe)</TooltipContent></Tooltip>
    </span>
    <span className="ql-formats">
      <Tooltip><TooltipTrigger asChild><button className="ql-divider"></button></TooltipTrigger><TooltipContent>Línea divisora</TooltipContent></Tooltip>
    </span>
    <span className="ql-formats">
      <select className="ql-align"></select>
      <select className="ql-color"></select>
      <select className="ql-background"></select>
    </span>
    <span className="ql-formats">
      <Tooltip><TooltipTrigger asChild><button className="ql-clean"></button></TooltipTrigger><TooltipContent>Limpiar formato</TooltipContent></Tooltip>
    </span>
    <span className="ql-formats">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button className="ql-ai-assistant">
                <Sparkles className="w-[18px] h-[18px]" />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Asistente de IA</TooltipContent>
        </Tooltip>
        <DropdownMenuContent onSelect={(e) => {
          const action = e.target.dataset.aiAction;
          if (action) onAiAction(action);
        }}>
          <DropdownMenuItem data-ai-action="generate-content">Generar contenido desde título</DropdownMenuItem>
          <DropdownMenuItem data-ai-action="improve-writing">Mejorar escritura</DropdownMenuItem>
          <DropdownMenuItem data-ai-action="fix-grammar">Corregir gramática</DropdownMenuItem>
          <DropdownMenuItem data-ai-action="make-shorter">Hacer más corto</DropdownMenuItem>
          <DropdownMenuItem data-ai-action="make-longer">Hacer más largo</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ql-adblock">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>
          </button>
        </TooltipTrigger>
        <TooltipContent>Insertar Bloque de Anuncio</TooltipContent>
      </Tooltip>
    </span>
  </div>
);