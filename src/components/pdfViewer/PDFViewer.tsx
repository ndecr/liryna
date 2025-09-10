import React from 'react';
import SimplePDFViewer from './SimplePDFViewer';

interface PDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, fileName }) => {
  // Utiliser uniquement le SimplePDFViewer qui fonctionne mieux avec les URLs signées
  // et évite les problèmes de CSP avec react-pdf
  return <SimplePDFViewer pdfUrl={pdfUrl} fileName={fileName} />;
};

export default PDFViewer;