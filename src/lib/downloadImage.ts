import { supabase } from "@/integrations/supabase/client";

/**
 * Downloads an image by proxying it through an edge function to bypass CORS.
 * Falls back to opening in a new tab if proxy also fails.
 */
export async function downloadImage(imageUrl: string, fileName: string): Promise<boolean> {
  try {
    // Use the proxy edge function to fetch the image server-side
    const { data, error } = await supabase.functions.invoke('proxy-image', {
      body: { url: imageUrl },
    });

    if (error) throw error;

    // data is already an ArrayBuffer/Blob from the edge function
    const blob = data instanceof Blob ? data : new Blob([data]);
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
    console.warn('Proxy download failed, trying direct fetch:', err);
  }

  // Fallback: try direct fetch
  try {
    const response = await fetch(imageUrl, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
    console.warn('Direct fetch failed, opening in new tab:', err);
    window.open(imageUrl, '_blank');
    return false;
  }
}
