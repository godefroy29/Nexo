import { useEffect, useState } from "react";
import { Search, Filter, MapPin, Star, Shield, Heart, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Condition {
  id: string;
  name: string;
  description: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  user_id: string;
  status: string;
  created_at: string;
  category: { name: string };
  condition: { name: string };
  profiles: {
    company_name: string;
    is_verified: boolean;
  };
}

const SearchPage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("All Countries");
  const [sort, setSort] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set initial query from URL parameters
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
    }
    
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch conditions
      const { data: conditionsData, error: conditionsError } = await supabase
        .from('conditions')
        .select('*')
        .order('name');

      if (conditionsError) throw conditionsError;
      setConditions(conditionsData || []);

      // Fetch listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'published')
        .eq('disabled_by_admin', false);

      if (listingsError) throw listingsError;
      
      // Fetch profiles separately to avoid relation issues
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, company_name, is_verified');

      if (profilesError) throw profilesError;
      
      // Transform the data to match our interface
      const transformedListings = listingsData?.map(listing => {
        const profile = profilesData?.find(p => p.user_id === listing.user_id);
        const category = categoriesData?.find(c => c.id === listing.category_id);
        const condition = conditionsData?.find(c => c.id === listing.condition_id);
        
        return {
          ...listing,
          category: category || { name: 'Unknown' },
          condition: condition || { name: 'Unknown' },
          profiles: profile || { company_name: 'Unknown', is_verified: false }
        };
      }) || [];

      setListings(transformedListings);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load search data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Derived results based on filters
  const filteredListings = listings
    .filter((l) => {
      const matchesQuery = query.trim().length === 0 ||
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(l.category.name);
      const matchesCondition = selectedConditions.length === 0 || selectedConditions.includes(l.condition.name);
      const matchesLocation = selectedLocation === 'All Countries' || l.location.includes(selectedLocation);
      const matchesPrice = l.price >= priceRange[0] && l.price <= priceRange[1];
      return matchesQuery && matchesCategory && matchesCondition && matchesLocation && matchesPrice;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        default:
          return 0;
      }
    });

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize));
  const paginatedListings = filteredListings.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategories, selectedConditions, selectedLocation, priceRange, sort]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="bg-card border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search for equipment, services, or suppliers..."
                className="input-field pl-12"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="btn-outline flex items-center gap-2 md:hidden"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h3 className="heading-3 mb-6">Filters</h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-border"
                        checked={selectedCategories.includes(category.name)}
                        onChange={(e) => {
                          setSelectedCategories((prev) => e.target.checked ? [...prev, category.name] : prev.filter(c => c !== category.name));
                        }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Price Range (€)</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="Min"
                    className="input-field text-sm"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="input-field text-sm"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Location</h4>
                <select className="input-field" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                  <option>All Countries</option>
                  <option>France</option>
                  <option>Germany</option>
                  <option>Netherlands</option>
                  <option>Belgium</option>
                </select>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Condition</h4>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <label key={condition.id} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-border"
                        checked={selectedConditions.includes(condition.name)}
                        onChange={(e) => {
                          setSelectedConditions((prev) => e.target.checked ? [...prev, condition.name] : prev.filter(c => c !== condition.name));
                        }}
                      />
                      <span className="text-sm">{condition.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="btn-accent w-full">Apply Filters</button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="heading-2">Search Results</h2>
                <p className="text-muted-foreground">{filteredListings.length} listings found • Page {currentPage} of {totalPages}</p>
              </div>
              <select className="input-field max-w-48" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="relevance">Sort by Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedListings.map((listing) => (
                <div key={listing.id} className="card-listing group">
                  <div className="relative">
                    <img 
                      src={listing.images?.[0] || "https://picsum.photos/400/300"} 
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                    <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                    </button>
                    <div className="absolute bottom-3 left-3">
                      <span className="badge-price">€{listing.price.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                        <Link to={`/listing/${listing.id}`}>{listing.title}</Link>
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {listing.profiles.is_verified && (
                        <span className="badge-verified">
                          <Shield className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{listing.condition.name}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {listing.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {listing.location}
                      </div>
                      <Link 
                        to={`/listing/${listing.id}`}
                        className="btn-outline text-xs px-3 py-1"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <button 
                className="btn-outline flex items-center gap-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-2">
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${n === currentPage ? 'bg-accent text-accent-foreground' : 'hover:bg-secondary'}`}
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button 
                className="btn-outline flex items-center gap-2"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;