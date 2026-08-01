import ModernPDFViewer from './ModernPDFViewer.tsx';

interface SimplePDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ pdfUrl, fileName }) => (
  <ModernPDFViewer pdfUrl={pdfUrl} fileName={fileName} />
);

export default SimplePDFViewer;