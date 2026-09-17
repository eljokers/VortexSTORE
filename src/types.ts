export interface ServerStatusData {
  online: boolean;
  playersNow: number;
  playersMax: number;
  version?: string;
  motd?: string;
  loading: boolean;
  error?: boolean;
}

export type StoreCategory = 'ranks' | 'keys' | 'coins' | 'cosmetics';

export interface StorePackage {
  id: string;
  category: StoreCategory;
  tier?: string;
  name: string;
  price: string;
  egpPrice: string;
  numericPrice: number;
  currency: string;
  popular?: boolean;
  features: string[];
  color: string;
  description?: string;
  buyUrl?: string;
}

export interface RecentPurchase {
  id: string;
  player: string;
  item: string;
  timeAgo: string;
  avatarUrl: string;
}

export interface RuleItem {
  id: number;
  title: string;
  description: string;
  severity: string;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'denied';

export type OrderStatus = 'pending' | 'accepted' | 'cancelled';

export interface StoreOrder {
  orderId: string;
  securityPin: string;
  package: string;
  tier?: string;
  priceEgp: string;
  priceUsd: string;
  paymentMethod: string;
  player: string;
  platform: 'java' | 'bedrock';
  senderPhone: string;
  transactionRef: string;
  adminRecipient?: string;
  timestamp: string;
  status: OrderStatus;
  staffNotes?: string;
  cancellationReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewedTimestamp?: number;
  archived?: boolean;
  delivered?: boolean;
  deliveredAt?: string;
  commandExecuted?: string;
  deliveryLog?: string[];
  // Payment proof & transaction audit
  paymentProof?: string;
  paymentProofName?: string;
  clientIp?: string;
  rankCommand?: string;
}

export interface StaffApplication {
  id: string;
  submittedAt: string;
  status: ApplicationStatus;
  // Step 1: Personal Information
  minecraftUsername: string;
  discordUsername: string;
  age: number | string;
  country: string;
  timezone: string;
  // Step 2: Experience
  hasStaffExperience: 'yes' | 'no';
  previousServers?: string;
  previousStaffRank?: string;
  playingDuration: string;
  activeHoursPerDay: string;
  // Step 3: Staff Questions
  whyVortex: string;
  whyChooseYou: string;
  goodStaffDefinition: string;
  handleToxicPlayer: string;
  friendBrokeRules: string;
  accusationOfCheating: string;
  playerArgument: string;
  staffAbuse: string;
  // Step 4: Final
  contribution: string;
  additionalInfo?: string;
  truthfulConfirmed: boolean;
  rulesAgreed: boolean;
  // Admin fields
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewedTimestamp?: number;
  archived?: boolean;
}
