import { Quill } from 'react-quill';
import VideoBlot from '@/lib/quill/VideoBlot';

const BlockEmbed = Quill.import('blots/block/embed');
const ImageBlot = Quill.import('formats/image');

class AdBlot extends BlockEmbed {
    static create() {
        let node = super.create();
        node.setAttribute('data-ad-block', 'true');
        node.setAttribute('contenteditable', 'false');
        
        let placeholder = document.createElement('div');
        placeholder.className = 'ad-blot-placeholder';
        placeholder.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-megaphone"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>
            <span>Bloque de Publicidad Insertado</span>
        `;
        node.appendChild(placeholder);
        return node;
    }
}
AdBlot.blotName = 'adblock';
AdBlot.tagName = 'div';
AdBlot.className = 'ql-ad-blot';

class DividerBlot extends BlockEmbed {
  static create() {
    let node = super.create();
    return node;
  }
}
DividerBlot.blotName = 'divider';
DividerBlot.tagName = 'hr';

class RotatableImage extends ImageBlot {
  static create(value) {
    const node = super.create(value);
    if (typeof value === 'string') {
      node.setAttribute('src', this.sanitize(value));
    }
    return node;
  }

  static formats(domNode) {
    const formats = super.formats(domNode);
    if (domNode.hasAttribute('data-rotation')) {
      formats.rotation = parseInt(domNode.getAttribute('data-rotation'), 10);
    }
    return formats;
  }

  format(name, value) {
    if (name === 'rotation' && value) {
      this.domNode.setAttribute('data-rotation', value);
      this.domNode.style.transform = `rotate(${value}deg)`;
    } else {
      super.format(name, value);
    }
  }
}
RotatableImage.blotName = 'RotatableImage';
RotatableImage.tagName = 'img';

export const registerQuillModules = () => {
    Quill.register(AdBlot);
    Quill.register(DividerBlot);
    Quill.register(RotatableImage, true);
    Quill.register(VideoBlot);
};