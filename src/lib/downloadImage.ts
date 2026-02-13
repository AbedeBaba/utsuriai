import { supabase } from "@/integrations/supabase/client";

/**
 * Downloads an image by proxying it through an edge function to bypass CORS.
 * Falls back to opening in a new tab if proxy also fails.
 */
export async function downloadImage(imageUrl: string, fileName: string): Promise<boolean> {
  try {
    // Call proxy edge function with raw fetch to get binary response properly
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/proxy-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify({ url: imageUrl }),
    });

    if (!response.ok) throw new Error(`Proxy returned ${response.status}`);

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
    return true;
  } catch (err) {
    console.warn('Proxy download failed, opening in new tab:', err);
    window.open(imageUrl, '_blank');
    return false;
  }
}
