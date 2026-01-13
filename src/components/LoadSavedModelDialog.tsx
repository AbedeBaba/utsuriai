import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FolderOpen, Trash2, User, Loader2 } from 'lucide-react';
import { useSavedModels, SavedModel } from '@/hooks/useSavedModels';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface LoadSavedModelDialogProps {
  onSelect: (model: SavedModel) => void;
  trigger?: React.ReactNode;
}

export function LoadSavedModelDialog({ onSelect, trigger }: LoadSavedModelDialogProps) {
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { savedModels, loading, deleteModel } = useSavedModels();

  const handleSelect = (model: SavedModel) => {
    onSelect(model);
    setOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    await deleteModel(id);
    setDeletingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
            <FolderOpen className="h-4 w-4" />
            Load Saved Model
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Load Saved Model</DialogTitle>
          <DialogDescription>
            Select a previously saved model to use as the base for your new generation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : savedModels.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No saved models yet.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Save a model after configuring it to reuse it later.
              </p>
            </div>
          ) : (
            savedModels.map((model) => (
              <div
                key={model.id}
                onClick={() => handleSelect(model)}
                className={cn(
                  "group relative p-4 rounded-xl border border-border bg-card cursor-pointer",
                  "hover:border-primary/50 hover:bg-primary/5 transition-all duration-200",
                  "hover:shadow-md"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{model.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {model.gender} • {model.ethnicity} • {model.body_type}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Saved {formatDistanceToNow(new Date(model.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(e, model.id)}
                    disabled={deletingId === model.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {deletingId === model.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Quick preview of attributes */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {model.hair_color && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {model.hair_color} hair
                    </span>
                  )}
                  {model.eye_color && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {model.eye_color} eyes
                    </span>
                  )}
                  {model.modest_option && model.modest_option !== 'Standard' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {model.modest_option}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
