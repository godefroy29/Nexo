import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-accent mb-4">404</h1>
            <h2 className="heading-2 mb-4 text-foreground">Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              Sorry, we couldn't find the page you're looking for. The page may have been moved, deleted, or you entered an incorrect URL.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              to="/" 
              className="btn-accent w-full flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return to Homepage
            </Link>
            
            <Link 
              to="/search" 
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse Listings
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="w-full text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
