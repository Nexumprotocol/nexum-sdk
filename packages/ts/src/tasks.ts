import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { NexumTask, TaskStatus, TaskFilter } from './types';
import { findTaskPDA, findEscrowPDA } from './utils';
import type { NexumClient } from './client';

export class TaskManager {
 constructor(private client: NexumClient) {}

 async fetch(taskId: number): Promise<NexumTask | null> {
   try {
     const [taskPDA] = findTaskPDA(taskId);
     const info = await this.client.connection.getAccountInfo(taskPDA);
     if (!info) return null;
     return this.deserialize(info.data);
   } catch { return null; }
 }

 async fetchAll(filter?: TaskFilter): Promise<NexumTask[]> {
   try {
     const accounts = await this.client.connection.getProgramAccounts(
       this.client.programId,
       { filters: [{ dataSize: 892 }], commitment: 'confirmed' }
     );

     const tasks = accounts
       .map(({ account }) => { try { return this.deserialize(account.data); } catch { return null; } })
       .filter((t): t is NexumTask => t !== null);

     if (!filter) return tasks;
     return tasks.filter(t => {
       if (filter.status  && t.status !== filter.status) return false;
       if (filter.creator && !t.creator.equals(filter.creator)) return false;
       if (filter.worker  && (t.worker === null || !t.worker.equals(filter.worker))) return false;
       return true;
     });
   } catch { return []; }
 }

 async fetchOpen(): Promise<NexumTask[]> {
   return this.fetchAll({ status: TaskStatus.Open });
 }

 async getEscrowBalance(taskId: number): Promise<number> {
   try {
     const [escrowPDA] = findEscrowPDA(taskId);
     const balance = await this.client.connection.getBalance(escrowPDA);
     return balance / LAMPORTS_PER_SOL;
   } catch { return 0; }
 }

 async getTotalTVL(): Promise<number> {
   const open = await this.fetchAll({ status: TaskStatus.Open });
   const inProgress = await this.fetchAll({ status: TaskStatus.InProgress });
   return [...open, ...inProgress].reduce((s, t) => s + t.rewardLamports.toNumber() / 1e9, 0);
 }

 private deserialize(data: Buffer): NexumTask {
   let offset = 8;
   const taskId = new BN(data.slice(offset, offset + 8), 'le'); offset += 8;
   const creator = new PublicKey(data.slice(offset, offset + 32)); offset += 32;
   const titleLen = data.readUInt32LE(offset); offset += 4;
   const title = data.slice(offset, offset + titleLen).toString('utf8'); offset += titleLen;
   const descLen = data.readUInt32LE(offset); offset += 4;
   const description = data.slice(offset, offset + descLen).toString('utf8'); offset += descLen;
   const skillsLen = data.readUInt32LE(offset); offset += 4;
   const requiredSkills = data.slice(offset, offset + skillsLen).toString('utf8'); offset += skillsLen;
   const rewardLamports = new BN(data.slice(offset, offset + 8), 'le'); offset += 8;
   const deadlineUnix = new BN(data.slice(offset, offset + 8), 'le'); offset += 8;
   const statusMap: Record<number, TaskStatus> = { 0: TaskStatus.Open, 1: TaskStatus.InProgress, 2: TaskStatus.Completed, 3: TaskStatus.Disputed, 4: TaskStatus.Cancelled };
   const status = statusMap[data[offset]]; offset += 1;
   const hasWorker = data[offset] === 1; offset += 1;
   const worker = hasWorker ? new PublicKey(data.slice(offset, offset + 32)) : null;
   if (hasWorker) offset += 32;
   const bump = data[offset]; offset += 1;
   const escrowBump = data[offset];
   return { taskId, creator, title, description, requiredSkills, rewardLamports, deadlineUnix, status, worker, bump, escrowBump };
 }
}
