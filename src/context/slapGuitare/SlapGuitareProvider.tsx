import { ReactElement } from "react";
import { ProgrammeGuitareProvider } from "../programmeGuitare/ProgrammeGuitareProvider.tsx";

export const SlapGuitareProvider = ({ children }: { children: ReactElement }): ReactElement => (
  <ProgrammeGuitareProvider moduleSlug="slap-guitar-progression">
    {children}
  </ProgrammeGuitareProvider>
);
