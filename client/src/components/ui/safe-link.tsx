import { HTMLAttributes, ReactNode, useCallback } from "react";
import { useSafeNavigation } from "@/hooks/use-safe-navigation";

interface SafeLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  className?: string;
  onBeforeNavigate?: () => void;
  delay?: number;
  /** Indique si ce lien est un élément de navigation principale et nécessite un nettoyage plus agressif */
  isPrimaryNav?: boolean;
}

/**
 * Lien de navigation sécurisé qui évite les erreurs removeChild
 * Ce composant doit être utilisé à la place de <a> pour la navigation interne
 */
export function SafeLink({
  href,
  children,
  className,
  onBeforeNavigate,
  delay,
  isPrimaryNav = false,
  onClick,
  ...props
}: SafeLinkProps) {
  const { safeNavigate } = useSafeNavigation();
  
  // Utilisation de useCallback pour éviter les re-rendus inutiles
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Désactiver immédiatement l'élément cliqué pour éviter les clics multiples
    if (e.currentTarget) {
      e.currentTarget.setAttribute('disabled', 'true');
      e.currentTarget.style.pointerEvents = 'none';
    }
    
    if (onClick) {
      onClick(e);
    }
    
    // Vérifier si c'est un lien externe
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      window.open(href, "_blank");
      return;
    }
    
    // Navigation directe vers l'accueil, sans utiliser la navigation sécurisée
    if (href === '/') {
      if (onBeforeNavigate) {
        onBeforeNavigate();
      }
      // Utiliser window.location.href pour une navigation directe et fiable
      window.location.href = href;
      return;
    }
    
    // Utiliser un délai plus long pour les liens de navigation principale
    const navDelay = isPrimaryNav ? 300 : (delay || 250);
    
    safeNavigate(href, navDelay, onBeforeNavigate);
  }, [href, onClick, onBeforeNavigate, isPrimaryNav, delay, safeNavigate]);
  
  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
} 