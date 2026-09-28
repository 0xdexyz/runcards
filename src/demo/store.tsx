import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { seedState } from './seed';
import type {
  CardRewardConfig,
  CardRunState,
  CardTheme,
  DemoNotification,
  DemoState,
  DemoTransaction,
  RunCard,
  WalletProvider,
} from './types';

const STORAGE_KEY = 'run-app-state-v6';

export interface DraftCardInput {
  name: string;
  symbol: string;
  description: string;
  theme: CardTheme;
  accentColor?: string;
  backTheme: CardTheme;
  backAccentColor?: string;
  rewards: CardRewardConfig;
}

export interface DraftCampaignInput {
  title: string;
  objective: string;
  rewardPool: number;
  durationDays: number;
}

type Action =
  | { type: 'CONNECT_WALLET'; provider: WalletProvider; address: string; network: string }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'CONNECT_X'; handle: string }
  | { type: 'DISCONNECT_X' }
  | { type: 'SAVE_DRAFT_CARD'; id?: string; card: DraftCardInput }
  | { type: 'RUN_CARD'; id?: string; card: DraftCardInput; campaign: DraftCampaignInput | null }
  | { type: 'ACQUIRE_CARD'; cardId: string }
  | { type: 'SET_CARD_STATUS'; cardId: string; status: 'active' | 'frozen' }
  | { type: 'SET_CARD_RUN_STATE'; cardId: string; runState: CardRunState }
  | { type: 'ADD_FUNDS'; cardId: string; amount: number }
  | { type: 'JOIN_CAMPAIGN'; campaignId: string }
  | { type: 'COMPLETE_TASK'; campaignId: string; taskId: string }
  | { type: 'CREATE_CAMPAIGN'; cardId: string; campaign: DraftCampaignInput }
  | { type: 'CLAIM_REWARDS' }
  | { type: 'CLAIM_CREATOR_REWARDS' }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'RESET_DEMO' };

function pushNotification(state: DemoState, message: string): DemoState {
  const notification: DemoNotification = { id: crypto.randomUUID(), message, timestamp: Date.now(), read: false };
  return { ...state, notifications: [notification, ...state.notifications].slice(0, 30) };
}

