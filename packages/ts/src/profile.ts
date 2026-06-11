import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { NexumProfile, NexumDispute } from './types';
import { findProfilePDA, findDisputePDA } from './utils';
import type { NexumClient } from './client';

export class ProfileManager {
  constructor(private client: NexumClient) {}
  async fetch(owner: PublicKey): Promise<NexumProfile | null> {
    try {
      const [pda] = findProfilePDA(owner);
      const info = await this.client.connection.getAccountInfo(pda);
      if (!info) return null;
      return this.deserialize(info.data);
    } catch { return null; }
  }
  private deserialize(data: Buffer): NexumProfile {
    let offset = 8;
    const owner = new PublicKey(data.slice(offset, offset + 32)); offset += 32;
    const unLen = data.readUInt32LE(offset); offset += 4;
    const username = data.slice(offset, offset + unLen).toString('utf8'); offset += unLen;
    const skLen = data.readUInt32LE(offset); offset += 4;
    const skills = data.slice(offset, offset + skLen).toString('utf8'); offset += skLen;
    const reputation = new BN(data.slice(offset, offset + 8), 'le'); offset += 8;
    const tasksCompleted = new BN(data.slice(offset, offset + 8), 'le'); offset += 8;
    const tasksCreated = new BN(data.slice(offset, offset + 8), 'le'); offset += 8;
    const sbtLevel = data[offset]; offset += 1;
    const bump = data[offset];
    return { owner, username, skills, reputation, tasksCompleted, tasksCreated, sbtLevel, bump };
  }
}

export class DisputeManager {
  constructor(private client: NexumClient) {}
  async fetch(taskId: number): Promise<NexumDispute | null> {
    try {
      const [pda] = findDisputePDA(taskId);
      const info = await this.client.connection.getAccountInfo(pda);
      if (!info) return null;
      return this.deserialize(info.data);
    } catch { return null; }
  }
  private deserialize(data: Buffer): NexumDispute {
    let offset = 8;
    const taskId = new BN(data.slice(offset, offset + 8), 'le'); offset += 8;
    const openedBy = new PublicKey(data.slice(offset, offset + 32)); offset += 32;
    const rLen = data.readUInt32LE(offset); offset += 4;
    const reason = data.slice(offset, offset + rLen).toString('utf8'); offset += rLen;
    const resolved = data[offset] === 1; offset += 1;
    const bump = data[offset];
    return { taskId, openedBy, reason, resolved, bump };
  }
}
