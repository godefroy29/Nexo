import { useState } from "react";
import { Search, Menu, X, MessageSquare, User, LogOut, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useRoles();

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-primary border-b border-primary/20 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold font-heading text-primary-foreground">
              BizMarket
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors hover:text-accent ${
                isActive("/") ? "text-accent" : "text-primary-foreground"
              }`}
            >
              Home
            </Link>
            {user && (
              <Link
                to="/search"
                className={`font-medium transition-colors hover:text-accent ${
                  isActive("/search") ? "text-accent" : "text-primary-foreground"
                }`}
              >
                Browse
              </Link>
            )}
            {user && (
              <Link
                to="/post"
                className={`font-medium transition-colors hover:text-accent ${
                  isActive("/post") ? "text-accent" : "text-primary-foreground"
                }`}
              >
                Post Listing
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 font-medium text-primary-foreground hover:text-accent transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Account</span>
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                        <div className="p-2">
                          <Link
                            to="/dashboard"
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            <span>Dashboard</span>
                          </Link>
                          {isAdmin() && (
                            <Link
                              to="/admin"
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Shield className="w-4 h-4" />
                              <span>Admin</span>
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              signOut();
                              setIsUserMenuOpen(false);
                            }}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="font-medium text-primary-foreground hover:text-accent transition-colors"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
            <button className="btn-accent flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Contact
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-primary-foreground hover:text-accent transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary border-t border-primary/20">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              to="/"
              onClick={toggleMobileMenu}
              className={`block font-medium transition-colors hover:text-accent ${
                isActive("/") ? "text-accent" : "text-primary-foreground"
              }`}
            >
              Home
            </Link>
            {user && (
              <Link
                to="/search"
                onClick={toggleMobileMenu}
                className={`block font-medium transition-colors hover:text-accent ${
                  isActive("/search") ? "text-accent" : "text-primary-foreground"
                }`}
              >
                Browse
              </Link>
            )}
            {user && (
              <Link
                to="/post"
                onClick={toggleMobileMenu}
                className={`block font-medium transition-colors hover:text-accent ${
                  isActive("/post") ? "text-accent" : "text-primary-foreground"
                }`}
              >
                Post Listing
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={toggleMobileMenu}
                  className="block font-medium text-primary-foreground hover:text-accent transition-colors"
                >
                  Dashboard
                </Link>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    onClick={toggleMobileMenu}
                    className="block font-medium text-primary-foreground hover:text-accent transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    toggleMobileMenu();
                  }}
                  className="block font-medium text-primary-foreground hover:text-accent transition-colors text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={toggleMobileMenu}
                className="block font-medium text-primary-foreground hover:text-accent transition-colors"
              >
                Login
              </Link>
            )}
            <button className="btn-accent w-full flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Contact
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;