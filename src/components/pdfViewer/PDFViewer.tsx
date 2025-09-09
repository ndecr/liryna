import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configuration du worker pour react-pdf via CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, fileName }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Debug: Log l'URL du PDF
  console.log('PDFViewer - pdfUrl:', pdfUrl);
  console.log('PDFViewer - fileName:', fileName);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', numPages, 'pages');
    setNumPages(numPages);
    setLoading(false);
    setError('');
  };

  const onDocumentLoadError = (error: any) => {
    console.error('Error loading PDF:', error);
    console.error('PDF URL:', pdfUrl);
    console.error('Error details:', JSON.stringify(error, null, 2));
    setError('Impossible de charger le PDF');
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

  if (loading) {
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
        <a 
          href={pdfUrl} 
          download={fileName}
          className="pdf-download-link"
        >
          📄 Télécharger le PDF
        </a>
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
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="pdf-viewer-loading">Chargement du PDF...</div>}
          error={<div className="pdf-viewer-error">Erreur de chargement du PDF</div>}
        >
          <Page 
            pageNumber={pageNumber}
            className="pdf-page"
            renderTextLayer={false}
            renderAnnotationLayer={false}
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