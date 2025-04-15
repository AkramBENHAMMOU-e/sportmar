import { ButtonHTMLAttributes, ReactNode, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useSafeNavigation } from "@/hooks/use-safe-navigation";
import { VariantProps } from "class-variance-authority";

interface SafeLinkButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof Button>, "asChild"> {
  href: string;
  children: ReactNode;
  onBeforeNavigate?: () => void;
  delay?: number;
  /** Indique si ce bouton est un élément de navigation principale et nécessite un nettoyage plus agressif */
  isPrimaryNav?: boolean;
}

/**
 * Bouton de navigation sécurisé qui évite les erreurs removeChild
 * Ce composant doit être utilisé à la place de <Link> de wouter pour la navigation
 */
export function SafeLinkButton({
  href,
  children,
  variant = "default",
  size,
  className,
  onBeforeNavigate,
  delay = 250,
  isPrimaryNav = false,
  ...props
}: SafeLinkButtonProps) {
  const { safeNavigate } = useSafeNavigation();
  
  // Utilisation de useCallback pour éviter les re-rendus inutiles
  const handleClick = useCallback(() => {
    // Utiliser un délai plus long pour les liens de navigation principale
    const navDelay = isPrimaryNav ? 300 : delay;
    
    safeNavigate(href, navDelay, onBeforeNavigate);
  }, [href, onBeforeNavigate, isPrimaryNav, delay, safeNavigate]);
  
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
} 