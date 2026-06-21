import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFPreviewProps {
  pdfBlob: Blob;
  onDownload: () => void;
  onConvertAnother: () => void;
}

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PDFPreview({ pdfBlob, onDownload, onConvertAnother }: PDFPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1);
  const [pdf, setPdf] = useState<any>(null);

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      try {
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const loadedPdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        setPdf(loadedPdf);
        setTotalPages(loadedPdf.numPages);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPDF();
  }, [pdfBlob]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
      } catch (error) {
        console.error('Error rendering page:', error);
      }
    };

    renderPage();
  }, [pdf, currentPage, scale]);

  const handleFitAll = () => {
    if (!containerRef.current || !canvasRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth - 32; // account for padding
    const containerHeight = containerRef.current.clientHeight - 120; // account for controls
    
    if (canvasRef.current.width > 0 && canvasRef.current.height > 0) {
      const scaleX = containerWidth / canvasRef.current.width;
      const scaleY = containerHeight / canvasRef.current.height;
      setScale(Math.min(scaleX, scaleY, 2)); // max 2x zoom
    }
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => setScale(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col items-center justify-center px-6 py-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-4xl h-full flex flex-col bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-blue-100 overflow-hidden"
      >
        {/* Header with title */}
        <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="font-display text-2xl font-semibold text-blue-900">PDF Preview</h2>
          <p className="text-slate-400 text-sm mt-1">
            Page {currentPage} of {totalPages}
          </p>
        </div>

        {/* Preview Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto flex items-center justify-center bg-slate-50 relative"
        >
          <canvas
            ref={canvasRef}
            className="shadow-lg rounded-lg bg-white"
          />
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-t border-blue-100 bg-white space-y-4">
          {/* Zoom and Size Controls */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium transition-colors"
            >
              <ZoomOut size={16} />
              Zoom Out
            </motion.button>

            <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-600 text-sm font-medium">
              {(scale * 100).toFixed(0)}%
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium transition-colors"
            >
              <ZoomIn size={16} />
              Zoom In
            </motion.button>

            <div className="w-px h-6 bg-blue-200" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFitAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-sm font-medium transition-colors"
            >
              <Maximize size={16} />
              Fit All
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
            >
              <RotateCcw size={16} />
              Reset
            </motion.button>
          </div>

          {/* Page Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 text-sm font-medium transition-colors"
              >
                Previous
              </motion.button>

              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = Math.min(Math.max(parseInt(e.target.value) || 1, 1), totalPages);
                  setCurrentPage(page);
                }}
                className="w-16 px-2 py-2 border border-blue-200 rounded-lg text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 text-sm font-medium transition-colors"
              >
                Next
              </motion.button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDownload}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Download size={18} />
              <span>Download PDF</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConvertAnother}
              className="flex-1 px-6 py-3 text-slate-400 hover:text-blue-600 rounded-xl font-medium text-sm
                         hover:bg-blue-50 transition-all duration-300 border border-blue-100"
            >
              Convert Another
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
