import { MapPin, Phone, Mail, Facebook, Instagram, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SafeLink } from "@/components/ui/safe-link";
import Logo from "@/components/layout/logo";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Logo className="mb-4" />
            <p className="text-gray-400 mb-4">
              Votre destination pour des produits de qualité.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/18tT9RSU5X/" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/monaliza__house/" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <SafeLink href="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Accueil
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/products/category/supplement" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Compléments
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/products/category/equipment" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Équipements
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/products" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Promotions
                </SafeLink>
              </li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">Service Client</h3>
            <ul className="space-y-2">
              <li>
                <SafeLink href="/auth" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Mon Compte
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/orders" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Suivi de Commande
                </SafeLink>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Livraison
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Retours & Remboursements
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-2 text-white" />
                <span className="text-gray-300">31000 Rte de Sefrou, Fès, Maroc</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0 text-white" />
                <span className="text-gray-300">+212 668-388676</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0 text-white" />
                <span className="text-gray-300">ayman2202ayman@gmail.com</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
                  <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334.6 349c-3.9 5.3-11.4 6.5-16.8 2.6z"/>
                </svg>
                <div>
                  <span className="text-gray-300 block">Lun-Dim: 9h-22h</span>
                  <span className="text-gray-300 block">Vend: Fermé</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-gray-800 my-6" />
        
        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; 2025 Monaliza House. Tous droits réservés.</p>
          <div className="flex space-x-4">
            <SafeLink href="/" className="text-gray-400 hover:text-white text-sm">Mentions légales</SafeLink>
            <SafeLink href="/" className="text-gray-400 hover:text-white text-sm">Politique de confidentialité</SafeLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
