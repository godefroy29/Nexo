import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Package, 
  MessageSquare, 
  Settings, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [messages, setMessages] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    pendingMessages: 0,
    activeListings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; listing?: any }>({ isOpen: false });
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch user's messages (both sent and received)
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Fetch related data separately to avoid relation issues
      const listingIds = [...new Set(messagesData?.map(m => m.listing_id) || [])];
      const userIds = [...new Set(messagesData?.flatMap(m => [m.sender_id, m.recipient_id]) || [])];

      // Fetch listings
      const { data: listingsData } = listingIds.length > 0 
        ? await supabase.from('listings').select('id, title').in('id', listingIds)
        : { data: [] };

      // Fetch profiles
      const { data: profilesData } = userIds.length > 0 
        ? await supabase.from('profiles').select('user_id, company_name, first_name').in('user_id', userIds)
        : { data: [] };

      // Create lookup maps
      const listingsMap = new Map(listingsData?.map(l => [l.id, l] as const) || []);
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p] as const) || []);

      // Transform messages for display
      const transformedMessages = messagesData?.map((message: any) => {
        const senderProfile = profilesMap.get(message.sender_id) as any;
        const recipientProfile = profilesMap.get(message.recipient_id) as any;
        const listing = listingsMap.get(message.listing_id) as any;

        return {
          id: message.id,
          sender: message.sender_id === user.id 
            ? 'You' 
            : senderProfile?.company_name || senderProfile?.first_name || 'Unknown',
          recipient: message.recipient_id === user.id 
            ? 'You' 
            : recipientProfile?.company_name || recipientProfile?.first_name || 'Unknown',
          subject: message.subject,
          preview: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
          timestamp: new Date(message.created_at).toLocaleDateString(),
          unread: message.recipient_id === user.id && !message.read_at,
          avatar: `https://picsum.photos/seed/${message.sender_id}/40/40`,
          listing_title: listing?.title || 'Unknown Listing',
          is_received: message.recipient_id === user.id
        };
      }) || [];

      setMessages(transformedMessages);

      // Fetch user's listings (including deleted ones for the owner to see)
      const { data: userListingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // Fetch categories for listings
      const categoryIds = [...new Set(userListingsData?.map(l => l.category_id).filter(Boolean) || [])];
      const { data: categoriesData } = categoryIds.length > 0 
        ? await supabase.from('categories').select('id, name').in('id', categoryIds)
        : { data: [] };

      const categoriesMap = new Map(categoriesData?.map(c => [c.id, c] as const) || []);

      const transformedListings = userListingsData?.map((listing: any) => {
        const category = categoriesMap.get(listing.category_id) as any;
        let status = 'Draft';
        if (listing.deleted_by_user) {
          status = 'Deleted';
        } else if (listing.disabled_by_admin) {
          status = 'Disabled';
        } else if (listing.status === 'published') {
          status = 'Published';
        }
        
        return {
          id: listing.id,
          title: listing.title,
          category: category?.name || 'Unknown',
          price: listing.price || 0,
          status: status,
          views: Math.floor(Math.random() * 500) + 50, // Mock views
          created: new Date(listing.created_at).toLocaleDateString(),
          image: listing.images?.[0] || `https://picsum.photos/seed/${listing.id}/100/80`,
          deleted_by_user: listing.deleted_by_user
        };
      }) || [];

      setListings(transformedListings);

      // Calculate stats (exclude deleted listings)
      const totalListings = userListingsData?.filter(l => !l.deleted_by_user).length || 0;
      const activeListings = userListingsData?.filter(l => l.status === 'published' && !l.deleted_by_user).length || 0;
      const pendingMessages = transformedMessages.filter(m => m.unread && m.is_received).length;
      const totalViews = transformedListings.filter(l => !l.deleted_by_user).reduce((sum, listing) => sum + listing.views, 0);

      setStats({
        totalListings,
        totalViews,
        pendingMessages,
        activeListings
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', user?.id);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, unread: false } : msg
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        pendingMessages: Math.max(0, prev.pendingMessages - 1)
      }));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleViewListing = (listingId: string) => {
    navigate(`/listing/${listingId}`);
  };

  const handleEditListing = (listingId: string) => {
    navigate(`/post?edit=${listingId}`);
  };

  const handleDeleteListing = (listing: any) => {
    setDeleteModal({ isOpen: true, listing });
    setDeleteReason("");
  };

  const confirmDeleteListing = async () => {
    if (!deleteModal.listing || !deleteReason.trim()) {
      toast.error("Please provide a reason for deletion");
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('listings')
        .update({
          deleted_by_user: true,
          deleted_at: new Date().toISOString(),
          deletion_reason: deleteReason.trim()
        })
        .eq('id', deleteModal.listing.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success("Listing deleted successfully");
      setDeleteModal({ isOpen: false });
      setDeleteReason("");
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error("Failed to delete listing");
    } finally {
      setIsDeleting(false);
    }
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "listings", label: "My Listings", icon: Package },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: stats.pendingMessages },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="heading-2 mb-6">Dashboard Overview</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Listings</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalListings}</p>
              </div>
              <Package className="w-8 h-8 text-accent" />
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-accent" />
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold text-foreground">{stats.pendingMessages}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-accent" />
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeListings}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="heading-3 mb-4">Recent Messages</h3>
            <div className="space-y-4">
              {messages.slice(0, 3).map((message) => (
                <div key={message.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <img src={message.avatar} alt="" className="w-8 h-8 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-foreground truncate">
                        {message.is_received ? `From: ${message.sender}` : `To: ${message.recipient}`}
                      </p>
                      {message.unread && (
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{message.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.listing_title} • {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveTab("messages")}
              className="btn-outline w-full mt-4"
            >
              View All Messages
            </button>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="heading-3 mb-4">Top Performing Listings</h3>
            <div className="space-y-4">
              {listings
                .filter(listing => listing.status === "Published")
                .sort((a, b) => b.views - a.views)
                .slice(0, 3)
                .map((listing) => (
                <div key={listing.id} className="flex items-center gap-3">
                  <img src={listing.image} alt="" className="w-12 h-10 object-cover rounded bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">{listing.views} views</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">€{listing.price.toLocaleString()}</p>
                  <button 
                    onClick={() => handleViewListing(listing.id)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                    title="View listing"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderListings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-2">My Listings</h2>
        <Link to="/post" className="btn-accent flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Listing
        </Link>
      </div>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-foreground">Product</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Category</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Price</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Views</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing, index) => (
                <tr key={listing.id} className={`border-t border-border ${index % 2 === 0 ? 'bg-card' : 'bg-secondary/10'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={listing.image} alt="" className="w-12 h-10 object-cover rounded bg-muted" />
                      <div>
                        <p className="font-medium text-sm text-foreground">{listing.title}</p>
                        <p className="text-xs text-muted-foreground">Created {listing.created}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-foreground">{listing.category}</td>
                  <td className="p-4 text-sm font-medium text-foreground">€{listing.price.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      listing.status === 'Published' 
                        ? 'bg-accent/10 text-accent' 
                        : listing.status === 'Deleted'
                        ? 'bg-destructive/10 text-destructive'
                        : listing.status === 'Disabled'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-foreground">{listing.views}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewListing(listing.id)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                        title="View listing"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!listing.deleted_by_user && (
                        <>
                          <button 
                            onClick={() => handleEditListing(listing.id)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                            title="Edit listing"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteListing(listing)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                            title="Delete listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      <h2 className="heading-2">Messages</h2>
      
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <input
            type="text"
            placeholder="Search conversations..."
            className="input-field"
          />
        </div>
        
        <div className="divide-y divide-border">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`p-4 hover:bg-secondary/50 cursor-pointer ${message.unread ? 'bg-accent/5' : ''}`}
              onClick={() => {
                if (message.unread && message.is_received) {
                  markMessageAsRead(message.id);
                }
              }}
            >
              <div className="flex items-start gap-3">
                <img src={message.avatar} alt="" className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-medium text-sm ${message.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {message.is_received ? `From: ${message.sender}` : `To: ${message.recipient}`}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      {message.unread && (
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm mb-1 ${message.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {message.subject}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Re: {message.listing_title}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {messages.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No messages yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="heading-2">Account Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="heading-3 mb-4">Company Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
              <input type="text" defaultValue="TechMach Industries" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">SIRET Number</label>
              <input type="text" defaultValue="12345678901234" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Business Email</label>
              <input type="email" defaultValue="contact@techmach.com" className="input-field" />
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="heading-3 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-border" />
              <span className="text-sm text-foreground">Email notifications for new messages</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-border" />
              <span className="text-sm text-foreground">Weekly performance reports</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-border" />
              <span className="text-sm text-foreground">Marketing updates</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="heading-3 mb-4">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
            <input type="password" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
            <input type="password" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
            <input type="password" className="input-field" />
          </div>
        </div>
        <button className="btn-accent mt-4">Update Password</button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "listings":
        return renderListings();
      case "messages":
        return renderMessages();
      case "settings":
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-card border border-border rounded-lg p-4 sticky top-24">
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="heading-3 mb-4 text-destructive">Delete Listing</h3>
            
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete "<strong>{deleteModal.listing?.title}</strong>"? 
              This action cannot be undone.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Reason for deletion *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Please provide a reason for deleting this listing..."
                className="input-field min-h-20"
                required
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false })}
                className="btn-outline"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteListing}
                disabled={isDeleting || !deleteReason.trim()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;