function makeCampaignId() {
  return `camp-${Math.random().toString(36).slice(2, 9)}`;
}

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'CONNECT_WALLET': {
      const next = {
        ...state,
        user: {
          ...state.user,
          walletConnected: true,
          walletProvider: action.provider,
          walletAddress: action.address,
          walletNetwork: action.network,
          walletConnectedAt: Date.now(),
        },
      };
      return pushNotification(next, `Wallet connected (${action.provider}).`);
    }

    case 'DISCONNECT_WALLET': {
      const next = {
        ...state,
        user: { ...state.user, walletConnected: false, walletProvider: null, walletAddress: null, walletNetwork: null, walletConnectedAt: null },
      };
      return pushNotification(next, 'Wallet disconnected.');
    }

    case 'CONNECT_X': {
      const next = { ...state, user: { ...state.user, xConnected: true, xHandle: action.handle } };
      return pushNotification(next, `X handle set to ${action.handle}.`);
    }

    case 'DISCONNECT_X': {
      const next = { ...state, user: { ...state.user, xConnected: false, xHandle: null, xFollowers: null } };
      return pushNotification(next, 'X disconnected.');
    }

    case 'SAVE_DRAFT_CARD': {
      const existing = action.id ? state.cards.find((c) => c.id === action.id) : undefined;
      if (existing) {
        const cards = state.cards.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                name: action.card.name,
                symbol: action.card.symbol,
                description: action.card.description,
                theme: action.card.theme,
                accentColor: action.card.accentColor,
                backTheme: action.card.backTheme,
                backAccentColor: action.card.backAccentColor,
                rewards: action.card.rewards,
                rewardRate: action.card.rewards.userReward,
              }
            : c,
        );
        return { ...state, cards };
      }
      const id = `card-${Math.random().toString(36).slice(2, 9)}`;
      const card: RunCard = {
        id,
        name: action.card.name || 'Untitled Card',
        symbol: action.card.symbol || 'CARD',
        creator: state.user.name,
        creatorHandle: state.user.xHandle ?? `@${state.user.username}`,
        description: action.card.description,
        theme: action.card.theme,
        accentColor: action.card.accentColor,
        backTheme: action.card.backTheme,
        backAccentColor: action.card.backAccentColor,
        rewardRate: action.card.rewards.userReward,
        rewards: action.card.rewards,
        activeUsers: 0,
        cardViews: 0,
        applications: 0,
        activations: 0,
        campaignIds: [],
        transactionVolume: 0,
        communitySize: 0,
        status: 'active',
        runState: 'draft',
        balanceUsd: 0,
        creatorClaimed: 0,
        createdAt: Date.now(),
        isOfficial: false,
        ownedByUser: false,
        createdByUser: true,
      };
      const next = { ...state, cards: [...state.cards, card] };
      return pushNotification(next, `${card.name} saved as a draft.`);
    }

    case 'RUN_CARD': {
      const existing = action.id ? state.cards.find((c) => c.id === action.id) : undefined;
      const id = existing?.id ?? `card-${Math.random().toString(36).slice(2, 9)}`;
      const creatorHandle = state.user.xHandle ?? `@${state.user.username}`;

      const cardBase: RunCard = existing ?? {
        id,
        name: '',
        symbol: '',
        creator: state.user.name,
        creatorHandle,
        description: '',
        theme: 'orange',
        backTheme: 'orange',
        rewardRate: 0,
        rewards: action.card.rewards,
        activeUsers: 0,
        cardViews: 0,
        applications: 0,
        activations: 0,
        campaignIds: [],
        transactionVolume: 0,
        communitySize: 0,
        status: 'active',
        runState: 'draft',
        balanceUsd: 0,
        creatorClaimed: 0,
        createdAt: Date.now(),
        isOfficial: false,
        ownedByUser: false,
        createdByUser: true,
      };

      let campaignId: string | null = null;
      let campaigns = state.campaigns;
      if (action.campaign) {
        campaignId = makeCampaignId();
        const campaign = {
          id: campaignId,
          cardId: id,
          creatorHandle,
          title: action.campaign.title,
          description: `Initial campaign for ${action.card.name}.`,
          objective: action.campaign.objective,
          rewardPool: action.campaign.rewardPool,
          participants: 0,
          tasks: [
            { id: 't1', type: 'x-post' as const, title: 'Post about the card', reward: 25, status: 'pending' as const, verificationMethod: 'x-activity-simulator' as const },
            { id: 't2', type: 'referral' as const, title: 'Refer a user', reward: 100, status: 'pending' as const, verificationMethod: 'x-activity-simulator' as const },
            { id: 't3', type: 'share' as const, title: 'Share campaign', reward: 10, status: 'pending' as const, verificationMethod: 'x-activity-simulator' as const },
          ],
          progress: 0,
          status: 'active' as const,
          startDate: Date.now(),
          endDate: Date.now() + action.campaign.durationDays * 86_400_000,
          joined: false,
        };
        campaigns = [...campaigns, campaign];
      }

      const card: RunCard = {
        ...cardBase,
        name: action.card.name,
        symbol: action.card.symbol,
        description: action.card.description,
        theme: action.card.theme,
        accentColor: action.card.accentColor,
        backTheme: action.card.backTheme,
        backAccentColor: action.card.backAccentColor,
        rewardRate: action.card.rewards.userReward,
        rewards: action.card.rewards,
        runState: 'running',
        ownedByUser: true,
        createdByUser: true,
        campaignIds: campaignId ? [...cardBase.campaignIds, campaignId] : cardBase.campaignIds,
      };

      const cards = existing ? state.cards.map((c) => (c.id === id ? card : c)) : [...state.cards, card];
      const next = { ...state, cards, campaigns };
      return pushNotification(next, `${card.name} is now running on RUN.`);
    }

    case 'ACQUIRE_CARD': {
      const cards = state.cards.map((c) => (c.id === action.cardId ? { ...c, ownedByUser: true, activeUsers: c.activeUsers + 1 } : c));
      const card = cards.find((c) => c.id === action.cardId);
      const next = { ...state, cards };
      return pushNotification(next, `${card?.name ?? 'Card'} added to Cards I Use.`);
    }

    case 'SET_CARD_STATUS': {
      const cards = state.cards.map((c) => (c.id === action.cardId ? { ...c, status: action.status } : c));
      return { ...state, cards };
    }

    case 'SET_CARD_RUN_STATE': {
      const cards = state.cards.map((c) => (c.id === action.cardId ? { ...c, runState: action.runState } : c));
      const card = cards.find((c) => c.id === action.cardId);
      const next = { ...state, cards };
      return pushNotification(next, `${card?.name ?? 'Card'} is now ${action.runState}.`);
    }

    case 'ADD_FUNDS': {
      const card = state.cards.find((c) => c.id === action.cardId);
      if (!card) return state;
      const cards = state.cards.map((c) => (c.id === action.cardId ? { ...c, balanceUsd: c.balanceUsd + action.amount } : c));
      const next = { ...state, cards };
      return pushNotification(next, `Added $${action.amount.toFixed(2)} to ${card.name}.`);
    }

    case 'JOIN_CAMPAIGN': {
      const campaigns = state.campaigns.map((c) => (c.id === action.campaignId ? { ...c, joined: true, participants: c.participants + 1 } : c));
      const campaign = campaigns.find((c) => c.id === action.campaignId);
      const next = { ...state, campaigns };
      return pushNotification(next, `Joined campaign: ${campaign?.title ?? ''}.`);
    }

    case 'COMPLETE_TASK': {
      let rewardEarned = 0;
      let campaignTitle = '';
      let justCompleted = false;
      const campaigns = state.campaigns.map((c) => {
        if (c.id !== action.campaignId) return c;
        campaignTitle = c.title;
        const tasks = c.tasks.map((t) => {
          if (t.id !== action.taskId || t.status === 'verified') return t;
          rewardEarned = t.reward;
          return { ...t, status: 'verified' as const };
        });
        const verifiedCount = tasks.filter((t) => t.status === 'verified').length;
        const progress = tasks.length ? verifiedCount / tasks.length : 0;
        const status = progress >= 1 ? ('completed' as const) : c.status;
        justCompleted = progress >= 1 && c.status !== 'completed';
        return { ...c, tasks, progress, status };
      });
      const rewards = { ...state.rewards, available: state.rewards.available + rewardEarned, lifetime: state.rewards.lifetime + rewardEarned };
      const campaignForTx = campaigns.find((c) => c.id === action.campaignId);
      const tx: DemoTransaction = {
        id: `tx-${Math.random().toString(36).slice(2, 9)}`,
        cardId: campaignForTx?.cardId ?? '',
        merchant: campaignTitle,
        amount: rewardEarned,
        asset: 'pts',
        status: 'approved',
        timestamp: Date.now(),
        rewardGenerated: rewardEarned,
        type: 'reward',
      };
      let next = { ...state, campaigns, rewards, transactions: [tx, ...state.transactions] };
      next = pushNotification(next, `You earned ${rewardEarned} points.`);
      if (justCompleted) next = pushNotification(next, `${campaignTitle} completed.`);
      return next;
    }

    case 'CREATE_CAMPAIGN': {
      const id = makeCampaignId();
      const card = state.cards.find((c) => c.id === action.cardId);
      const campaign = {
        id,
        cardId: action.cardId,
        creatorHandle: card?.creatorHandle ?? state.user.xHandle ?? `@${state.user.username}`,
        title: action.campaign.title,
        description: `Campaign for ${card?.name ?? 'your card'}.`,
        objective: action.campaign.objective,
        rewardPool: action.campaign.rewardPool,
        participants: 0,
        tasks: [
          { id: 't1', type: 'x-post' as const, title: 'Post about the card', reward: 25, status: 'pending' as const, verificationMethod: 'x-activity-simulator' as const },
          { id: 't2', type: 'referral' as const, title: 'Refer a user', reward: 100, status: 'pending' as const, verificationMethod: 'x-activity-simulator' as const },
        ],
        progress: 0,
        status: 'active' as const,
        startDate: Date.now(),
        endDate: Date.now() + action.campaign.durationDays * 86_400_000,
        joined: false,
      };
      const cards = state.cards.map((c) => (c.id === action.cardId ? { ...c, campaignIds: [...c.campaignIds, id] } : c));
      const next = { ...state, cards, campaigns: [...state.campaigns, campaign] };
      return pushNotification(next, `Campaign created: ${campaign.title}.`);
    }

    case 'CLAIM_REWARDS': {
      const claimed = state.rewards.available;
      if (claimed <= 0) return state;
      const rewards = { ...state.rewards, available: 0, claimed: state.rewards.claimed + claimed };
      const tx: DemoTransaction = {
        id: `tx-${Math.random().toString(36).slice(2, 9)}`,
        cardId: 'run-card',
        merchant: 'Rewards claim',
        amount: claimed,
        asset: 'USDC',
        status: 'approved',
        timestamp: Date.now(),
        rewardGenerated: 0,
        type: 'claim',
      };
      const next = { ...state, rewards, transactions: [tx, ...state.transactions] };
      return pushNotification(next, `Claimed $${claimed.toFixed(2)} in rewards.`);
    }

    case 'CLAIM_CREATOR_REWARDS': {
      let totalDelta = 0;
      const cards = state.cards.map((c) => {
        if (!c.createdByUser) return c;
        const estimate = Math.round(c.transactionVolume * (c.rewards.creatorShare / 100) * 100) / 100;
        const delta = Math.max(0, estimate - c.creatorClaimed);
        totalDelta += delta;
        return delta > 0 ? { ...c, creatorClaimed: estimate } : c;
      });
      if (totalDelta <= 0) return state;
      const rewards = { ...state.rewards, available: state.rewards.available + totalDelta, lifetime: state.rewards.lifetime + totalDelta };
      const next = { ...state, cards, rewards };
      return pushNotification(next, `Creator reward balance increased by $${totalDelta.toFixed(2)}.`);
    }

    case 'MARK_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };

    case 'RESET_DEMO':
      return seedState();

    default:
      return state;
  }
}

function loadInitial(): DemoState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DemoState;
  } catch {
    // corrupt or unavailable storage — fall back to a fresh seed
  }
  return seedState();
}

interface DemoContextValue {
  state: DemoState;
  dispatch: (action: Action) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage can be unavailable (private mode, quota)
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoStore() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemoStore must be used inside DemoProvider');
  return ctx;
}

export function useDemo() {
  return useDemoStore().state;
}

export function useDemoDispatch() {
  return useDemoStore().dispatch;
}

export const useDemoActions = () => {
  const dispatch = useDemoDispatch();
  return useCallback(
    (action: Action) => {
      dispatch(action);
    },
    [dispatch],
  );
};

export type { Action as DemoAction };
