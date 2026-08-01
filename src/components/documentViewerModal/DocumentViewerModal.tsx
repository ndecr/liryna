import type { ReactElement } from 'react';

import Modal from '../modal/Modal.tsx';
import ModernPDFViewer from '../pdfViewer/ModernPDFViewer.tsx';
import { DocumentImageViewer } from './DocumentImageViewer.tsx';

export interface DocumentViewerModalProps {
  fileName: string;
  fileType: 'image' | 'pdf';
  fileUrl: string;
  isVisible: boolean;
  onClose: () => void;
}

export function DocumentViewerModal({
  fileName,
  fileType,
  fileUrl,
  isVisible,
  onClose,
}: DocumentViewerModalProps): ReactElement {
  const resolvedFileName = fileName || (
    fileType === 'pdf' ? 'document.pdf' : 'image'
  );

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      title={resolvedFileName}
      variant="document"
    >
      {fileType === 'pdf' ? (
        <ModernPDFViewer
          fileName={resolvedFileName}
          pdfUrl={fileUrl}
        />
      ) : (
        <DocumentImageViewer
          fileName={resolvedFileName}
          imageUrl={fileUrl}
        />
      )}
    </Modal>
  );
}
