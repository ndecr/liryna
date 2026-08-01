import ModernPDFViewer from './ModernPDFViewer.tsx';

export interface PDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const PDFViewer = ({ pdfUrl, fileName }: PDFViewerProps) => (
  <ModernPDFViewer pdfUrl={pdfUrl} fileName={fileName} />
);

export default PDFViewer;