import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { hasDevSession, isDevMode } from "./dev-mode";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Check if we're in dev mode with a valid dev session before redirecting
  if (!user) {
    if (isDevMode() && hasDevSession()) {
      console.log('[DEV MODE] Bypassing authentication check for protected route:', path);
      return <Route path={path} component={Component} />;
    }
    
    return (
      <Route path={path}>
        <Redirect to="/login" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}