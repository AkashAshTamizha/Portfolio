import { createContext } from "react";

export const ProfileContext = createContext({ profile: null, loading: true, hasProfile: false });
