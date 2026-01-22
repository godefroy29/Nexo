import { Search, ArrowRight, Shield, Clock, Users, Factory, Truck, Laptop, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import heroImage from "../assets/hero-marketplace.jpg";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/search");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const categories = [
    {
      name: "Industrial Equipment",
      count: "250+",
      icon: Factory,
      color: "bg-blue-500",
    },
    {
      name: "Construction Machinery",
      count: "180+",
      icon: Truck,
      color: "bg-orange-500",
    },
    {
      name: "Office Equipment", 
      count: "320+",
      icon: Laptop,
      color: "bg-green-500",
    },
    {
      name: "Commercial Real Estate",
      count: "95+",
      icon: Building,
      color: "bg-purple-500",
    },
  ];

  const quickLinks = [
    {
      title: "Browse Listings",
      description: "Explore thousands of verified B2B equipment and services",
      icon: Search,
      href: "/search",
    },
    {
      title: "How It Works",
      description: "Learn how our marketplace connects buyers and sellers",
      icon: Users,
      href: "/how-it-works",
    },
    {
      title: "Contact Sales",
      description: "Get personalized assistance for your business needs",
      icon: Shield,
      href: "/contact",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/90 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="B2B Industrial Marketplace" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-primary/60"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="heading-1 mb-6 text-primary-foreground">
              Find the right B2B equipment & services{" "}
              <span className="text-accent">in seconds</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Connect with verified suppliers, discover quality equipment, and grow your business on Europe's leading B2B marketplace.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-3 p-3 bg-white rounded-xl shadow-lg">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    className="w-full pl-12 pr-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <button onClick={handleSearch} className="btn-accent whitespace-nowrap">
                  Search Now
                </button>
              </div>
            </div>
            
            <Link to="/post" className="btn-accent inline-flex items-center gap-2 text-lg">
              Post Your Listing
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                to={link.href}
                className="card-interactive group text-center"
              >
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <link.icon className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="heading-3 mb-2">{link.title}</h3>
                <p className="text-muted-foreground">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Featured Categories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover equipment and services across our most popular business categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/search?category=${encodeURIComponent(category.name.toLowerCase())}`}
                className="card-interactive group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} Listings</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Why Choose BizMarket</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trusted by thousands of businesses across Europe
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="heading-3 mb-2">Verified Sellers</h3>
              <p className="text-muted-foreground">
                All sellers are verified with SIRET numbers and business credentials
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-accent" />
              </div>
              <h3 className="heading-3 mb-2">Fast Response</h3>
              <p className="text-muted-foreground">
                Average response time of 2 hours for seller inquiries
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="heading-3 mb-2">Expert Support</h3>
              <p className="text-muted-foreground">
                Dedicated account managers for enterprise customers
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;