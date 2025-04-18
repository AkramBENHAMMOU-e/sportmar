import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  ChevronDown 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import CartDrawer from "@/components/cart/cart-drawer";
import MobileMenu from "@/components/layout/mobile-menu";
import { SafeLink } from "@/components/ui/safe-link";
import { SafeLinkButton } from "@/components/ui/safe-link-button";
import Logo from "@/components/layout/logo";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { cartItems, totalItems } = useCart();
  const [location] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Écouteur pour l'événement d'ouverture du panier depuis la navigation mobile
  useEffect(() => {
    const handleOpenCart = () => {
      setIsCartOpen(true);
    };
    
    window.addEventListener('openCart', handleOpenCart);
    
    return () => {
      window.removeEventListener('openCart', handleOpenCart);
    };
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?query=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="bg-background shadow-md border-b border-border sticky top-0 z-50">
      {/* Top navigation bar */}
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center lg:w-1/4">
          {/* Logo */}
          <SafeLink href="/" className="flex items-center">
            <Logo logoOnly={window.innerWidth < 350} />
          </SafeLink>
        </div>
        
        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex justify-center space-x-6 lg:space-x-8 lg:w-2/4">
          <SafeLink 
            href="/" 
            className={`text-foreground hover:text-primary font-medium transition-all duration-200 ${location === '/' ? 'text-primary font-semibold border-b-2 border-primary pb-1' : ''}`}
            isPrimaryNav={true}
          >
            Accueil
          </SafeLink>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`text-foreground hover:text-primary font-medium transition-all duration-200 flex items-center ${location.startsWith('/products/category/supplement') ? 'text-primary font-semibold border-b-2 border-primary pb-1' : ''}`}>
                Compléments
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <SafeLink href="/products/subcategory/proteine" isPrimaryNav={true} className="font-medium">Protéines</SafeLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <SafeLink href="/products/subcategory/vitamine" isPrimaryNav={true} className="font-medium">Vitamines</SafeLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <SafeLink href="/products/subcategory/bruleur" isPrimaryNav={true} className="font-medium">Brûleurs de graisse</SafeLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <SafeLink href="/products/category/supplement" isPrimaryNav={true} className="font-medium">Voir tout</SafeLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`text-foreground hover:text-primary font-medium transition-all duration-200 flex items-center ${location.startsWith('/products/category/equipment') ? 'text-primary font-semibold border-b-2 border-primary pb-1' : ''}`}>
                Équipements
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <SafeLink href="/products/subcategory/musculation" isPrimaryNav={true} className="font-medium">Haltères</SafeLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <SafeLink href="/products/subcategory/cardio" isPrimaryNav={true} className="font-medium">Tapis de course</SafeLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <SafeLink href="/products/subcategory/accessoires" isPrimaryNav={true} className="font-medium">Bandes élastiques</SafeLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <SafeLink href="/products/category/equipment" isPrimaryNav={true} className="font-medium">Voir tout</SafeLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <SafeLink 
            href="/products" 
            className={`text-foreground hover:text-primary font-medium transition-all duration-200 ${location === '/products' ? 'text-primary font-semibold border-b-2 border-primary pb-1' : ''}`}
            isPrimaryNav={true}
          >
            Promotions
          </SafeLink>
        </nav>
        
        {/* Right navigation: search, account, cart */}
        <div className="flex items-center justify-end space-x-3 md:space-x-4 lg:w-1/4">
          {/* Search - hidden on mobile (available from bottom nav) */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
            <Input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 text-muted-foreground h-4 w-4" />
          </form>
          
          {/* Account - hidden label on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-foreground hover:text-primary transition-all duration-200 flex items-center">
                <div className="p-2 rounded-full bg-accent/50 hover:bg-accent">
                  <User className="h-5 w-5" />
                </div>
                <span className="ml-2 hidden md:inline font-medium">
                  {user ? (user.fullName || user.username) : "Mon compte"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="shadow-lg">
              {user ? (
                <>
                  {user.isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <SafeLink href="/admin" className="font-medium">Dashboard Admin</SafeLink>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <SafeLink href="/orders" className="font-medium">Mes commandes</SafeLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="font-medium text-secondary">
                    Se déconnecter
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <SafeLink href="/auth" className="font-medium">Se connecter</SafeLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <SafeLink href="/auth" className="font-medium">Créer un compte</SafeLink>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Cart */}
          <button 
            className="text-foreground hover:text-primary transition-all duration-200 flex items-center"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="relative p-2 rounded-full bg-accent/50 hover:bg-accent">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="ml-2 hidden md:inline font-medium">Panier</span>
          </button>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-foreground hover:text-primary transition-all duration-200 p-2 rounded-full bg-accent/50 hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
      
      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
    </header>
  );
}
