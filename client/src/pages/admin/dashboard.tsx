import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  ArrowRight, 
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/admin/sidebar";
import StatsCard from "@/components/admin/stats-card";
import { SafeLink } from "@/components/ui/safe-link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatPrice } from "@/lib/utils";
import { Stats } from "@shared/schema";

const CHART_COLORS = [
  "#10B981", // primary
  "#3B82F6", 
  "#F59E0B", 
  "#EF4444", 
  "#8B5CF6"
];

export default function AdminDashboard() {
  // Fetch statistics
  const { 
    data: stats, 
    isLoading, 
    error
  } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"]
  });

  // Convert sales by month to chart data
  const salesChartData = stats?.salesByMonth ? 
    Object.entries(stats.salesByMonth).map(([month, amount]) => ({
      month,
      amount: amount / 100, // Convert from centimes to MAD
    })) : [];

  // Convert popular products to chart data
  const popularProductsData = stats?.popularProducts || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chargement du tableau de bord...</h2>
            <p className="text-gray-600">Préparation des statistiques</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !stats) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur est survenue lors du chargement des statistiques. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de bord administrateur</h1>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Ventes totales"
              value={formatPrice(stats.totalSales)}
              description="Total des ventes à ce jour"
              icon={<DollarSign className="h-4 w-4" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Commandes"
              value={stats.totalOrders.toString()}
              description="Nombre de commandes passées"
              icon={<ShoppingCart className="h-4 w-4" />}
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Clients"
              value={stats.totalCustomers.toString()}
              description="Clients inscrits"
              icon={<Users className="h-4 w-4" />}
              trend={{ value: 15, isPositive: true }}
            />
            <StatsCard
              title="Produits populaires"
              value={stats.popularProducts.length.toString()}
              description="Produits les plus vendus"
              icon={<Package className="h-4 w-4" />}
            />
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Ventes mensuelles</CardTitle>
                <CardDescription>Évolution des ventes sur les derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {salesChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={salesChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} MAD`, "Ventes"]} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          name="Ventes (MAD)"
                          stroke="#10B981"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Aucune donnée de vente disponible
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Popular Products Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Produits populaires</CardTitle>
                <CardDescription>Les produits les plus vendus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {popularProductsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={popularProductsData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip formatter={(value) => [`${value} unités`, "Ventes"]} />
                        <Legend />
                        <Bar
                          dataKey="sales"
                          name="Unités vendues"
                          fill="#10B981"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Aucune donnée de produit disponible
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Gestion des produits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Gérez votre catalogue de produits, ajoutez de nouveaux produits, mettez à jour les stocks et les prix.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <SafeLink href="/admin/products">
                    Gérer les produits
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </SafeLink>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Gestion des commandes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Suivez toutes les commandes, mettez à jour les statuts et consultez les détails des commandes.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <SafeLink href="/admin/orders">
                    Gérer les commandes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </SafeLink>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Gestion des clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Consultez la liste des clients, leurs informations et leur historique de commandes.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <SafeLink href="/admin/customers">
                    Gérer les clients
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </SafeLink>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
