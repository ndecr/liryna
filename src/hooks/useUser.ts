import { useContext } from "react";
import { UserContext } from "../context/user/UserContext.tsx";

export const useUser = () => {
  return useContext(UserContext);
};
