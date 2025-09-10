import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BLOCKCHAIN_CONSTANTS } from '../types/shared';

// Blockchain types
export interface Transaction {
  signature: string;
  type: TransactionType;
  amount: number;
  playerId: string;
  gameId?: string;
  status: TransactionStatus;
  createdAt: Date;
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  ENTRY_FEE = 'entry_fee',
  PRIZE_PAYOUT = 'prize_payout'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

export interface GamePool {
  gameId: string;
  totalPool: number;
  entryFee: number;
  houseFee: number;
  prizeDistribution: PrizeDistribution[];
}

export interface PrizeDistribution {
  position: number;
  percentage: number;
  amount: number;
}

export class BlockchainService {
  private connection: Connection;

  constructor() {
    // Use devnet for development
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
  }

  async getWalletBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  }

  async verifyTransaction(signature: string): Promise<boolean> {
    try {
      const transaction = await this.connection.getTransaction(signature);
      return transaction !== null && transaction.meta?.err === null;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return false;
    }
  }

  async createGamePool(gameId: string, entryFee: number, _maxPlayers: number): Promise<GamePool> {
    // TODO: Implement actual Solana program interaction
    const gamePool: GamePool = {
      gameId,
      totalPool: 0,
      entryFee: entryFee * LAMPORTS_PER_SOL,
      houseFee: entryFee * BLOCKCHAIN_CONSTANTS.HOUSE_FEE_PERCENTAGE,
      prizeDistribution: BLOCKCHAIN_CONSTANTS.PRIZE_DISTRIBUTION.map(prize => ({
        position: prize.position,
        percentage: prize.percentage,
        amount: 0 // Will be calculated when game ends
      }))
    };

    return gamePool;
  }

  async processEntryPayment(
    walletAddress: string, 
    gameId: string, 
    entryFee: number
  ): Promise<Transaction> {
    // TODO: Implement actual payment processing with Solana program
    const transaction: Transaction = {
      signature: this.generateMockSignature(),
      type: TransactionType.ENTRY_FEE,
      amount: entryFee,
      playerId: walletAddress,
      gameId,
      status: TransactionStatus.PENDING,
      createdAt: new Date()
    };

    // Mock transaction processing
    setTimeout(() => {
      transaction.status = TransactionStatus.CONFIRMED;
    }, 2000);

    return transaction;
  }

  async distributePrizes(
    gameId: string, 
    winners: { walletAddress: string; prize: number }[]
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

    for (const winner of winners) {
      // TODO: Implement actual prize distribution
      const transaction: Transaction = {
        signature: this.generateMockSignature(),
        type: TransactionType.PRIZE_PAYOUT,
        amount: winner.prize,
        playerId: winner.walletAddress,
        gameId,
        status: TransactionStatus.PENDING,
        createdAt: new Date()
      };

      transactions.push(transaction);

      // Mock transaction processing
      setTimeout(() => {
        transaction.status = TransactionStatus.CONFIRMED;
      }, 3000);
    }

    return transactions;
  }

  async validateEntryFee(entryFee: number): Promise<boolean> {
    return entryFee >= BLOCKCHAIN_CONSTANTS.MIN_ENTRY_FEE && 
           entryFee <= BLOCKCHAIN_CONSTANTS.MAX_ENTRY_FEE;
  }

  calculatePrizeDistribution(totalPool: number): { position: number; amount: number }[] {
    const availablePool = totalPool * (1 - BLOCKCHAIN_CONSTANTS.HOUSE_FEE_PERCENTAGE);
    
    return BLOCKCHAIN_CONSTANTS.PRIZE_DISTRIBUTION.map(prize => ({
      position: prize.position,
      amount: availablePool * prize.percentage
    }));
  }

  private generateMockSignature(): string {
    // Generate a mock Solana transaction signature
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let signature = '';
    for (let i = 0; i < 88; i++) {
      signature += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return signature;
  }
}