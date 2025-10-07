import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import AdBlock from '@/components/AdBlock';
import { getSiteContent } from '@/lib/supabase/siteContent';

const Footer = ({ siteContent = {} }) => {
  const { toast } = useToast();
  const [licenseText, setLicenseText] = useState('© 2025 Zona Vortex. Todos los derechos reservados.');

  useEffect(() => {
    const fetchLicense = async () => {
      const content = await getSiteContent('license_text');
      if (content) {
        setLicenseText(content);
      }
    };
    fetchLicense();
  }, []);

  const handleSocialClick = (platform) => {
    toast({
      title: "🚧 Esta función no está implementada aún",
      description: "¡Pero no te preocupes! Pronto estará lista! 🚀"
    });
  };

  const logoUrl = siteContent.site_logo;

  return (
    <footer className="bg-secondary/20 pt-16 pb-8 px-6 mt-auto">
      <div className="container mx-auto">
        <AdBlock variant="banner" className="mb-12" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4 lg:col-span-2"
          >
            <div className="flex items-center space-x-2">
              {logoUrl ? (
                  <img src={logoUrl} alt="Zona Vortex Logo" className="h-10" />
              ) : (
                  <span className="text-2xl font-bold gradient-text">Zona Vortex</span>
              )}
            </div>
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
              Tu plataforma de recursos para dominar el inglés. Accede a guías y 
              material descargable de calidad.
            </p>
            <div className="flex space-x-4 pt-2">
              <button
                onClick={() => handleSocialClick('facebook')}
                className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Facebook className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => handleSocialClick('twitter')}
                className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors"
              >
                <Twitter className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => handleSocialClick('instagram')}
                className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors"
              >
                <Instagram className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => handleSocialClick('youtube')}
                className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <Youtube className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <span className="text-lg font-semibold text-foreground">Enlaces Rápidos</span>
            <div className="space-y-2">
              <Link to="/" className="block text-[hsl(var(--muted-foreground))] hover:text-link-hover transition-colors">Inicio</Link>
              <Link to="/blog" className="block text-[hsl(var(--muted-foreground))] hover:text-link-hover transition-colors">Blog</Link>
              <Link to="/sugerencias" className="block text-[hsl(var(--muted-foreground))] hover:text-link-hover transition-colors">Sugerencias</Link>
              <Link to="/politicas" className="block text-[hsl(var(--muted-foreground))] hover:text-link-hover transition-colors">Políticas</Link>
            </div>
          </motion.div>

          {/* License */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <span className="text-lg font-semibold text-foreground">Licencia</span>
            <p className="text-[hsl(var(--text-subtle))] text-sm leading-relaxed">
              {licenseText}
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-border pt-8 text-center"
        >
          <p className="text-[hsl(var(--text-subtle))] text-sm">
            Creado con ❤️ por el equipo de Zona Vortex.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;