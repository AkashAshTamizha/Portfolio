import { useContext } from "react";
import { ProfileContext } from "../context/profile-context";

export function useProfile() {
  return useContext(ProfileContext);
}
