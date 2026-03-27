import { ReactElement } from "react";
import { ProgrammeGuitareProvider } from "../programmeGuitare/ProgrammeGuitareProvider.tsx";

export const MetalGuitareProvider = ({ children }: { children: ReactElement }): ReactElement => (
  <ProgrammeGuitareProvider moduleSlug="metal-guitar-progression">
    {children}
  </ProgrammeGuitareProvider>
);
