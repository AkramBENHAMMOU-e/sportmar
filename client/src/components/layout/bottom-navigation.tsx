import { useState } from "react";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { SafeLink } from "@/components/ui/safe-link";
import { Input } from "@/components/ui/input";

/**
 * Composant de navigation inférieure pour mobile
 * Fournit un accès rapide aux principales fonctionnalités du site sur mobile
 */
export default function BottomNavigation() {
  const pathname = window.location.pathname;
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Ne pas afficher sur les pages admin
  if (pathname.includes('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?query=${encodeURIComponent(searchQuery.trim())}`;
      setShowSearch(false);
    }
  };

  // Fonction pour ouvrir le CartDrawer via un événement personnalisé
  const handleOpenCart = () => {
    // Émettre un événement pour ouvrir le panier
    const openCartEvent = new CustomEvent('openCart');
    window.dispatchEvent(openCartEvent);
  };

  return (
    <>
      {/* Barre de recherche qui apparaît quand on clique sur l'icône recherche */}
      {showSearch && (
        <div className="md:hidden fixed top-0 left-0 right-0 bg-background z-50 p-4 border-b border-border shadow-lg animate-in slide-in-from-top">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-16 py-3 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <Search className="absolute left-3 text-muted-foreground h-4 w-4" />
            <button 
              type="button" 
              className="absolute right-3 text-secondary font-medium"
              onClick={() => setShowSearch(false)}
            >
              Fermer
            </button>
          </form>
        </div>
      )}

      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 shadow-lg bottom-navigation-fix"
        data-radix-scroll-lock-nonarria-hidden="true"
        data-inert="false"
      >
        <div className="grid grid-cols-5 h-16">
          {/* Accueil - Redirection vers page principale */}
          <SafeLink 
            href="/" 
            className={`bottom-nav-item ${pathname === '/' ? 'bottom-nav-active' : ''}`}
          >
            <Home className={`h-6 w-6 ${pathname === '/' ? 'text-secondary' : ''}`} />
            <span>Accueil</span>
          </SafeLink>
          
          {/* Recherche - Ouvre une barre de recherche */}
          <button 
            className="bottom-nav-item"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className={`h-6 w-6 ${showSearch ? 'text-secondary' : ''}`} />
            <span>Recherche</span>
          </button>
          
          {/* Promos - Redirection vers les produits en promo */}
          <SafeLink 
            href="/products?discount=true" 
            className={`bottom-nav-item ${pathname === '/products' && window.location.search.includes('discount=true') ? 'bottom-nav-active' : ''}`}
            aria-label="Voir les produits en promotion"
            tabIndex={0}
            onClick={(e) => {
              // Gestion manuelle de la navigation pour éviter le conflit avec aria-hidden
              e.preventDefault();
              if (pathname === '/products' && window.location.search.includes('discount=true')) {
                // Déjà sur la page des promos, ne rien faire
                return;
              }
              // Permettre au navigateur de compléter l'action de focus avant de rediriger
              setTimeout(() => {
                window.location.href = '/products?discount=true';
              }, 10);
            }}
          >
            <Heart className={`h-6 w-6 ${pathname === '/products' && window.location.search.includes('discount=true') ? 'text-secondary' : ''}`} />
            <span>Promos</span>
          </SafeLink>
          
          {/* Panier - Ouvre le drawer du panier */}
          <button 
            className="bottom-nav-item"
            onClick={handleOpenCart}
          >
            <ShoppingBag className="h-6 w-6" />
            <span>Panier</span>
          </button>
          
          {/* Compte - Redirection vers page principale */}
          <SafeLink 
            href="/" 
            className="bottom-nav-item"
          >
            <User className="h-6 w-6" />
            <span>Compte</span>
          </SafeLink>
        </div>
      </div>
    </>
  );
} 