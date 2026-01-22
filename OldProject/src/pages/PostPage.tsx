import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Upload, X, Camera, CheckCircle } from "lucide-react";

const PostPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;
  
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    condition: "",
    price: "",
    location: "",
    photos: [] as File[]
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const steps = [
    { id: 1, title: "Category & Title", description: "Choose category and add a title" },
    { id: 2, title: "Details", description: "Add description and specifications" },
    { id: 3, title: "Photos", description: "Upload product images" },
    { id: 4, title: "Location", description: "Set pickup location" },
    { id: 5, title: "Review & Publish", description: `Review and ${isEditing ? 'update' : 'publish'} your listing` }
  ];

  // Load categories and conditions
  useEffect(() => {
    loadCategoriesAndConditions();
  }, []);

  // Load existing listing data for editing
  useEffect(() => {
    if (isEditing && editId && user) {
      loadListingForEdit(editId);
    }
  }, [isEditing, editId, user]);

  const loadCategoriesAndConditions = async () => {
    try {
      setLoadingOptions(true);
      const [categoriesResponse, conditionsResponse] = await Promise.all([
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('conditions').select('id, name').order('name')
      ]);

      if (categoriesResponse.error) throw categoriesResponse.error;
      if (conditionsResponse.error) throw conditionsResponse.error;

      setCategories(categoriesResponse.data || []);
      setConditions(conditionsResponse.data || []);
    } catch (error) {
      console.error('Error loading categories and conditions:', error);
      toast({ title: "Error", description: "Failed to load categories and conditions", variant: "destructive" });
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadListingForEdit = async (listingId: string) => {
    try {
      setLoading(true);
      const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (!listing) {
        toast({ title: "Error", description: "Listing not found or you don't have permission to edit it", variant: "destructive" });
        navigate('/dashboard');
        return;
      }

          // Populate form with existing data
          setFormData({
            category: listing.category_id || "",
            title: listing.title || "",
            description: listing.description || "",
            condition: listing.condition_id || "",
            price: listing.price?.toString() || "",
            location: listing.location || "",
            photos: [] // We'll handle existing images separately
          });

    } catch (error) {
      console.error('Error loading listing:', error);
      toast({ title: "Error", description: "Failed to load listing data", variant: "destructive" });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).slice(0, 8 - formData.photos.length);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newFiles]
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.category && formData.title.trim().length > 0;
      case 2:
        return formData.description.trim().length > 0 && formData.condition && formData.price;
      case 3:
        return formData.photos.length > 0 || isEditing; // Allow editing without new photos
      case 4:
        return formData.location.trim().length > 0;
      default:
        return true;
    }
  };

  const uploadImages = async (files: File[], listingId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${listingId}/${Date.now()}-${i}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file);
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);
        
      uploadedUrls.push(data.publicUrl);
    }
    
    return uploadedUrls;
  };

  const handlePublish = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!formData.title || !formData.description || !formData.price) {
      toast({ title: 'Missing information', description: 'Please complete all steps before publishing.', variant: 'destructive' });
      return;
    }
    const priceNumber = parseFloat(formData.price);
    if (isNaN(priceNumber)) {
      toast({ title: 'Invalid price', description: 'Please enter a valid numeric price.', variant: 'destructive' });
      return;
    }
    
    try {
      setPublishing(true);
      
      if (isEditing && editId) {
        // Upload new images if any
        let imageUrls: string[] = [];
        if (formData.photos.length > 0) {
          imageUrls = await uploadImages(formData.photos, editId);
        }
        
        // Update existing listing
        const updateData: any = {
          title: formData.title,
          description: formData.description,
          category_id: formData.category || null,
          condition_id: formData.condition || null,
          price: priceNumber,
          location: formData.location,
          updated_at: new Date().toISOString()
        };
        
        // Only update images if new ones were uploaded
        if (imageUrls.length > 0) {
          updateData.images = imageUrls;
        }
        
        const { error } = await supabase
          .from('listings')
          .update(updateData)
          .eq('id', editId)
          .eq('user_id', user.id);

        if (error) throw error;
        toast({ title: 'Listing updated', description: 'Your listing was updated successfully.' });
      } else {
        // Create new listing first to get the ID
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            category_id: formData.category || null,
            condition_id: formData.condition || null,
            price: priceNumber,
            location: formData.location,
            status: 'draft'
          })
          .select()
          .single();

        if (listingError) throw listingError;
        
        // Upload images if any
        let imageUrls: string[] = [];
        if (formData.photos.length > 0 && listing) {
          imageUrls = await uploadImages(formData.photos, listing.id);
          
          // Update listing with image URLs
          const { error: updateError } = await supabase
            .from('listings')
            .update({ images: imageUrls })
            .eq('id', listing.id);
            
          if (updateError) throw updateError;
        }
        
        toast({ title: 'Listing submitted', description: 'Your listing was created successfully.' });
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: isEditing ? 'Update failed' : 'Publish failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="input-field"
                required
                disabled={loadingOptions}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Listing Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Industrial Conveyor Belt System - 50m Professional Grade"
                className="input-field"
                maxLength={100}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Provide detailed information about your item, including features, specifications, and condition details..."
                className="input-field min-h-32"
                maxLength={2000}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/2000 characters
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Condition *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {conditions.map((condition) => (
                  <label
                    key={condition.id}
                    className={`border border-border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.condition === condition.id
                        ? 'border-accent bg-accent/5'
                        : 'hover:border-accent/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={condition.id}
                      checked={formData.condition === condition.id}
                      onChange={(e) => handleInputChange("condition", e.target.value)}
                      className="sr-only"
                      disabled={loadingOptions}
                    />
                    <div className="font-medium text-foreground mb-1">{condition.name}</div>
                    {condition.description && (
                      <div className="text-sm text-muted-foreground">{condition.description}</div>
                    )}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price (€) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                className="input-field"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the asking price in euros
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Photos * (Maximum 8 photos)
              </label>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="sr-only"
                  id="photo-upload"
                  disabled={formData.photos.length >= 8}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">
                    Click to upload photos or drag and drop
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG up to 10MB each
                  </p>
                </label>
              </div>
              
              {/* Photo Preview Grid */}
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.photos.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border border-border"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                First photo will be used as the main image. You can drag to reorder.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Paris, France or enter full address"
                className="input-field"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be shown to potential buyers for pickup/delivery
              </p>
            </div>
            
            <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Interactive map for location selection would be here</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Privacy Notice</h4>
              <p className="text-sm text-muted-foreground">
                Your exact address won't be shown publicly. Only the general area will be visible to help buyers understand the location.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="heading-3">Review Your Listing</h3>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={formData.photos.length > 0 ? URL.createObjectURL(formData.photos[0]) : "/placeholder.svg"}
                    alt="Main product"
                    className="w-full aspect-video object-cover rounded-lg bg-muted"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{formData.title}</h4>
                    <p className="text-sm text-muted-foreground">{formData.category}</p>
                  </div>
                  
                  <div>
                    <span className="badge-price">€{parseInt(formData.price || "0").toLocaleString()}</span>
                  </div>
                  
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Condition:</span>
                      <span className="text-foreground capitalize">{formData.condition?.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="text-foreground">{formData.location}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {formData.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    {isEditing ? 'Ready to Update' : 'Ready to Publish'}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {isEditing 
                      ? 'Your changes will be saved and the listing updated.'
                      : 'Your listing will be reviewed and published within 24 hours.'
                    }
                  </p>
                  {!isEditing && (
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Listing will be active for 60 days</li>
                      <li>• You'll receive email notifications for inquiries</li>
                      <li>• You can edit or delete anytime from your dashboard</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {loading ? (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading listing data...</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="heading-2">{isEditing ? 'Edit Listing' : 'Post a Listing'}</h1>
                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      index + 1 <= currentStep ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              
              <div className="text-center">
                <h2 className="font-semibold text-foreground">{steps[currentStep - 1].title}</h2>
                <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`btn-outline flex items-center gap-2 ${
                  currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {currentStep < steps.length ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className={`btn-accent flex items-center gap-2 ${
                    !canProceed() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={publishing || !canProceed()}
                  className={`btn-accent flex items-center gap-2 ${
                    (publishing || !canProceed()) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {publishing ? (isEditing ? 'Updating...' : 'Publishing...') : (isEditing ? 'Update Listing' : 'Publish Listing')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPage;