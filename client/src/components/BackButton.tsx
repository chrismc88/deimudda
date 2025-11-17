import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  useHistory?: boolean; // If true, uses browser history instead of href
}

/**
 * Standardisierter Zurücklink für alle Seiten
 * Verwendet konsistente Farben, Icons und Styling
 * 
 * @param href - Target URL (default: "/")
 * @param label - Button text (default: "Zurück")
 * @param useHistory - If true, uses window.history.back() instead of href
 */
export default function BackButton({ 
  href = "/", 
  label = "Zurück",
  className = "",
  useHistory = false
}: BackButtonProps) {
  if (useHistory) {
    return (
      <button
        onClick={() => window.history.back()}
        className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors ${className}`}
      >
        <ArrowLeft className="w-4 h-4" />
        {label}
      </button>
    );
  }

  return (
    <Link 
      href={href} 
      className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Link>
  );
}

