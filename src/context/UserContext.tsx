"use client";

import { createContext, useState, ReactNode, useContext } from "react";

type UserRole = "guest" | "user";

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType>({
  role: "guest",
  setRole: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>("guest");

  return (
    <UserContext.Provider value={{ role, setRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
