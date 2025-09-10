import React, { useState, useEffect } from 'react';

interface SimplePDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ pdfUrl, fileName }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [iframeSrc, setIframeSrc] = useState<string>('');

  useEffect(() => {
    // Utiliser iframe avec authentification
    setIframeSrc(pdfUrl);
    setLoading(false);
  }, [pdfUrl]);

  const handleIframeLoad = () => {
    setLoading(false);
    setError('');
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Impossible de charger le PDF');
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
        <p>Erreur lors du chargement du PDF</p>
        <p>Le fichier sera ouvert dans un nouvel onglet</p>
        <button 
          onClick={() => window.open(pdfUrl, '_blank')}
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Ouvrir dans un nouvel onglet
        </button>
      </div>
    );
  }

  return (
    <div className="simple-pdf-viewer">
      <div className="pdf-iframe-container" style={{ height: '80vh', minHeight: '600px' }}>
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            minHeight: '600px',
          }}
          title={`Prévisualisation PDF: ${fileName}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
    </div>
  );
};

export default SimplePDFViewer;