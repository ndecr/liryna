// styles
import "./avatarCropModal.scss";
import "react-image-crop/dist/ReactCrop.css";

// hooks | libraries
import { ReactElement, useRef, useState, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import { MdCheck, MdClose } from "react-icons/md";

// components
import Button from "../button/Button.tsx";

interface IAvatarCropModalProps {
  imageUrl: string;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}

const DEFAULT_CROP: Crop = { unit: "%", x: 10, y: 10, width: 80, height: 80 };

export default function AvatarCropModal({
  imageUrl,
  onConfirm,
  onCancel,
}: IAvatarCropModalProps): ReactElement {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>(DEFAULT_CROP);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((pixelCrop: PixelCrop) => {
    if (pixelCrop.width > 0 && pixelCrop.height > 0) {
      setCompletedCrop(pixelCrop);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    const img = imgRef.current;
    if (!img || !completedCrop) return;

    setIsProcessing(true);

    const canvas = document.createElement("canvas");
    const size = Math.min(completedCrop.width, completedCrop.height);
    const outputSize = Math.min(size, 512); // max 512px
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize,
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
          onConfirm(file);
        }
        setIsProcessing(false);
      },
      "image/jpeg",
      0.92,
    );
  }, [completedCrop, onConfirm]);

  return (
    <div className="avatarCropOverlay" onClick={onCancel}>
      <div className="avatarCropModal" onClick={(e) => e.stopPropagation()}>
        <div className="avatarCropHeader">
          <h3 className="avatarCropTitle">Recadrer la photo</h3>
          <button type="button" className="avatarCropClose" onClick={onCancel} aria-label="Fermer">
            <MdClose />
          </button>
        </div>

        <div className="avatarCropBody">
          <p className="avatarCropHint">Sélectionnez la zone à utiliser comme avatar.</p>
          <div className="avatarCropWrapper">
            <ReactCrop
              crop={crop}
              onChange={(px) => setCrop(px)}
              onComplete={handleCropComplete}
              aspect={1}
              circularCrop
              keepSelection
              minWidth={40}
              minHeight={40}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Aperçu"
                className="avatarCropImage"
                draggable={false}
              />
            </ReactCrop>
          </div>
        </div>

        <div className="avatarCropFooter">
          <Button style="grey" type="button" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            style="green"
            type="button"
            onClick={handleConfirm}
            disabled={!completedCrop || isProcessing}
          >
            <MdCheck />
            {isProcessing ? "Traitement..." : "Valider"}
          </Button>
        </div>
      </div>
    </div>
  );
}
