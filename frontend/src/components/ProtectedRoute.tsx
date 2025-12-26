import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "../components";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Se ainda está carregando (checando token), mostra loading
  if (user === undefined) {
    return <LoadingSpinner />;
  }

  // Se não está autenticado, redireciona para login
  // Salva a URL atual para redirecionar depois do login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se está autenticado, renderiza o conteúdo
  return <>{children}</>;
}
