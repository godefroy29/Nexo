import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MessageSquare, 
  Star, 
  Shield, 
  MapPin, 
  Calendar,
  Package,
  Truck,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
  Edit3
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { MessageModal } from "@/components/MessageModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const ListingPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        
        // Fetch listing with related data
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (listingError) throw listingError;

        // Fetch related data
        const [categoriesResult, conditionsResult, profilesResult] = await Promise.all([
          supabase.from('categories').select('*'),
          supabase.from('conditions').select('*'),
          supabase.from('profiles').select('*')
        ]);

        const category = categoriesResult.data?.find(c => c.id === listingData.category_id);
        const condition = conditionsResult.data?.find(c => c.id === listingData.condition_id);
        const profile = profilesResult.data?.find(p => p.user_id === listingData.user_id);

          const transformedListing = {
            ...listingData,
            images: listingData.images && listingData.images.length > 0 
              ? listingData.images 
              : [`https://picsum.photos/seed/${listingData.id}/800/600`], // Fallback image
            category: category?.name || 'Unknown',
            condition: condition?.name || 'Unknown',
          seller: {
            name: profile?.company_name || profile?.first_name || 'Unknown Seller',
            avatar: `https://picsum.photos/seed/${listingData.user_id}/100/100`,
            verified: profile?.is_verified || false,
            siret: "Not available",
            rating: 4.8,
            reviewCount: 127,
            responseTime: "2 hours",
            joinDate: "2019"
          },
          specifications: {
            "Condition": condition?.name || 'Unknown',
            "Category": category?.name || 'Unknown',
            "Posted": new Date(listingData.created_at).toLocaleDateString(),
            "Status": listingData.status,
            "Location": listingData.location || "Not specified"
          },
          postedDate: listingData.created_at,
          viewCount: Math.floor(Math.random() * 500) + 50 // Mock view count
        };

        setListing(transformedListing);
        setNewStatus(transformedListing.status);
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast.error("Failed to load listing");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const updateListingStatus = async () => {
    if (!id || !newStatus || newStatus === listing?.status) return;

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setListing(prev => ({ ...prev, status: newStatus }));
      toast.success("Listing status updated successfully");
    } catch (error) {
      console.error('Error updating listing status:', error);
      toast.error("Failed to update listing status");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-xl mb-2">Listing not found</p>
          <Link to="/search" className="btn-accent">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "location", label: "Location & Delivery" }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="bg-card border-b border-border py-4">
        <div className="container mx-auto px-4">
          <Link to="/search" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Search Results
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-8">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={listing.images[currentImageIndex]} 
                  alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              </div>
              
              {/* Thumbnail Navigation */}
              {listing.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-accent' : 'border-transparent hover:border-border'
                      }`}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title and Basic Info */}
            <div className="mb-6">
              <h1 className="heading-1 mb-4">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="badge-price text-lg">€{listing.price.toLocaleString()}</span>
                {user && user.id === listing.user_id && (
                  <span className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">
                    Mine
                  </span>
                )}
                <span className="badge-verified">
                  <Shield className="w-3 h-3" />
                  Verified Seller
                </span>
                <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {listing.condition}
                </span>
                {isAdmin() && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={updateListingStatus}
                      disabled={newStatus === listing.status}
                    >
                      Update
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {listing.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Posted {new Date(listing.postedDate).toLocaleDateString()}
                </div>
                <div>{listing.viewCount} views</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border mb-6">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-accent text-accent'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-96">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-foreground">
                    {listing.description}
                  </div>
                </div>
              )}
              
              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {Object.entries(listing.specifications).map(([key, value]) => (
                     <div key={key} className="bg-card border border-border rounded-lg p-4">
                       <dt className="font-medium text-foreground mb-1">{key}</dt>
                       <dd className="text-muted-foreground">{String(value)}</dd>
                     </div>
                   ))}
                </div>
              )}
              
              {activeTab === "location" && (
                <div className="space-y-6">
                  <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Interactive map would be here</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="heading-3 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-accent" />
                        Pickup Location
                      </h3>
                      <p className="text-foreground mb-2">{listing.location}</p>
                      <p className="text-sm text-muted-foreground">
                        Available for viewing Monday-Friday 9AM-5PM
                      </p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="heading-3 mb-4 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-accent" />
                        Delivery Options
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          Local delivery available
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          Professional installation
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          Nationwide shipping
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Action Buttons */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="space-y-4">
                  {/* Edit Button - only for listing owner or admin */}
                  {(user && (user.id === listing.user_id || isAdmin())) && (
                    <button 
                      onClick={() => navigate(`/post?edit=${listing.id}`)}
                      className="btn-outline w-full flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Listing
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      if (!user) {
                        toast.error("Please login to contact the seller");
                        return;
                      }
                      if (user.id === listing.user_id) {
                        toast.error("You cannot message yourself");
                        return;
                      }
                      setIsMessageModalOpen(true);
                    }}
                    className="btn-accent w-full flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Seller
                  </button>
                  <button className="btn-outline w-full">
                    Request Quote
                  </button>
                  <div className="flex gap-2">
                    <button className="btn-outline flex-1 flex items-center justify-center gap-2">
                      <Heart className="w-4 h-4" />
                      Save
                    </button>
                    <button className="btn-outline flex-1 flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="heading-3 mb-4">Seller Information</h3>
                <div className="flex items-start gap-3 mb-4">
                  <img 
                    src={listing.seller.avatar} 
                    alt={listing.seller.name}
                    className="w-12 h-12 rounded-full bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">{listing.seller.name}</h4>
                      {listing.seller.verified && (
                        <span className="badge-verified">
                          <Shield className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {listing.seller.rating} ({listing.seller.reviewCount} reviews)
                    </div>
                    <p className="text-xs text-muted-foreground">
                      SIRET: {listing.seller.siret}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response time:</span>
                    <span className="text-foreground">{listing.seller.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since:</span>
                    <span className="text-foreground">{listing.seller.joinDate}</span>
                  </div>
                </div>
                
                <button className="btn-outline w-full mt-4">
                  View Seller Profile
                </button>
              </div>

              {/* Security Notice */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Secure Transaction</h4>
                    <p className="text-sm text-muted-foreground">
                      All communications are encrypted and seller identity is verified.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        recipientId={listing.user_id}
        recipientName={listing.seller.name}
      />
    </div>
  );
};

export default ListingPage;