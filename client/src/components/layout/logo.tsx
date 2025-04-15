import { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
  logoOnly?: boolean;
}

/**
 * Composant Logo qui affiche le logo du site
 * Ce composant sera utilisé dans le header et le footer
 * Il charge l'image du logo dynamiquement
 */
export default function Logo({ className = '', logoOnly = false }: LogoProps) {
  const [logoLoaded, setLogoLoaded] = useState(false);
  
  useEffect(() => {
    // On vérifie si le logo existe dans les assets
    const img = new Image();
    img.src = '/logo.png';
    img.onload = () => setLogoLoaded(true);
    img.onerror = () => setLogoLoaded(false);
  }, []);
  
  return (
    <div className={`flex items-center ${className}`}>
      {logoLoaded ? (
        <img 
          src="/logo.png" 
          alt="Monaliza House" 
          className="h-12 w-auto mr-3"
        />
      ) : (
        <div className="h-12 w-12 mr-3 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">
          M
        </div>
      )}
      
      {!logoOnly && (
        <span className="text-primary text-2xl font-bold font-heading">
          Monaliza<span className="text-red-600">House</span>
        </span>
      )}
    </div>
  );
} 