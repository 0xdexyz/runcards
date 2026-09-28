export type WalletProvider = 'phantom';

export interface DemoUser {
  name: string;
  username: string;
  avatarSeed: string;
  walletConnected: boolean;
  walletProvider: WalletProvider | null;
  walletAddress: string | null;
  walletNetwork: string | null;
  walletConnectedAt: number | null;
  xConnected: boolean;
  xHandle: string | null;
  xFollowers: number | null;
  balanceUsd: number;
}

export type CardTheme = 'orange' | 'black' | 'white' | 'custom';
export type CardStatus = 'active' | 'frozen';
export type CardRunState = 'draft' | 'running' | 'paused';

export interface CardRewardConfig {
  userReward: number;
  campaignReward: number;
  creatorShare: number;
  referralReward: number;
}

export interface RunCard {
  id: string;
  name: string;
  symbol: string;
  creator: string;
  creatorHandle: string;
  description: string;
  theme: CardTheme;
  accentColor?: string;
  backTheme: CardTheme;
  backAccentColor?: string;
  rewardRate: number;
  rewards: CardRewardConfig;
  activeUsers: number;
  cardViews: number;
  applications: number;
  activations: number;
  campaignIds: string[];
  transactionVolume: number;
  communitySize: number;
  status: CardStatus;
  runState: CardRunState;
  balanceUsd: number;
  creatorClaimed: number;
  createdAt: number;
  isOfficial: boolean;
  /** Acquired/used by the current user — populates My Cards. */
  ownedByUser: boolean;
  /** Created/run by the current user via the Launchpad — populates Your Cards. */
  createdByUser: boolean;
}

export type TaskType = 'x-post' | 'referral' | 'share' | 'content' | 'activation';
export type TaskStatus = 'pending' | 'verifying' | 'verified';

export interface CampaignTask {
  id: string;
  type: TaskType;
  title: string;
  reward: number;
  status: TaskStatus;
  verificationMethod: 'x-activity-simulator' | 'auto';
  /** Epoch ms this task becomes eligible to complete verification — set when submitted. */
  verifyAt?: number;
}

export type CampaignStatus = 'active' | 'completed' | 'ended';

export interface Campaign {
  id: string;
  cardId: string;
  creatorHandle: string;
  title: string;
  description: string;
  objective: string;
  rewardPool: number;
  participants: number;
  tasks: CampaignTask[];
  progress: number;
  status: CampaignStatus;
  startDate: number;
  endDate: number;
  joined: boolean;
}

export type TransactionType = 'payment' | 'reward' | 'claim';
export type TransactionStatus = 'approved' | 'pending' | 'declined';

export interface DemoTransaction {
  id: string;
  cardId: string;
  merchant: string;
  amount: number;
  asset: string;
  status: TransactionStatus;
  timestamp: number;
  rewardGenerated: number;
  type: TransactionType;
}

export interface RewardLedger {
  available: number;
  pending: number;
  lifetime: number;
  claimed: number;
}

export interface DemoNotification {
  id: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface DemoState {
  user: DemoUser;
  cards: RunCard[];
  campaigns: Campaign[];
  transactions: DemoTransaction[];
  rewards: RewardLedger;
  notifications: DemoNotification[];
}
