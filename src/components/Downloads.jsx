import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AdBlock from '@/components/AdBlock';
import { useDownloadModal } from '@/context/DownloadModalContext';

const Downloads = () => {
  const { toast } = useToast();
  const [downloadedFiles, setDownloadedFiles] = useState([]);
  const { showModal } = useDownloadModal();

  useEffect(() => {
    const saved = localStorage.getItem('zona-vortex-downloads');
    if (saved) {
      setDownloadedFiles(JSON.parse(saved));
    }
  }, []);

  const materials = [
    {
      id: 1,
      title: 'Guía Completa de Gramática Inglesa',
      description: 'Manual completo con todas las reglas gramaticales, ejemplos y ejercicios prácticos.',
      type: 'PDF',
      size: '2.5 MB',
      pages: 45,
      rating: 4.9,
      downloads: 1250,
      image: 'Libro de gramática inglesa abierto con reglas y ejemplos destacados'
    },
    {
      id: 2,
      title: 'Vocabulario Esencial - 1000 Palabras',
      description: 'Las 1000 palabras más importantes del inglés con pronunciación y ejemplos.',
      type: 'PDF',
      size: '1.8 MB',
      pages: 32,
      rating: 4.8,
      downloads: 2100,
      image: 'Lista de vocabulario inglés con palabras destacadas y traducciones'
    },
    {
      id: 3,
      title: 'Frases para Conversación Diaria',
      description: 'Expresiones y frases útiles para situaciones cotidianas en inglés.',
      type: 'PDF',
      size: '1.2 MB',
      pages: 28,
      rating: 4.7,
      downloads: 1800,
      image: 'Guía de frases en inglés con situaciones cotidianas ilustradas'
    },
    {
      id: 4,
      title: 'Pronunciación y Fonética',
      description: 'Guía completa de pronunciación con símbolos fonéticos y ejercicios.',
      type: 'PDF',
      size: '3.1 MB',
      pages: 52,
      rating: 4.9,
      downloads: 950,
      image: 'Diagrama de pronunciación inglesa con símbolos fonéticos y posiciones'
    },
    {
      id: 5,
      title: 'Inglés para Viajeros',
      description: 'Frases y vocabulario esencial para viajar por países de habla inglesa.',
      type: 'PDF',
      size: '1.5 MB',
      pages: 24,
      rating: 4.6,
      downloads: 1400,
      image: 'Mapa del mundo con frases de viaje en inglés y iconos turísticos'
    },
    {
      id: 6,
      title: 'Ejercicios de Comprensión Lectora',
      description: 'Textos con diferentes niveles de dificultad y preguntas de comprensión.',
      type: 'PDF',
      size: '2.8 MB',
      pages: 38,
      rating: 4.8,
      downloads: 1100,
      image: 'Texto en inglés con preguntas de comprensión y respuestas marcadas'
    }
  ];

  const handleDownload = (material) => {
    const downloadFunction = () => {
      const newDownloads = [...downloadedFiles, material.id];
      setDownloadedFiles(newDownloads);
      localStorage.setItem('zona-vortex-downloads', JSON.stringify(newDownloads));
      
      toast({
        title: "📥 ¡Descarga iniciada!",
        description: `${material.title} se está descargando... (simulación)`
      });
    };

    showModal({ title: material.title, onConfirm: downloadFunction });
  };

  const handlePreview = (material) => {
    toast({
      title: "🚧 Esta función no está implementada aún",
      description: "¡Pero no te preocupes! Pronto estará lista! 🚀"
    });
  };

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Material{' '}
            <span className="gradient-text">Descargable</span>
          </h2>
          <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto">
            Descarga nuestros PDFs gratuitos y estudia offline. Guías, ejercicios 
            y material de referencia para acelerar tu aprendizaje.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {materials.map((material, index) => {
            const isDownloaded = downloadedFiles.includes(material.id);
            
            return (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-effect rounded-2xl overflow-hidden card-hover group"
              >
                <div className="relative">
                  <img  
                    className="w-full h-48 object-cover" 
                    alt={`Material: ${material.title}`}
                   src="https://images.unsplash.com/photo-1619390179735-fc8c18ac2a88" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {material.type}
                    </span>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {material.size}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-link-hover transition-colors">
                    {material.title}
                  </h3>
                  
                  <p className="text-[hsl(var(--card-muted-foreground))] mb-4 text-sm leading-relaxed">
                    {material.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4 text-sm text-[hsl(var(--card-muted-foreground))]">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>{material.pages} páginas</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{material.rating}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-[hsl(var(--text-subtle))] mb-4">
                    {material.downloads.toLocaleString()} descargas
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handlePreview(material)}
                      variant="outline"
                      className="flex-1 border-border text-foreground hover:bg-secondary"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Vista previa
                    </Button>
                    
                    <Button
                      onClick={() => handleDownload(material)}
                      className={`flex-1 ${
                        isDownloaded 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                      } text-white`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isDownloaded ? 'Descargado' : 'Descargar'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <AdBlock className="mt-16" />
      </div>
    </section>
  );
};

export default Downloads;