import { ReactElement } from "react";
import { ProgrammeGuitareProvider } from "../programmeGuitare/ProgrammeGuitareProvider.tsx";

export const RhythmGuitareProvider = ({ children }: { children: ReactElement }): ReactElement => (
  <ProgrammeGuitareProvider moduleSlug="rhythm-guitar-progression">
    {children}
  </ProgrammeGuitareProvider>
);
