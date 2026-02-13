/**
 * Downloads an image directly to the user's device.
 * Uses multiple strategies to ensure it works across all browsers.
 */
export async function downloadImage(imageUrl: string, fileName: string): Promise<boolean> {
  // Strategy 1: Try proxy edge function (bypasses CORS reliably)
  try {
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

    if (response.ok) {
      const blob = await response.blob();
      return triggerDownload(blob, fileName);
    }
  } catch (err) {
    console.warn('Proxy download failed:', err);
  }

  // Strategy 2: Try direct fetch with CORS
  try {
    const response = await fetch(imageUrl, { mode: 'cors', credentials: 'omit' });
    if (response.ok) {
      const blob = await response.blob();
      return triggerDownload(blob, fileName);
    }
  } catch (err) {
    console.warn('Direct fetch failed:', err);
  }

  // Strategy 3: Draw to canvas to bypass CORS (works for most image URLs)
  try {
    const blob = await loadImageViaCanvas(imageUrl);
    return triggerDownload(blob, fileName);
  } catch (err) {
    console.warn('Canvas download failed:', err);
  }

  // Last resort: open in new tab
  window.open(imageUrl, '_blank');
  return false;
}

function triggerDownload(blob: Blob, fileName: string): boolean {
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Clean up after a short delay
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  }, 200);
  return true;
}

function loadImageViaCanvas(url: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No canvas context')); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
}
