import { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';

export interface QueuedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  dimensions?: { width: number; height: number };
}

export type AppState = 'upload' | 'queue' | 'processing' | 'preview' | 'success';

// Convert a File to a base64 data URL so jsPDF can always embed it,
// even after the blob URL has been revoked or the page reloads.
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataURL: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Ensure dimensions are valid
      const width = img.width || 800;
      const height = img.height || 600;
      resolve({ width: Math.max(1, width), height: Math.max(1, height) });
    };
    img.onerror = () => resolve({ width: 800, height: 600 });
    img.src = dataURL;
  });
}

// Detect image format from data URL mime type so jsPDF uses the right codec.
function getImageFormat(dataURL: string): string {
  const mime = dataURL.split(';')[0].split(':')[1] ?? '';
  if (mime === 'image/png') return 'PNG';
  if (mime === 'image/webp') return 'WEBP';
  if (mime === 'image/gif') return 'GIF';
  return 'JPEG'; // default fallback for jpg / unknown
}

export function usePDFGenerator() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [images, setImages] = useState<QueuedImage[]>([]);
  const [progress, setProgress] = useState(0);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addImages = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );
    if (imageFiles.length === 0) return;

    const newImages: QueuedImage[] = [];

    for (const file of imageFiles) {
      // Use a data URL for preview so it stays valid across the session
      const dataURL = await fileToDataURL(file);
      const dimensions = await getImageDimensions(dataURL);
      newImages.push({
        id: generateId(),
        file,
        preview: dataURL,   // data URL — never expires
        name: file.name,
        size: file.size,
        dimensions,
      });
    }

    setImages(prev => [...prev, ...newImages]);
    setAppState('queue');
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      if (filtered.length === 0) {
        setAppState('upload');
      }
      return filtered;
    });
  }, []);

  const clearAll = useCallback(() => {
    setImages([]);
    setPdfBlob(null);
    setAppState('upload');
  }, []);

  const reorderImages = useCallback((newOrder: QueuedImage[]) => {
    setImages(newOrder);
  }, []);

  const createPDF = useCallback(async () => {
    if (images.length === 0) return;

    setAppState('processing');
    setProgress(0);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        if (i > 0) {
          pdf.addPage();
        }

        // Use preview (data URL) directly — guaranteed to be valid
        const dataURL = img.preview;
        const format = getImageFormat(dataURL);

        // Calculate dimensions to fit page with margins
        const availableWidth = pageWidth - 2 * margin;
        const availableHeight = pageHeight - 2 * margin;

        let imgWidth = availableWidth;
        let imgHeight = availableHeight;

        // Ensure dimensions exist and are valid before using them
        if (img.dimensions && img.dimensions.width > 0 && img.dimensions.height > 0) {
          const aspectRatio = img.dimensions.width / img.dimensions.height;
          const pageAspectRatio = availableWidth / availableHeight;

          if (aspectRatio > pageAspectRatio) {
            // Image is wider — fit to width
            imgHeight = imgWidth / aspectRatio;
          } else {
            // Image is taller — fit to height
            imgWidth = imgHeight * aspectRatio;
          }
        } else {
          // Fallback: use a default portrait aspect ratio
          imgHeight = imgWidth / (8.5 / 11);
          if (imgHeight > availableHeight) {
            imgHeight = availableHeight;
            imgWidth = imgHeight * (8.5 / 11);
          }
        }

        const x = margin + (availableWidth - imgWidth) / 2;
        const y = margin + (availableHeight - imgHeight) / 2;

        // Add image — use correct format so jsPDF doesn't reject it
        pdf.addImage(dataURL, format, x, y, imgWidth, imgHeight);

        setProgress(((i + 1) / images.length) * 100);

        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const blob = pdf.output('blob');
      setPdfBlob(blob);
      setAppState('preview');
    } catch (error) {
      console.error('Error creating PDF:', error);
      setAppState('queue');
    }
  }, [images]);

  const downloadPDF = useCallback(() => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [pdfBlob]);

  const resetToUpload = useCallback(() => {
    setImages([]);
    setPdfBlob(null);
    setProgress(0);
    setAppState('upload');
  }, []);

  return {
    appState,
    images,
    progress,
    isDragging,
    setIsDragging,
    addImages,
    removeImage,
    clearAll,
    reorderImages,
    createPDF,
    downloadPDF,
    resetToUpload,
    pdfBlob,
  };
}
