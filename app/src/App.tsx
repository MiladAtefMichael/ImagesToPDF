import { Suspense, lazy, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePDFGenerator } from './hooks/usePDFGenerator';
import Header from './components/Header';
import Footer from './components/Footer';
import UploadZone from './components/UploadZone';
import ImageQueue from './components/ImageQueue';
import Processing from './components/Processing';
import PDFPreview from './components/PDFPreview';
import Success from './components/Success';

const Scene3D = lazy(() => import('./components/Scene3D'));

function BackgroundFallback() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Soft blue gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] animate-float" />
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-green-200/30 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[-10%] left-[30%] w-[450px] h-[450px] bg-blue-100/50 rounded-full blur-[100px] animate-float" style={{ animationDelay: '4s' }} />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
    </div>
  );
}

export default function App() {
  const {
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
  } = usePDFGenerator();

  const handleGlobalDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (appState === 'upload' || appState === 'queue') {
      setIsDragging(true);
    }
  }, [appState, setIsDragging]);

  const handleGlobalDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.relatedTarget) {
      setIsDragging(false);
    }
  }, [setIsDragging]);

  const handleGlobalDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (appState === 'upload' || appState === 'queue') {
        addImages(e.dataTransfer.files);
      }
    }
  }, [appState, addImages, setIsDragging]);

  return (
    <div
      className="relative min-h-screen w-full bg-[#F0F7FF] flex flex-col"
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
    >
      {/* 3D Background */}
      <Suspense fallback={<BackgroundFallback />}>
        <Scene3D images={images} appState={appState} />
      </Suspense>

      {/* Drag overlay */}
      <motion.div
        animate={{ opacity: isDragging ? 0.4 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-10 bg-blue-600 pointer-events-none"
      />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 relative z-20 flex flex-col">
        <AnimatePresence mode="wait">
          {appState === 'upload' && (
            <UploadZone
              key="upload"
              onUpload={addImages}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
            />
          )}

          {appState === 'queue' && (
            <ImageQueue
              key="queue"
              images={images}
              onRemove={removeImage}
              onReorder={reorderImages}
              onCreatePDF={createPDF}
              onClearAll={clearAll}
            />
          )}

          {appState === 'processing' && (
            <Processing
              key="processing"
              progress={progress}
              totalImages={images.length}
            />
          )}

          {appState === 'preview' && pdfBlob && (
            <PDFPreview
              key="preview"
              pdfBlob={pdfBlob}
              onDownload={downloadPDF}
              onConvertAnother={resetToUpload}
            />
          )}

          {appState === 'success' && (
            <Success
              key="success"
              onDownload={downloadPDF}
              onConvertAnother={resetToUpload}
              imageCount={images.length}
            />
          )}
        </AnimatePresence>

        {/* Drag overlay indicator */}
        <AnimatePresence>
          {isDragging && appState === 'upload' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="bg-white/95 backdrop-blur-xl rounded-3xl px-12 py-8 shadow-2xl border border-blue-100"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="font-display text-lg font-semibold text-blue-900">
                    Release to Upload
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
