/**
 * NEXUM Protocol SDK — TypeScript Examples
 */

import { NexumClient, Network, TaskStatus } from '@nexum-protocol/sdk';
import { getSbtLabel, lamportsToSol, daysLeft, explorerUrl } from '@nexum-protocol/sdk';
import { PublicKey } from '@solana/web3.js';

async function main() {
  // ── 1. Connect ─────────────────────────────────────────────────────────
  const client = NexumClient.devnet();
  console.log('Connected to:', client.network);
  console.log('Program:', client.programId.toBase58());

  // ── 2. Get all open tasks ───────────────────────────────────────────────
  console.log('\n=== Open Tasks ===');
  const openTasks = await client.getAllTasks({ status: TaskStatus.Open });
  
  for (const task of openTasks) {
    const sol = lamportsToSol(task.rewardLamports);
    const dl  = daysLeft(task.deadlineUnix);
    console.log(`[${task.taskId}] ${task.title}`);
    console.log(`  Reward: ${sol} SOL | ${dl} days left`);
    console.log(`  Skills: ${task.requiredSkills}`);
    console.log(`  Creator: ${task.creator.toBase58().slice(0,8)}...`);
    console.log(`  Explorer: ${explorerUrl(task.creator.toBase58())}`);
  }

  // ── 3. Get specific task ────────────────────────────────────────────────
  console.log('\n=== Task #1 ===');
  const task = await client.getTask(1);
  if (task) {
    console.log('Title:', task.title);
    console.log('Status:', task.status);
    console.log('Reward:', lamportsToSol(task.rewardLamports), 'SOL');
    
    const escrowBalance = await client.getEscrowBalance(1);
    console.log('Escrow Balance:', escrowBalance, 'SOL');
  }

  // ── 4. Get profile ──────────────────────────────────────────────────────
  console.log('\n=== Profile ===');
  const ownerPubkey = new PublicKey('YOUR_WALLET_ADDRESS_HERE');
  const profile = await client.getProfile(ownerPubkey);
  
  if (profile) {
    console.log('Username:', profile.username);
    console.log('Skills:', profile.skills);
    console.log('Reputation:', profile.reputation.toNumber());
    console.log('Tasks Completed:', profile.tasksCompleted.toNumber());
    console.log('SBT Level:', profile.sbtLevel, '-', getSbtLabel(profile.sbtLevel));
  } else {
    console.log('Profile not found — wallet has no NEXUM profile yet');
  }

  // ── 5. TVL ──────────────────────────────────────────────────────────────
  console.log('\n=== Protocol Stats ===');
  const tvl = await client.getTVL();
  console.log('Total Value Locked:', tvl.toFixed(3), 'SOL');
}

main().catch(console.error);
