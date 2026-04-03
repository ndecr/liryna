import { useContext } from "react";
import { MusicDocumentContext } from "../context/musicDocument/MusicDocumentContext.tsx";

export const useMusicDocument = () => {
  return useContext(MusicDocumentContext);
};
