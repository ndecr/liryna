import { IUser, IVisibleSections } from "../../utils/types/user.types";

const DEFAULT_VISIBLE_SECTIONS: IVisibleSections = { mail: true, budget: true, musique: true };

export const userModel = (fetchedUser: IUser): IUser => {
  return {
    id: fetchedUser.id,
    email: fetchedUser.email,
    firstName: fetchedUser.firstName,
    lastName: fetchedUser.lastName,
    avatarUrl: fetchedUser.avatarUrl ?? null,
    visibleSections: fetchedUser.visibleSections ?? DEFAULT_VISIBLE_SECTIONS,
  };
};
