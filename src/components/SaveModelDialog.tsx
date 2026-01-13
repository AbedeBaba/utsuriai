import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Save, Loader2 } from 'lucide-react';
import { ModelConfig } from '@/context/ModelConfigContext';
import { useSavedModels } from '@/hooks/useSavedModels';

interface SaveModelDialogProps {
  config: ModelConfig;
  trigger?: React.ReactNode;
}

export function SaveModelDialog({ config, trigger }: SaveModelDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const { saveModel, saving } = useSavedModels();

  const handleSave = async () => {
    const success = await saveModel(config, name);
    if (success) {
      setName('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Save Model
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Model Configuration</DialogTitle>
          <DialogDescription>
            Save this model to reuse it in future generations. Creator plan exclusive feature.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="model-name" className="text-sm font-medium text-foreground">
              Model Name
            </label>
            <Input
              id="model-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Summer Collection Model"
              className="w-full"
              autoFocus
            />
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
            <p className="text-muted-foreground font-medium mb-2">Model attributes:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-muted-foreground">Gender:</span>
              <span className="text-foreground">{config.gender}</span>
              <span className="text-muted-foreground">Ethnicity:</span>
              <span className="text-foreground">{config.ethnicity}</span>
              <span className="text-muted-foreground">Body Type:</span>
              <span className="text-foreground">{config.bodyType}</span>
              {config.hairColor && (
                <>
                  <span className="text-muted-foreground">Hair Color:</span>
                  <span className="text-foreground">{config.hairColor}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Model
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
