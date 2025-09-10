import React, { useState, useEffect } from 'react';

interface SimplePDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ pdfUrl, fileName }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Petit délai pour simuler le chargement
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pdfUrl]);

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
        <p>Utilisez le bouton télécharger pour accéder au fichier</p>
      </div>
    );
  }

  return (
    <div className="simple-pdf-viewer">
      <div className="pdf-iframe-container">
        <iframe
          src={pdfUrl}
          width="100%"
          height="600px"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
          title={`Prévisualisation PDF: ${fileName}`}
          onLoad={() => setError('')}
          onError={() => setError('Erreur de chargement')}
        />
      </div>
    </div>
  );
};

export default SimplePDFViewer;