import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  LogOut, 
  ChevronLeft, 
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SafeLinkButton } from "@/components/ui/safe-link-button";
import { SafeLink } from "@/components/ui/safe-link";
import Logo from "@/components/layout/logo";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isActiveRoute = (path: string) => {
    return location === path;
  };
  
  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Produits",
      path: "/admin/products",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Commandes",
      path: "/admin/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      name: "Clients",
      path: "/admin/customers",
      icon: <Users className="h-5 w-5" />,
    },
  ];
  
  return (
    <div className={cn(
      "bg-sidebar text-sidebar-foreground h-screen flex flex-col shadow-lg",
      collapsed ? "w-16" : "w-64",
      "transition-all duration-300 ease-in-out border-r border-sidebar-border",
      className
    )}>
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <SafeLink href="/admin" className="text-lg font-bold text-sidebar-foreground">
            <Logo />
          </SafeLink>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-full"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <SafeLinkButton
            key={item.path}
            href={item.path}
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground rounded-md transition-all duration-200",
              isActiveRoute(item.path) 
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-md" 
                : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground hover:translate-x-1"
            )}
          >
            {item.icon}
            {!collapsed && <span className="ml-3">{item.name}</span>}
          </SafeLinkButton>
        ))}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="outline" 
          className="w-full justify-start border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-secondary transition-all duration-200"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Déconnexion</span>}
        </Button>
      </div>
    </div>
  );
}
