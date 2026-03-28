import { useContext } from "react";
import { ProgrammeGuitareContext } from "../context/programmeGuitare/ProgrammeGuitareContext.tsx";

export const useProgrammeGuitare = () => {
  return useContext(ProgrammeGuitareContext);
};
