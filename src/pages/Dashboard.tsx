import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, ArrowRight, Clock, Trash2, Download, Plus, Pencil, Check, X, Crown, Zap, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, differenceInHours, addHours } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdminCheck } from '@/hooks/useAdminCheck';

type Category = 'Bottomwear' | 'Topwear' | 'Shoes' | 'Dresses';

interface GeneratedImage {
  id: string;
  image_url: string | null;
  created_at: string;
  gender: string;
  ethnicity: string;
  status: string;
  category: Category | null;
  custom_name: string | null;
}

const CATEGORIES: Category[] = ['Topwear', 'Bottomwear', 'Shoes', 'Dresses'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { subscription, loading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();
  const { isAdmin } = useAdminCheck();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const getPlanDisplayName = (plan: string | undefined) => {
    switch (plan) {
      case 'trial': return 'Trial';
      case 'starter': return 'Starter';
      case 'pro': return 'Pro';
      case 'creator': return 'Creator';
      default: return 'Trial';
    }
  };

  const getPlanBadgeStyles = (plan: string | undefined) => {
    switch (plan) {
      case 'creator':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      case 'pro':
        return 'bg-gradient-to-r from-primary to-purple-500 text-white';
      case 'starter':
        return 'bg-primary/20 text-primary border border-primary/30';
      default:
        return 'bg-muted text-muted-foreground border border-border';
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchImages();
      refetchSubscription(); // Always sync credits on mount/navigation
    }
  }, [user, refetchSubscription]);

  const fetchImages = async () => {
    setLoadingImages(true);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('model_generations')
      .select('id, image_url, created_at, gender, ethnicity, status, category, custom_name')
      .eq('user_id', user!.id)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching images',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setImages((data as GeneratedImage[]) || []);
    }
    setLoadingImages(false);
  };

  const getTimeRemaining = (createdAt: string) => {
    const expiryTime = addHours(new Date(createdAt), 24);
    const hoursLeft = differenceInHours(expiryTime, new Date());
    const minutesLeft = Math.round((expiryTime.getTime() - Date.now()) / (1000 * 60)) % 60;
    
    if (hoursLeft <= 0 && minutesLeft <= 0) return 'Expired';
    if (hoursLeft < 1) return `${minutesLeft}m left`;
    return `${hoursLeft}h ${minutesLeft}m left`;
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('model_generations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error deleting image',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setImages(images.filter(img => img.id !== id));
      toast({
        title: 'Image deleted',
        description: 'The image has been removed from your gallery.',
      });
    }
  };

  const handleDownload = async (imageUrl: string, customName: string | null, id: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = customName ? customName.replace(/\s+/g, '-').toLowerCase() : `utsuri-model-${id}`;
      a.download = `${fileName}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Could not download the image.',
        variant: 'destructive',
      });
    }
  };

  const handleCategoryChange = async (id: string, category: Category) => {
    const { error } = await supabase
      .from('model_generations')
      .update({ category })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error updating category',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setImages(images.map(img => img.id === id ? { ...img, category } : img));
      toast({ title: 'Category updated' });
    }
  };

  const handleNameEdit = (id: string, currentName: string | null) => {
    setEditingId(id);
    setEditName(currentName || '');
  };

  const handleNameSave = async (id: string) => {
    const { error } = await supabase
      .from('model_generations')
      .update({ custom_name: editName || null })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error updating name',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setImages(images.map(img => img.id === id ? { ...img, custom_name: editName || null } : img));
      setEditingId(null);
      toast({ title: 'Name updated' });
    }
  };

  // handleSignOut moved to ProfileDropdown component

  const displayName = profile?.first_name || user?.email?.split('@')[0] || 'there';

  const filteredImages = activeCategory === 'All' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  const getCategoryCount = (category: Category | 'All') => {
    if (category === 'All') return images.length;
    return images.filter(img => img.category === category).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground italic">Utsuri</span>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            <Button
              onClick={() => navigate('/filter/gender')}
              className="btn-gold"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.newModel')}
            </Button>
            <LanguageSwitcher />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome + Plan Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, <span className="text-primary">{displayName}</span>!
            </h1>
            <p className="text-muted-foreground">
              Your generated images are stored for 24 hours. Download them before they expire.
            </p>
          </div>

          {/* Plan Card */}
          {!subscriptionLoading && subscription && (
            <div className="flex-shrink-0 bg-card border border-border rounded-xl p-4 min-w-[200px]">
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${getPlanBadgeStyles(subscription.plan)}`}>
                  {subscription.plan === 'creator' && <Crown className="h-3.5 w-3.5" />}
                  {subscription.plan === 'pro' && <Sparkles className="h-3.5 w-3.5" />}
                  {getPlanDisplayName(subscription.plan)}
                </div>
              </div>
              
              <div className="space-y-2">
                {subscription.plan === 'trial' ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Standard Gens</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        {subscription.standard_generations_remaining}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pro Gens</span>
                      <span className="font-medium text-foreground">{subscription.pro_generations_remaining}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Credits</span>
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      {subscription.credits_remaining}
                    </span>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/pricing')}
                className="w-full mt-3 text-xs"
              >
                {subscription.plan === 'trial' ? 'Upgrade Plan' : 'Manage Plan'}
              </Button>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeCategory === 'All' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('All')}
            className={activeCategory === 'All' ? 'btn-gold' : ''}
          >
            All ({getCategoryCount('All')})
          </Button>
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? 'btn-gold' : ''}
            >
              {cat} ({getCategoryCount(cat)})
            </Button>
          ))}
        </div>

        {loadingImages ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              {activeCategory === 'All' ? 'No images yet' : `No ${activeCategory} images`}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {activeCategory === 'All' 
                ? 'Start creating AI-generated fashion models for your products. Your images will appear here.'
                : `You haven't categorized any images as ${activeCategory} yet.`}
            </p>
            {activeCategory === 'All' && (
              <Button onClick={() => navigate('/filter/gender')} className="btn-gold">
                Create Your First Model
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative rounded-2xl overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/30"
              >
                {image.image_url ? (
                  <img
                    src={image.image_url}
                    alt={image.custom_name || `Generated ${image.gender} ${image.ethnicity} model`}
                    className="w-full aspect-[3/4] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground capitalize">{image.status}</span>
                  </div>
                )}
                
                {/* Image info overlay - always visible at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-12">
                  {/* Custom Name */}
                  <div className="mb-3">
                    {editingId === image.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Enter custom name..."
                          className="h-8 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          autoFocus
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-400/20"
                          onClick={() => handleNameSave(image.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/20"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center gap-2 cursor-pointer group/name"
                        onClick={() => handleNameEdit(image.id, image.custom_name)}
                      >
                        <span className="text-white font-medium truncate">
                          {image.custom_name || 'Untitled'}
                        </span>
                        <Pencil className="h-3.5 w-3.5 text-white/50 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>

                  {/* Category Select */}
                  <div className="mb-3">
                    <Select
                      value={image.category || ''}
                      onValueChange={(value) => handleCategoryChange(image.id, value as Category)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time remaining and actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-white/80 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{getTimeRemaining(image.created_at)}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {image.image_url && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDownload(image.image_url!, image.custom_name, image.id)}
                          className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(image.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Time badge - always visible at top */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="text-foreground">{getTimeRemaining(image.created_at)}</span>
                </div>

                {/* Category badge if set */}
                {image.category && (
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-xs text-primary-foreground font-medium">
                    {image.category}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
