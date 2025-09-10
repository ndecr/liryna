import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import SimplePDFViewer from './SimplePDFViewer';

// Configuration du worker local pour éviter les problèmes CSP
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, fileName }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [pdfData, setPdfData] = useState<string | ArrayBuffer | null>(null);
  const [useFallback, setUseFallback] = useState<boolean>(false);

  // Debug: Log l'URL du PDF
  console.log('PDFViewer - pdfUrl:', pdfUrl);
  console.log('PDFViewer - fileName:', fileName);

  // Convertir le blob URL en ArrayBuffer pour éviter les problèmes CSP
  useEffect(() => {
    const loadPdfData = async () => {
      if (pdfUrl.startsWith('blob:')) {
        try {
          setLoading(true);
          setError('');
          setUseFallback(false);
          const response = await fetch(pdfUrl);
          const arrayBuffer = await response.arrayBuffer();
          setPdfData(arrayBuffer);
        } catch (err) {
          console.error('Erreur lors du chargement du blob PDF:', err);
          setUseFallback(true);
          setLoading(false);
        }
      } else {
        setPdfData(pdfUrl);
        setUseFallback(false);
      }
    };

    loadPdfData();
  }, [pdfUrl]);
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', numPages, 'pages');
    setNumPages(numPages);
    setLoading(false);
    setError('');
  };

  const onDocumentLoadError = (error: any) => {
    console.error('Error loading PDF:', error);
    console.log('Basculement vers le viewer fallback');
    setUseFallback(true);
    setLoading(false);
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };


  // Si fallback activé, utiliser le viewer simple
  if (useFallback) {
    return <SimplePDFViewer pdfUrl={pdfUrl} fileName={fileName} />;
  }

  if (loading || !pdfData) {
    return (
      <div className="pdf-viewer-loading">
        <p>Chargement du PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-viewer-error">
        <p>{error}</p>
        <p>Tentative avec le viewer alternatif...</p>
        <button onClick={() => setUseFallback(true)} className="retry-btn">
          Réessayer avec viewer simple
        </button>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      {numPages && numPages > 1 && (
        <div className="pdf-controls">
          <button 
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="pdf-nav-btn"
          >
            ‹ Précédent
          </button>
          <span className="pdf-page-info">
            Page {pageNumber} sur {numPages}
          </span>
          <button 
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="pdf-nav-btn"
          >
            Suivant ›
          </button>
        </div>
      )}
      
      <div className="pdf-document-container">
        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="pdf-viewer-loading">Chargement du PDF...</div>}
          options={{
            cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
          }}
        >
          <Page 
            pageNumber={pageNumber}
            className="pdf-page"
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={Math.min(window.innerWidth - 40, 800)}
          />
        </Document>
      </div>

      <div className="pdf-actions">
        <a 
          href={pdfUrl} 
          download={fileName}
          className="pdf-download-link"
        >
          💾 Télécharger
        </a>
      </div>
    </div>
  );
};

export default PDFViewer;