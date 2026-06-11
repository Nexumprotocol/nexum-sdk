import { Connection, PublicKey } from '@solana/web3.js';
import { NexumConfig, Network, NexumTask, NexumProfile, NexumDispute, TaskFilter } from './types';
import { NEXUM_PROGRAM_ID, NEXUM_DEVNET_RPC, NEXUM_MAINNET_RPC } from './constants';
import { TaskManager } from './tasks';
import { ProfileManager } from './profile';
import { DisputeManager } from './dispute';

export class NexumClient {
 public readonly connection: Connection;
 public readonly programId:  PublicKey;
 public readonly network:    Network;
 public readonly tasks:      TaskManager;
 public readonly profiles:   ProfileManager;
 public readonly disputes:   DisputeManager;

 constructor(config: NexumConfig) {
   this.network   = config.network;
   this.programId = NEXUM_PROGRAM_ID;

   const rpcUrl = config.rpcUrl ?? (
     config.network === Network.Mainnet ? NEXUM_MAINNET_RPC : NEXUM_DEVNET_RPC
   );

   this.connection = new Connection(rpcUrl, config.commitment ?? 'confirmed');
   this.tasks      = new TaskManager(this);
   this.profiles   = new ProfileManager(this);
   this.disputes   = new DisputeManager(this);
 }

 static devnet(rpcUrl?: string): NexumClient {
   return new NexumClient({ network: Network.Devnet, rpcUrl });
 }

 static mainnet(rpcUrl?: string): NexumClient {
   return new NexumClient({ network: Network.Mainnet, rpcUrl });
 }

 async getTask(taskId: number): Promise<NexumTask | null> {
   return this.tasks.fetch(taskId);
 }

 async getAllTasks(filter?: TaskFilter): Promise<NexumTask[]> {
   return this.tasks.fetchAll(filter);
 }

 async getProfile(owner: PublicKey): Promise<NexumProfile | null> {
   return this.profiles.fetch(owner);
 }

 async getDispute(taskId: number): Promise<NexumDispute | null> {
   return this.disputes.fetch(taskId);
 }

 async getTVL(): Promise<number> {
   return this.tasks.getTotalTVL();
 }

 explorerUrl(address: string, type: 'address' | 'tx' = 'address'): string {
   const cluster = this.network === Network.Devnet ? '?cluster=devnet' : '';
   return `https://explorer.solana.com/${type}/${address}${cluster}`;
 }
}
