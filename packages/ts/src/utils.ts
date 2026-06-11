import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { NEXUM_PROGRAM_ID, SEEDS, SBT_THRESHOLDS, SBT_LEVELS } from './constants';

export const LAMPORTS_PER_SOL = 1_000_000_000;

export function findTaskPDA(taskId: number | BN): [PublicKey, number] {
 const id = BN.isBN(taskId) ? taskId : new BN(taskId);
 return PublicKey.findProgramAddressSync(
   [SEEDS.TASK, id.toArrayLike(Buffer, 'le', 8)],
   NEXUM_PROGRAM_ID
 );
}

export function findEscrowPDA(taskId: number | BN): [PublicKey, number] {
 const id = BN.isBN(taskId) ? taskId : new BN(taskId);
 return PublicKey.findProgramAddressSync(
   [SEEDS.ESCROW, id.toArrayLike(Buffer, 'le', 8)],
   NEXUM_PROGRAM_ID
 );
}

export function findProfilePDA(owner: PublicKey): [PublicKey, number] {
 return PublicKey.findProgramAddressSync(
   [SEEDS.PROFILE, owner.toBuffer()],
   NEXUM_PROGRAM_ID
 );
}

export function findDisputePDA(taskId: number | BN): [PublicKey, number] {
 const id = BN.isBN(taskId) ? taskId : new BN(taskId);
 return PublicKey.findProgramAddressSync(
   [SEEDS.DISPUTE, id.toArrayLike(Buffer, 'le', 8)],
   NEXUM_PROGRAM_ID
 );
}

export function solToLamports(sol: number): BN {
 return new BN(Math.floor(sol * LAMPORTS_PER_SOL));
}

export function lamportsToSol(lamports: BN | number): number {
 const l = BN.isBN(lamports) ? lamports.toNumber() : lamports;
 return l / LAMPORTS_PER_SOL;
}

export function getSbtLevel(tasksCompleted: number): number {
 for (let i = SBT_THRESHOLDS.length - 1; i >= 0; i--) {
   if (tasksCompleted >= SBT_THRESHOLDS[i]) return i;
 }
 return 0;
}

export function getSbtLabel(level: number): string {
 return SBT_LEVELS[level as keyof typeof SBT_LEVELS] ?? 'Unknown';
}

export function daysLeft(deadlineUnix: BN | number): number {
 const ts  = BN.isBN(deadlineUnix) ? deadlineUnix.toNumber() : deadlineUnix;
 const now = Math.floor(Date.now() / 1000);
 return Math.max(0, Math.floor((ts - now) / 86_400));
}

export function shortAddress(pubkey: PublicKey | string): string {
 const addr = pubkey.toString();
 return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export function explorerUrl(value: string, type: 'address' | 'tx' = 'address', cluster: 'devnet' | 'mainnet-beta' = 'devnet'): string {
 const clusterParam = cluster === 'devnet' ? '?cluster=devnet' : '';
 return `https://explorer.solana.com/${type}/${value}${clusterParam}`;
}
