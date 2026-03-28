import { useContext } from "react";
import { PretImmobilierContext } from "../context/pretImmobilier/PretImmobilierContext.tsx";

export const usePretImmobilier = () => {
  return useContext(PretImmobilierContext);
};
