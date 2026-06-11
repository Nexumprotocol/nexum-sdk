import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export enum TaskStatus {
 Open       = 'open',
 InProgress = 'inProgress',
 Completed  = 'completed',
 Disputed   = 'disputed',
 Cancelled  = 'cancelled',
}

export enum Network {
 Devnet  = 'devnet',
 Mainnet = 'mainnet-beta',
 Local   = 'localnet',
}

export interface NexumTask {
 taskId:         BN;
 creator:        PublicKey;
 title:          string;
 description:    string;
 requiredSkills: string;
 rewardLamports: BN;
 deadlineUnix:   BN;
 status:         TaskStatus;
 worker:         PublicKey | null;
 bump:           number;
 escrowBump:     number;
}

export interface NexumProfile {
 owner:          PublicKey;
 username:       string;
 skills:         string;
 reputation:     BN;
 tasksCompleted: BN;
 tasksCreated:   BN;
 sbtLevel:       number;
 bump:           number;
}

export interface NexumDispute {
 taskId:   BN;
 openedBy: PublicKey;
 reason:   string;
 resolved: boolean;
 bump:     number;
}

export interface CreateTaskInput {
 taskId:         number | BN;
 title:          string;
 description:    string;
 requiredSkills: string;
 rewardSol:      number;
 deadlineDays:   number;
}

export interface TaskFilter {
 status?:  TaskStatus;
 creator?: PublicKey;
 worker?:  PublicKey;
}

export interface NexumConfig {
 network:     Network;
 rpcUrl?:     string;
 commitment?: 'processed' | 'confirmed' | 'finalized';
}
