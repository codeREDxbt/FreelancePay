export type MilestoneStatus =
  | "pending"
  | "submitted"
  | "approved"
  | "released"
  | "disputed";

export interface Milestone {
  id: number;
  description: string;
  amount: number;
  status: MilestoneStatus;
  deliverableUrl?: string;
}

export interface Contract {
  id: string;
  contractAddress: string;
  clientWallet: string;
  freelancerWallet: string;
  title: string;
  description: string;
  totalAmount: number;
  milestones: Milestone[];
  isDisputed: boolean;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  uid: string;
  walletAddress: string;
  displayName: string;
  email: string;
  role: "client" | "freelancer";
  createdAt: Date;
}

export interface ActivityItem {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  desc: string;
  date: number;
  time: string;
}

export interface NewContractFormData {
  title: string;
  description: string;
  amount: string;
  freelancerAddress: string;
  deliverableUrl: string;
}

export interface AccountBalanceResult {
  balance: string;
  error: string | null;
}

export interface SupportedWallet {
  id: string;
  name: string;
  icon: string;
  isAvailable?: boolean;
  isPlatformWrapper?: boolean;
}
