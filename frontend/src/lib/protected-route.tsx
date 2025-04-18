import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

export function ProtectedRoute({
  component: Component,
  adminRequired = false,
}: {
  component: () => React.JSX.Element;
  adminRequired?: boolean;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Redirect to home if admin access required but user is not admin
  if (adminRequired && !user.isAdmin) {
    return <Redirect to="/" />;
  }

  return <Component />;
}
