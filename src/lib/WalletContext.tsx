import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  voterId: string | null;
  setVoterId: (id: string | null) => void;
  isConnected: boolean;
  connect: (id: string) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [voterId, setVoterId] = useState<string | null>(() => {
    return localStorage.getItem("voterId");
  });

  const isConnected = !!voterId;

  const connect = (id: string) => {
    setVoterId(id);
    localStorage.setItem("voterId", id);
  };

  const disconnect = () => {
    setVoterId(null);
    localStorage.removeItem("voterId");
  };

  return (
    <WalletContext.Provider value={{ voterId, setVoterId, isConnected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
