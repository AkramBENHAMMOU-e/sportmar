import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductsPage from "@/pages/products-page";
import ProductDetailPage from "@/pages/product-detail-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";
import OrdersPage from "@/pages/orders-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomers from "@/pages/admin/customers";

import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { ProtectedRoute } from "@/lib/protected-route";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { useEffect } from "react";

// Composant pour surveiller les changements de route et nettoyer les portails
function RouterObserver() {
  const [location] = useLocation();
  
  // Nettoyer le DOM à chaque changement de route
  useEffect(() => {
    // Fermer tous les éléments ouverts
    const closeAllOpenElements = () => {
      // Simuler la touche Escape pour fermer modals, popovers, etc.
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true
      });
      document.body.dispatchEvent(escapeEvent);
      
      // Nettoyer les portails
      const portals = document.querySelectorAll('[data-radix-portal]');
      portals.forEach(portal => {
        try {
          if (portal.parentNode && portal instanceof HTMLElement) {
            portal.style.display = 'none';
          }
        } catch (e) {
          // Ignorer les erreurs
        }
      });
    };
    
    // Exécuter au montage et lors des changements de route
    closeAllOpenElements();
    
    // Appliquer à nouveau après que le rendu soit terminé
    setTimeout(closeAllOpenElements, 100);
  }, [location]);
  
  useEffect(() => {
    // Observer pour détecter les modifications d'attributs aria-hidden
    const observer = new MutationObserver((mutations) => {
      // Chercher les éléments de navigation qui peuvent avoir été masqués
      const bottomNav = document.querySelector('.bottom-navigation-fix');
      if (bottomNav && bottomNav.getAttribute('aria-hidden') === 'true') {
        // Restaurer la visibilité
        bottomNav.removeAttribute('aria-hidden');
      }
    });

    // Configuration de l'observation
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['aria-hidden'],
      subtree: true,
    });

    // Nettoyage
    return () => observer.disconnect();
  }, []);
  
  return null;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/category/:category" component={ProductsPage} />
      <Route path="/products/subcategory/:subcategory" component={ProductsPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      
      {/* Protected user routes */}
      <Route path="/cart">
        <ProtectedRoute component={CartPage} adminRequired={false} />
      </Route>
      <Route path="/checkout">
        <ProtectedRoute component={CheckoutPage} adminRequired={false} />
      </Route>
      <Route path="/orders">
        <ProtectedRoute component={OrdersPage} adminRequired={false} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} adminRequired={true} />
      </Route>
      <Route path="/admin/products">
        <ProtectedRoute component={AdminProducts} adminRequired={true} />
      </Route>
      <Route path="/admin/orders">
        <ProtectedRoute component={AdminOrders} adminRequired={true} />
      </Route>
      <Route path="/admin/customers">
        <ProtectedRoute component={AdminCustomers} adminRequired={true} />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <RouterObserver />
            <Header />
            <main className="flex-grow">
              <Router />
            </main>
            <Footer />
            <BottomNavigation />
          </div>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
