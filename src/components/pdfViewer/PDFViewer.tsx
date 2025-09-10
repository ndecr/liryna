import React, { useState } from 'react';

interface PDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, fileName }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Debug: Log l'URL du PDF
  console.log('PDFViewer - pdfUrl:', pdfUrl);
  console.log('PDFViewer - fileName:', fileName);
  
  const handleLoad = () => {
    console.log('PDF loaded successfully');
    setLoading(false);
  };
  
  const handleError = () => {
    console.log('PDF failed to load');
    setLoading(false);
    setError(true);
  };


  if (error) {
    return (
      <div className="pdf-viewer-error">
        <p>Le PDF ne peut pas être affiché dans le navigateur.</p>
        <div className="pdf-actions">
          <a 
            href={pdfUrl} 
            download={fileName}
            className="pdf-download-link"
          >
            📄 Télécharger le PDF
          </a>
          <button 
            onClick={() => window.open(pdfUrl, '_blank')}
            className="pdf-download-link"
            style={{marginLeft: '1em', cursor: 'pointer', border: 'none'}}
          >
            🔗 Ouvrir dans un nouvel onglet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      {loading && (
        <div className="pdf-viewer-loading">
          <p>Chargement du PDF...</p>
        </div>
      )}
      
      <div className="pdf-document-container">
        <embed
          src={pdfUrl}
          type="application/pdf"
          width="100%"
          height="600px"
          onLoad={handleLoad}
          onError={handleError}
          style={{ display: loading ? 'none' : 'block' }}
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
        <button 
          onClick={() => window.open(pdfUrl, '_blank')}
          className="pdf-download-link"
          style={{marginLeft: '1em', cursor: 'pointer', border: 'none'}}
        >
          🔗 Ouvrir dans un nouvel onglet
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;