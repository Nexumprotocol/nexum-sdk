import { PublicKey } from '@solana/web3.js';

export const NEXUM_PROGRAM_ID = new PublicKey(
 '7yn8tuqHbNFRojEgiWeSoJkYjYtmdh1w4dKA2bCgNNzA'
);

export const NEXUM_DEVNET_RPC  = 'https://api.devnet.solana.com';
export const NEXUM_MAINNET_RPC = 'https://api.mainnet-beta.solana.com';

export const SEEDS = {
 TASK:    Buffer.from('task'),
 ESCROW:  Buffer.from('escrow'),
 PROFILE: Buffer.from('profile'),
 DISPUTE: Buffer.from('dispute'),
} as const;

export const PLATFORM_FEE_BPS = 250;

export const SBT_LEVELS = {
 0: 'Newcomer',
 1: 'Contributor',
 2: 'Builder',
 3: 'Expert',
 4: 'Legend',
} as const;

export const SBT_THRESHOLDS = [0, 5, 15, 30, 50] as const;
