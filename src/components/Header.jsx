import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Home, MoreHorizontal, ChevronDown } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useLayout } from '@/context/LayoutContext.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import * as Icons from 'lucide-react';

const Header = ({ sections = [], siteContent = {} }) => {
  const { isSidePanelOpen, toggleSidePanel } = useLayout();
  
  const mainSections = sections.filter(s => s.is_main).sort((a, b) => a.order - b.order).slice(0, 3);
  const moreSections = sections.filter(s => !mainSections.some(ms => ms.id === s.id));

  const getIcon = (iconName) => {
    const Icon = Icons[iconName] || MoreHorizontal;
    return <Icon className="w-4 h-4" />;
  };

  const logoUrl = siteContent.site_logo;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="sticky top-0 w-full z-30 glass-effect"
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button
              onClick={toggleSidePanel}
              className="text-foreground z-50"
              aria-label="Toggle Menu"
            >
              {isSidePanelOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Link to="/" className="flex items-center">
                  {logoUrl ? (
                      <img src={logoUrl} alt="Zona Vortex Logo" className="h-10" />
                  ) : (
                      <span className="text-2xl font-bold gradient-text">Zona Vortex</span>
                  )}
              </Link>
            </motion.div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center space-x-6">
              <NavLink 
                to="/" 
                className={({ isActive }) => `flex items-center gap-2 text-foreground hover:text-link-hover transition-colors font-medium ${isActive ? 'text-link' : ''}`}
              >
                <Home className="w-4 h-4" />
                Inicio
              </NavLink>
              {mainSections.map((item) => (
                <NavLink 
                  key={item.id} 
                  to={`/${item.slug}`}
                  className={({ isActive }) => `flex items-center gap-2 text-foreground hover:text-link-hover transition-colors font-medium ${isActive ? 'text-link' : ''}`}
                >
                  {getIcon(item.icon)}
                  {item.name}
                </NavLink>
              ))}
              {moreSections.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 text-foreground hover:text-link-hover transition-colors font-medium outline-none">
                    Más...
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {moreSections.map(item => (
                      <DropdownMenuItem key={item.id} asChild>
                        <Link to={`/${item.slug}`} className="flex items-center gap-2">
                          {getIcon(item.icon)}
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>
    </motion.header>
  );
};

export default Header;