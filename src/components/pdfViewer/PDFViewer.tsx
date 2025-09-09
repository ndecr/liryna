import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configuration du worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, fileName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Calcul de l'échelle pour s'adapter à la largeur du container
      const containerWidth = canvas.parentElement?.clientWidth || 800;
      const viewport = page.getViewport({ scale: 1 });
      const scale = (containerWidth - 40) / viewport.width; // 40px de marge

      const scaledViewport = page.getViewport({ scale });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: scaledViewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Erreur lors du rendu de la page');
    }
  };

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError('');

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);

        // Rendre la première page
        await renderPage(1);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Impossible de charger le PDF');
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfDoc && currentPage > 0) {
      renderPage(currentPage);
    }
  }, [currentPage, pdfDoc]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
      {totalPages > 1 && (
        <div className="pdf-controls">
          <button 
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="pdf-nav-btn"
          >
            ‹ Précédent
          </button>
          <span className="pdf-page-info">
            Page {currentPage} sur {totalPages}
          </span>
          <button 
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="pdf-nav-btn"
          >
            Suivant ›
          </button>
        </div>
      )}
      
      <div className="pdf-canvas-container">
        <canvas 
          ref={canvasRef}
          className="pdf-canvas"
        />
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