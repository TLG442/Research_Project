import React, { createContext, useState, useContext } from "react";

// 1️⃣ Define the shape of your context (optional if you're using TS babe)
type AppContextType = {
  calibratedRooms: any[]; // Replace 'any' with the actual type of your rooms
  setCalibratedRooms: React.Dispatch<React.SetStateAction<any[]>>;
};

// 2️⃣ Create the actual context
const AppContext = createContext<AppContextType | undefined>(undefined);

// 3️⃣ Create a provider component
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [calibratedRooms, setCalibratedRooms] = useState<any[]>([]); // Initialize with an empty array

  return (
    <AppContext.Provider value={{ calibratedRooms, setCalibratedRooms }}>
      {children}
    </AppContext.Provider>
  );
};

// 4️⃣ Custom hook for easier use
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
