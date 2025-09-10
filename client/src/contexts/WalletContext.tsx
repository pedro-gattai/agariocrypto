import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export interface WalletAdapter {
  name: string;
  icon: string;
  readyState: 'Installed' | 'NotDetected' | 'Loadable' | 'Unsupported';
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction?(transaction: any): Promise<any>;
  signAllTransactions?(transactions: any[]): Promise<any[]>;
  signMessage?(message: Uint8Array): Promise<Uint8Array>;
}

interface WalletContextType {
  wallet: WalletAdapter | null;
  wallets: WalletAdapter[];
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  balance: number;
  
  // Actions
  select: (walletName: string) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (recipient: string, amount: number) => Promise<string>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
  cluster?: 'devnet' | 'testnet' | 'mainnet-beta';
}

// Mock wallet adapters for demo purposes
const createMockWallet = (name: string, icon: string, installed: boolean = true): WalletAdapter => ({
  name,
  icon,
  readyState: installed ? 'Installed' : 'NotDetected',
  publicKey: null,
  connected: false,
  connecting: false,
  connect: async function() {
    this.connecting = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.publicKey = generateMockPublicKey();
    this.connected = true;
    this.connecting = false;
    console.log(`${name} wallet connected:`, this.publicKey);
  },
  disconnect: async function() {
    this.publicKey = null;
    this.connected = false;
    console.log(`${name} wallet disconnected`);
  },
  signTransaction: async (transaction) => {
    console.log(`${name} signing transaction:`, transaction);
    return transaction;
  },
  signMessage: async (message) => {
    console.log(`${name} signing message:`, message);
    return message;
  }
});

const generateMockPublicKey = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const MOCK_WALLETS = [
  createMockWallet('Phantom', '🟪'),
  createMockWallet('Solflare', '🟠'),
  createMockWallet('Backpack', '⚫'),
  createMockWallet('Glow', '🟡'),
  createMockWallet('Slope', '🔵', false), // Not installed
];

export const WalletProvider: React.FC<WalletProviderProps> = ({ 
  children, 
  autoConnect = false,
  cluster = 'devnet'
}) => {
  const [wallets] = useState<WalletAdapter[]>(MOCK_WALLETS);
  const [wallet, setWallet] = useState<WalletAdapter | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [balance, setBalance] = useState(0);

  const connected = wallet?.connected || false;
  const publicKey = wallet?.publicKey || null;

  useEffect(() => {
    // Auto-connect to previously used wallet
    if (autoConnect) {
      const savedWallet = localStorage.getItem('selectedWallet');
      if (savedWallet) {
        const foundWallet = wallets.find(w => w.name === savedWallet && w.readyState === 'Installed');
        if (foundWallet) {
          setWallet(foundWallet);
          // Auto-connect logic would go here in a real implementation
        }
      }
    }
  }, [autoConnect, wallets]);

  useEffect(() => {
    // Refresh balance when connected
    if (connected && publicKey) {
      refreshBalance();
      
      // Set up periodic balance updates
      const interval = setInterval(refreshBalance, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [connected, publicKey]);

  const select = (walletName: string) => {
    const selectedWallet = wallets.find(w => w.name === walletName);
    if (selectedWallet && selectedWallet.readyState === 'Installed') {
      setWallet(selectedWallet);
      localStorage.setItem('selectedWallet', walletName);
    }
  };

  const connect = async () => {
    if (!wallet || connecting) return;
    
    try {
      setConnecting(true);
      await wallet.connect();
      await refreshBalance();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!wallet || disconnecting) return;
    
    try {
      setDisconnecting(true);
      await wallet.disconnect();
      setBalance(0);
      localStorage.removeItem('selectedWallet');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    } finally {
      setDisconnecting(false);
    }
  };

  const sendTransaction = async (recipient: string, amount: number): Promise<string> => {
    if (!wallet || !connected) {
      throw new Error('Wallet not connected');
    }

    if (balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Mock transaction
    console.log(`Sending ${amount} SOL to ${recipient}`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    
    // Update balance
    setBalance(prev => Math.max(0, prev - amount - 0.000005)); // Subtract amount + fee
    
    // Return mock transaction hash
    return 'mock_tx_' + Math.random().toString(36).substring(2);
  };

  const refreshBalance = async () => {
    if (!connected || !publicKey) {
      setBalance(0);
      return;
    }

    try {
      // Mock balance fetch - in real implementation, this would query the Solana RPC
      const mockBalance = Math.random() * 10 + 0.5; // Random balance between 0.5 and 10.5 SOL
      setBalance(mockBalance);
      console.log(`Balance updated: ${mockBalance.toFixed(6)} SOL`);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const value: WalletContextType = {
    wallet,
    wallets,
    publicKey,
    connected,
    connecting,
    disconnecting,
    balance,
    select,
    connect,
    disconnect,
    sendTransaction,
    refreshBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default useWallet;