
    import React, { useState, useEffect, useMemo } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { NavLink, useLocation, Link } from 'react-router-dom';
    import { getCategories } from '@/lib/supabase/categories';
    import { useLayout } from '@/context/LayoutContext.jsx';
    import { Home, ChevronRight, MoreHorizontal } from 'lucide-react';
    import { cn } from '@/lib/utils';
    import * as Icons from 'lucide-react';

    const SectionItem = ({ section, categories, activeSection, activeCategory, onToggle, isOpen }) => {
      const isSectionActive = activeSection === section.slug;
      
      const getIcon = (iconName) => {
        const Icon = Icons[iconName] || MoreHorizontal;
        return <Icon className="w-5 h-5" />;
      };

      return (
        <div>
          <div
            className={cn(
              "flex items-center justify-between w-full text-left py-3 text-lg font-medium transition-colors cursor-pointer",
              isSectionActive ? 'text-link' : 'text-foreground hover:text-link-hover'
            )}
            onClick={onToggle}
          >
            <NavLink to={`/${section.slug}`} className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              {getIcon(section.icon)}
              <span>{section.name}</span>
            </NavLink>
            {categories.length > 0 && (
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {isOpen && categories.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden pl-8"
              >
                <div className="space-y-2 py-2">
                  {categories.map(category => (
                    <NavLink 
                      key={category.id} 
                      to={`/${section.slug}?categoria=${encodeURIComponent(category.name)}`}
                      className={cn(
                        'block py-2 text-md transition-colors',
                        activeCategory === category.name && isSectionActive ? 'text-accent font-semibold' : 'text-text-muted hover:text-link-hover'
                      )}
                    >
                      {category.name}
                    </NavLink>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    };


    const SidePanel = ({ sections = [], siteContent = {} }) => {
        const location = useLocation();
        const [allCategories, setAllCategories] = useState([]);
        const { isSidePanelOpen, setSidePanelOpen } = useLayout();
        
        const [openSections, setOpenSections] = useState({});

        const currentPath = location.pathname;
        const searchParams = new URLSearchParams(location.search);
        const activeCategory = searchParams.get('categoria');

        const activeSection = useMemo(() => {
            if (currentPath === '/') return 'home';
            const sectionSlug = currentPath.split('/')[1];
            return sectionSlug || null;
        }, [currentPath]);

        useEffect(() => {
            const fetchCategories = async () => {
                const data = await getCategories();
                setAllCategories(data);
            };
            fetchCategories();
        }, []);

        useEffect(() => {
          if (activeSection) {
            setOpenSections(prev => ({ ...Object.fromEntries(Object.keys(prev).map(k => [k, false])), [activeSection]: true }));
          }
        }, [activeSection]);


        const handleToggleSection = (sectionSlug) => {
            setOpenSections(prev => ({ ...prev, [sectionSlug]: !prev[sectionSlug] }));
        };
        
        const panelVariants = {
            open: { x: 0 },
            closed: { x: '-100%' },
        };
        
        const logoUrl = siteContent.site_logo;

        const renderPanelContent = () => (
            <div className="flex flex-col h-full pt-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center py-4 border-b border-white/10 mb-4"
                >
                  <Link to="/" className="flex items-center">
                      {logoUrl ? (
                          <img src={logoUrl} alt="Zona Vortex Logo" className="h-8" />
                      ) : (
                          <span className="text-2xl font-bold gradient-text">Zona Vortex</span>
                      )}
                  </Link>
                </motion.div>

                <h3 className="text-sm font-semibold text-text-subtle uppercase tracking-wider mb-4 px-6">Navegación</h3>
                <div className="flex-grow overflow-y-auto px-6 pb-8">
                   <NavLink 
                    to="/" 
                    className={({ isActive }) => `flex items-center gap-3 py-3 text-lg font-medium transition-colors ${isActive ? 'text-link' : 'text-foreground hover:text-link-hover'}`}
                  >
                    <Home className="w-5 h-5" />
                    Inicio
                  </NavLink>
                  {sections.map((section) => (
                    <SectionItem
                      key={section.id}
                      section={section}
                      categories={allCategories.filter(c => c.section_id === section.id)}
                      activeSection={activeSection}
                      activeCategory={activeCategory}
                      isOpen={!!openSections[section.slug]}
                      onToggle={() => handleToggleSection(section.slug)}
                    />
                  ))}
                </div>
            </div>
        );

        return (
            <>
                <AnimatePresence>
                    {isSidePanelOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                            onClick={() => setSidePanelOpen(false)}
                        />
                    )}
                </AnimatePresence>
                <motion.aside
                    initial="closed"
                    animate={isSidePanelOpen ? 'open' : 'closed'}
                    variants={panelVariants}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 h-full w-72 glass-effect-aside border-r border-white/10 z-50 shadow-2xl"
                >
                    {renderPanelContent()}
                </motion.aside>
            </>
        );
    };

    export default SidePanel;
  