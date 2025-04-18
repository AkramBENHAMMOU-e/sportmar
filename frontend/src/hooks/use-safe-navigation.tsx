import { useLocation } from "wouter";

/**
 * Hook personnalisé pour gérer la navigation avec un délai pour éviter les erreurs de DOM
 * liées à "removeChild" lors des transitions entre les pages
 */
export function useSafeNavigation() {
  const [_, navigate] = useLocation();
  
  /**
   * Nettoie les portails Radix UI et autres éléments flottants du DOM
   * Cette fonction est plus agressive et assure une meilleure stabilité
   */
  const cleanupDOM = () => {
    // Force la fermeture des dropdowns et autres éléments interactifs
    document.body.click(); 
    
    // Simulation de la touche Escape pour fermer les modals et dropdowns
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true
    });
    document.body.dispatchEvent(escapeEvent);
    
    // Nettoyage des portails Radix UI (poppers, dropdowns, etc.)
    const portals = document.querySelectorAll('[data-radix-portal]');
    portals.forEach(portal => {
      try {
        // Tenter de fermer proprement d'abord
        portal.dispatchEvent(escapeEvent);
        
        // Désactiver les événements problématiques
        const overlay = portal.querySelector('[role="dialog"]') || portal;
        if (overlay) {
          overlay.setAttribute('data-state', 'closed');
          overlay.setAttribute('aria-hidden', 'true');
        }
        
        // Rendre le portail invisible sans le supprimer directement
        // Cela évite les erreurs removeChild tout en cachant visuellement le contenu
        if (portal instanceof HTMLElement) {
          portal.style.display = 'none';
          portal.style.visibility = 'hidden';
          portal.style.pointerEvents = 'none';
          portal.style.opacity = '0';
        }
        
        // Si le portail a un node parent, tenter de nettoyer son contenu sans le supprimer
        if (portal.firstChild && portal.contains(portal.firstChild)) {
          portal.innerHTML = '';
        }
      } catch (e) {
        console.error("Erreur lors du nettoyage des portails:", e);
      }
    });
    
    // Nettoyage des autres éléments potentiellement problématiques
    const overlays = document.querySelectorAll('.fixed, [role="dialog"], [data-state="open"]');
    overlays.forEach(overlay => {
      try {
        overlay.setAttribute('data-state', 'closed');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.dispatchEvent(escapeEvent);
      } catch (e) {
        // Ignorer les erreurs silencieusement
      }
    });
    
    // Nettoyage des objets Select et Dialog ouverts
    const selects = document.querySelectorAll('select, [role="combobox"]');
    selects.forEach(select => {
      try {
        if (select instanceof HTMLSelectElement) {
          select.blur();
        }
      } catch (e) {
        // Ignorer les erreurs silencieusement
      }
    });
  };
  
  /**
   * Navigue vers une nouvelle page après un court délai et nettoyage du DOM
   * @param path Chemin de destination
   * @param delay Délai en ms avant la navigation (défaut: 200ms)
   * @param callback Fonction optionnelle à exécuter avant la navigation
   */
  const safeNavigate = (path: string, delay: number = 100, callback?: () => void) => {
    // Désactiver temporairement les événements sur les éléments flottants
    const disableInteractionsOnFloating = () => {
      const floatingElements = document.querySelectorAll('[data-radix-portal], .fixed, [role="dialog"]');
      floatingElements.forEach(el => {
        el.setAttribute('aria-hidden', 'true');
        if (el instanceof HTMLElement) {
          el.style.pointerEvents = 'none';
        }
      });
    };
    
    // Si c'est la page d'accueil, utiliser une navigation directe pour éviter les problèmes
    if (path === '/') {
      if (callback) {
        callback();
      }
      // Navigation immédiate vers l'accueil
      navigate(path);
      return;
    }
    
    // Nettoyer le DOM avant la navigation
    cleanupDOM();
    disableInteractionsOnFloating();
    
    if (callback) {
      callback();
    }
    
    // Utiliser un délai pour s'assurer que toutes les animations et effets se terminent
    setTimeout(() => {
      navigate(path);
      
      // Nettoyer à nouveau le DOM après la navigation
      setTimeout(() => {
        cleanupDOM();
      }, 50);
    }, delay);
  };
  
  return { safeNavigate };
} 