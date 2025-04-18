import { useQuery } from "@tanstack/react-query";
import { SafeLink } from "@/components/ui/safe-link";
import { ArrowRight, Medal, Truck, Headphones, ShoppingCart, Dumbbell, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import ProductGrid from "@/components/product/product-grid";
import HeroCarousel from "@/components/ui/hero-carousel";


export default function HomePage() {
  // Définir les URLs directes des images (méthode plus fiable)
  const heroImages = [
    "./hero-slide-1.jpg", // Équipement fitness
    "./hero-slide-2.jpg", // Musculation
    "./hero-slide-3.jpg"  // Fitness
  ];

  const { data: featuredProducts, isLoading, error } = useQuery({
    queryKey: ["/api/products/featured"],
  });

  // S'assurer que featuredProducts est un tableau pour éviter les erreurs
  const safeProducts = Array.isArray(featuredProducts) ? featuredProducts : [];

  return (
    <>
      {/* Hero Section avec hauteur minimale augmentée pour garantir la couverture complète */}
      <section className="relative pt-16 pb-36 md:pt-20 md:pb-52 overflow-hidden w-full min-h-screen">
        {/* Carousel en arrière-plan avec extension complète */}
        <div className="absolute inset-0 bottom-[-100px] w-screen h-auto min-h-[110vh] z-0">
          <HeroCarousel 
            images={heroImages}
            interval={6000}
            className="w-full h-full rounded-none"
          />
          {/* Overlay pour améliorer la lisibilité du texte */}
          <div className="absolute inset-0 bg-black/70 z-10"></div>
        </div>
        
        {/* Animated background shapes avec z-index pour les rendre visibles sur le carousel */}
        <div className="absolute inset-0 overflow-hidden z-20">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-secondary-foreground/10 rounded-full blur-3xl transform translate-x-1/2 animate-pulse" style={{animationDelay: '1s', animationDuration: '7s'}}></div>
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-xl transform translate-y-1/2 animate-pulse" style={{animationDelay: '2s', animationDuration: '8s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 pt-8 relative z-30">
          {/* Titre principal visible au-dessus du carousel sur mobile */}
          <div className="block md:hidden text-center mb-6 animate-fade-in" style={{animationDuration: '0.8s'}}>
            <div className="inline-block bg-primary/20 text-primary-foreground rounded-full px-4 py-1 text-sm font-medium mb-6 backdrop-blur-sm">
              Monaliza House
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 font-heading leading-tight tracking-tight">
              Dépassez vos limites avec <span className="text-secondary">Monaliza House</span>
            </h1>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
            {/* Contenu texte pour desktop et reste du contenu mobile */}
            <div className="w-full md:w-1/2 text-center md:text-left animate-fade-in order-2 md:order-1" style={{animationDuration: '0.8s'}}>
              {/* Titre visible uniquement sur desktop */}
              <div className="hidden md:block">
                <div className="inline-block bg-primary/20 text-primary-foreground rounded-full px-4 py-1 text-sm font-medium mb-6 backdrop-blur-sm">
                  Monaliza House — Votre partenaire fitness
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-heading leading-tight tracking-tight">
                  Dépassez vos limites  avec<span className="text-secondary"> Monaliza House</span>
                </h1>
              </div>
              
              <p className="text-xl text-white/80 mb-8 max-w-lg mx-auto md:mx-0">
                Découvrez notre gamme complète de compléments alimentaires et d'équipements sportifs de qualité supérieure.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-5">
                <Button size="lg" className="w-full sm:w-auto px-8 gap-2 text-base bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px]" asChild>
                  <SafeLink href="/products/category/supplement">
                    <ShoppingCart className="h-5 w-5" />
                    Nos compléments
                  </SafeLink>
                </Button>
                <Button size="lg" className="w-full sm:w-auto px-8 gap-2 text-base" variant="outline" asChild>
                  <SafeLink href="/products/category/equipment" className="border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                    <Dumbbell className="h-5 w-5" />
                    Équipements
                  </SafeLink>
                </Button>
              </div>

              {/* On mobile, integrate stats here instead */}
              <div className="md:hidden mt-10 grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-white">+500</p>
                  <p className="text-sm text-white/80">Produits disponibles</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-white">100%</p>
                  <p className="text-sm text-white/80">Satisfaction garantie</p>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-center md:justify-start gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-secondary overflow-hidden bg-white/20">
                      <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  ))}
                </div>
                <div className="text-white text-sm">
                  <strong>+1500</strong> clients satisfaits
                </div>
              </div>
            </div>
            
            {/* Panneau d'informations - visible uniquement sur desktop */}
            <div className="hidden md:block md:w-1/2 animate-fade-in w-full order-1 md:order-2" style={{animationDuration: '1s', animationDelay: '0.2s'}}>
              <div className="relative rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm p-6 shadow-2xl border border-white/20 hover:shadow-primary/20 transition-all duration-500 h-[300px] md:h-[440px] lg:h-[485px]">
                <div className="h-full flex flex-col justify-center items-center text-white">
                  <h3 className="text-2xl font-bold mb-4">Qualité & Performance</h3>
                  <p className="text-center mb-6">Nos produits sont sélectionnés avec soin pour répondre aux exigences des sportifs de tous niveaux.</p>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white/20 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold">+500</p>
                      <p className="text-sm">Produits disponibles</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold">100%</p>
                      <p className="text-sm">Satisfaction garantie</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-secondary shadow-lg rounded-full p-3 z-30 animate-bounce" style={{animationDuration: '3s'}}>
                    <Badge className="flex items-center gap-1 text-sm font-bold px-3 py-1">
                      <TrendingUp className="h-4 w-4" />
                      Meilleure qualité
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats banner avec marge plus importante en bas */}
          <div className="mt-16 mb-16 grid grid-cols-2 md:grid-cols-4 gap-4 py-6 px-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 animate-fade-in-up" style={{animationDuration: '1s', animationDelay: '0.6s'}}>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">+2500</div>
              <div className="text-white/70 text-sm">Produits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">24h</div>
              <div className="text-white/70 text-sm">Livraison rapide</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">100%</div>
              <div className="text-white/70 text-sm">Authenticité</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">-20%</div>
              <div className="text-white/70 text-sm">Premières commandes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section ajustée pour éviter le chevauchement */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 font-heading mb-2">Nos catégories populaires</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explorez nos produits sélectionnés pour vous aider à atteindre vos objectifs fitness et améliorer vos performances.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {/* Category 1: Protéines */}
            <SafeLink href="/products/subcategory/proteine" className="group">
              <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white h-full">
                <div className="h-64 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                    alt="Protéines et suppléments" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white font-heading">Protéines</h3>
                      <p className="text-gray-200 mt-1">Pour la récupération et la croissance musculaire</p>
                    </div>
                  </div>
                </div>
              </div>
            </SafeLink>
            
            {/* Category 2: Équipements */}
            <SafeLink href="/products/subcategory/musculation" className="group">
              <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white h-full">
                <div className="h-64 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                    alt="Équipements de musculation" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white font-heading">Équipements</h3>
                      <p className="text-gray-200 mt-1">Des outils essentiels pour votre entraînement</p>
                    </div>
                  </div>
                </div>
              </div>
            </SafeLink>
            
            {/* Category 3: Accessoires */}
            <SafeLink href="/products/subcategory/accessoires" className="group">
              <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white h-full">
                <div className="h-64 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                    alt="Accessoires fitness" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white font-heading">Accessoires</h3>
                      <p className="text-gray-200 mt-1">Améliorez vos séances d'entraînement</p>
                    </div>
                  </div>
                </div>
              </div>
            </SafeLink>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 font-heading">Produits populaires</h2>
            <SafeLink href="/products" className="text-primary hover:text-primary/90 font-medium flex items-center transition-colors duration-200">
              Voir tout
              <ArrowRight className="h-5 w-5 ml-1" />
            </SafeLink>
          </div>
          
          <ProductGrid 
            products={safeProducts} 
            isLoading={isLoading} 
            error={error instanceof Error ? error : null}
          />
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-primary py-12 my-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:w-2/3">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-heading">
                Profitez de notre offre spéciale d'été !
              </h2>
              <p className="text-white/90 text-lg">
                Obtenez 20% de réduction sur tous les compléments alimentaires avec le code: <span className="font-bold">SUMMER20</span>
              </p>
            </div>
            <div>
              <Button asChild size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100 font-bold border-0">
                <SafeLink href="/products/category/supplement">J'en profite</SafeLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 font-heading mb-2">Pourquoi choisir Monaliza House ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nous nous engageons à vous offrir des produits de qualité supérieure adaptés à vos besoins.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Medal className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 font-heading">Produits Premium</h3>
              <p className="text-gray-600">
                Nous sélectionnons uniquement des produits de qualité supérieure pour garantir votre satisfaction.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Truck className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 font-heading">Livraison Rapide</h3>
              <p className="text-gray-600">
                Livraison dans tout le Maroc avec un service rapide et fiable pour vos commandes.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Headphones className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 font-heading">Support Expert</h3>
              <p className="text-gray-600">
                Notre équipe d'experts est disponible pour vous conseiller sur vos choix de produits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 font-heading mb-2">
              Ce que disent nos clients
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez les expériences de nos clients satisfaits avec nos produits et services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex text-amber-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Les protéines sont de très bonne qualité et le goût est excellent. La livraison a été rapide et le service client très réactif. Je recommande vivement !"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
                  <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Mehdi B.</h4>
                  <p className="text-gray-500 text-sm">Client depuis 6 mois</p>
                </div>
              </div>
            </div>
            
            {/* Review 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex text-amber-500 mb-3">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
                <svg className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21zm0-2.54l-3.71 2.25.89-3.81-2.96-2.58 3.91-.34L12 6.73l1.87 3.52 3.91.34-2.96 2.58.89 3.81-3.71-2.25z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-4">
                "J'ai acheté des haltères et des bandes élastiques, la qualité est au rendez-vous. Les prix sont compétitifs et la livraison a été rapide. Je suis très satisfaite !"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
                  <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Leila M.</h4>
                  <p className="text-gray-500 text-sm">Cliente depuis 1 an</p>
                </div>
              </div>
            </div>
            
            {/* Review 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex text-amber-500 mb-3">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-4">
                "Super boutique en ligne avec un large choix de produits fitness. Les compléments alimentaires ont vraiment amélioré mes performances. Service client au top !"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
                  <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Karim A.</h4>
                  <p className="text-gray-500 text-sm">Client depuis 3 mois</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-3 font-heading">Restez informé</h2>
            <p className="text-gray-300 mb-6">
              Inscrivez-vous à notre newsletter pour recevoir des conseils fitness, des offres exclusives et les dernières nouveautés.
            </p>
            <form className="flex flex-col md:flex-row gap-2 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                className="flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold">
                S'inscrire
              </Button>
            </form>
            <p className="text-gray-400 text-sm mt-4">
              En vous inscrivant, vous acceptez de recevoir nos emails. Vous pouvez vous désinscrire à tout moment.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
