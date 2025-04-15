import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroCarouselProps {
  // Permettre des strings (URLs) ou des imports comme sources d'images
  images: (string | { default: string } | any)[];
  interval?: number; // Intervalle en ms entre chaque transition
  className?: string;
}

export default function HeroCarousel({ 
  images, 
  interval = 5000, 
  className 
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedImages, setLoadedImages] = useState<boolean[]>([]);

  // Fonction pour obtenir l'URL de l'image, qu'elle soit une string ou un import
  const getImageSrc = (image: string | { default: string } | any): string => {
    if (typeof image === 'string') {
      return image;
    } else if (image && typeof image === 'object') {
      // Si c'est un import ou un objet avec une propriété default ou src
      return image.default || image.src || image;
    }
    return '';
  };

  // Initialiser l'état des images chargées
  useEffect(() => {
    setLoadedImages(new Array(images.length).fill(false));
  }, [images.length]);

  // Fonction pour gérer le chargement des images
  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };
  
  // Fonction pour gérer l'erreur de chargement d'image
  const handleImageError = (index: number) => {
    console.error(`Erreur de chargement de l'image ${index}`);
  };
  
  // Fonction pour passer à l'image suivante
  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsTransitioning(false);
    }, 500); // Durée de la transition
  }, [images.length]);
  
  // Fonction pour passer à l'image précédente
  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      setIsTransitioning(false);
    }, 500); // Durée de la transition
  }, [images.length]);
  
  // Défilement automatique
  useEffect(() => {
    if (images.length <= 1) return;
    
    const timer = setInterval(() => {
      nextSlide();
    }, interval);
    
    return () => clearInterval(timer);
  }, [nextSlide, interval, images.length]);
  
  if (images.length === 0) {
    return <div className={cn("relative rounded-2xl bg-gray-200", className)} style={{ aspectRatio: "16/9", minHeight: "300px" }}></div>;
  }
  
  return (
    <div 
      className={cn("relative overflow-hidden w-full h-full", className)} 
      style={{ 
        height: "100%",
        minHeight: "100vh",
        position: "relative"
      }}
    >
      {/* Carousel d'images */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {images.map((image, index) => (
          <div 
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 w-full h-full",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
            style={{ height: "100%" }}
          >
            <img 
              src={getImageSrc(image)}
              alt={`Slide ${index + 1}`} 
              className="w-full h-full object-cover"
              style={{ 
                objectPosition: "center center",
                objectFit: "cover",
                minHeight: "120vh" // S'étendre au-delà de la hauteur visible
              }}
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageError(index)}
            />
            {!loadedImages[index] && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                <span className="sr-only">Chargement...</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Contrôles de navigation (seulement s'il y a plus d'une image) */}
      {images.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20 p-2 md:p-4 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-colors"
            aria-label="Image précédente"
          >
            <ChevronLeft className="h-5 w-5 md:h-8 md:w-8" />
          </button>
          
          <button 
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20 p-2 md:p-4 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-colors"
            aria-label="Image suivante"
          >
            <ChevronRight className="h-5 w-5 md:h-8 md:w-8" />
          </button>
          
          {/* Indicateurs */}
          <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 md:space-x-3 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setIsTransitioning(false);
                  }, 500);
                }}
                disabled={isTransitioning}
                className={cn(
                  "h-2 md:h-3 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "bg-white w-8 md:w-12" 
                    : "bg-white/40 w-2 md:w-3 hover:bg-white/80"
                )}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 