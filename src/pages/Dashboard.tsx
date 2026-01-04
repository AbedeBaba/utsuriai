import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Clock, Trash2, Download, LogOut, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, differenceInHours, addHours } from 'date-fns';

interface GeneratedImage {
  id: string;
  image_url: string | null;
  created_at: string;
  gender: string;
  ethnicity: string;
  status: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchImages();
    }
  }, [user]);

  const fetchImages = async () => {
    setLoadingImages(true);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('model_generations')
      .select('id, image_url, created_at, gender, ethnicity, status')
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
      setImages(data || []);
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

  const handleDownload = async (imageUrl: string, id: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `utsuri-model-${id}.png`;
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.first_name || user?.email?.split('@')[0] || 'there';

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
            <Button
              onClick={() => navigate('/filter/gender')}
              className="btn-gold"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Model
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, <span className="text-primary">{displayName}</span>!
          </h1>
          <p className="text-muted-foreground">
            Your generated images are stored for 24 hours. Download them before they expire.
          </p>
        </div>

        {loadingImages ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">No images yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start creating AI-generated fashion models for your products. Your images will appear here.
            </p>
            <Button onClick={() => navigate('/filter/gender')} className="btn-gold">
              Create Your First Model
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative rounded-2xl overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/30"
              >
                {image.image_url ? (
                  <img
                    src={image.image_url}
                    alt={`Generated ${image.gender} ${image.ethnicity} model`}
                    className="w-full aspect-[3/4] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground capitalize">{image.status}</span>
                  </div>
                )}
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeRemaining(image.created_at)}</span>
                    </div>
                    <div className="flex gap-2">
                      {image.image_url && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(image.image_url!, image.id)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Time badge - always visible */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="text-foreground">{getTimeRemaining(image.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}