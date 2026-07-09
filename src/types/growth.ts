import { Timestamp } from 'firebase/firestore';

export interface FeedbackEntry {
  id?: string;
  walletAddress: string;
  email: string;
  role: 'client' | 'freelancer' | 'both';
  rating: number;
  confusionPoint: string;
  requestedFeature: string;
  completedAction: string[];
  wouldUseAgain: 'yes' | 'no' | 'maybe';
  txHash?: string;
  createdAt: Timestamp | Date;
}

export interface Invite {
  id?: string;
  contractId: string;
  senderWallet: string;
  recipientEmail?: string;
  recipientWallet?: string;
  status: 'sent' | 'opened' | 'joined';
  source: string;
  createdAt: Timestamp | Date;
}

export interface TransactionEvent {
  id?: string;
  walletAddress: string;
  contractId: string;
  type: string;
  amount?: string;
  txHash?: string;
  timestamp: Timestamp | Date;
}

export interface OnboardingEvent {
  id?: string;
  walletAddress: string;
  event: string;
  metadata?: any;
  timestamp: Timestamp | Date;
}
