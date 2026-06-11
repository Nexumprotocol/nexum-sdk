# NEXUM Protocol SDK

Official multi-language SDK for integrating with [NEXUM Protocol](https://nexum-protocol.netlify.app) — the decentralized micro-task marketplace on Solana.

[![npm](https://img.shields.io/npm/v/@nexumjs/sdk)](https://www.npmjs.com/package/@nexumjs/sdk)
[![PyPI](https://img.shields.io/pypi/v/nexum-sdk)](https://pypi.org/project/nexum-sdk/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Network](https://img.shields.io/badge/Solana-Devnet-green)](https://explorer.solana.com/address/7yn8tuqHbNFRojEgiWeSoJkYjYtmdh1w4dKA2bCgNNzA?cluster=devnet)

-----

## Quick Start

### TypeScript / JavaScript

```bash
npm install @nexumjs/sdk
```

```typescript
import { NexumClient, Network } from '@nexumjs/sdk';

// Read-only client
const client = NexumClient.devnet();

// Fetch all open tasks
const tasks = await client.getAllTasks({ status: 'open' });
tasks.forEach(task => {
  console.log(`${task.title} — ${task.rewardLamports.toNumber() / 1e9} SOL`);
});

// Get Total Value Locked
const tvl = await client.getTVL();
console.log(`TVL: ${tvl} SOL`);

// Fetch user profile
import { findProfilePDA } from '@nexumjs/sdk';
const profile = await client.getProfile(walletPublicKey);
console.log(`${profile.username} — Level ${profile.sbtLevel} (${profile.reputation} REP)`);
```

**With Phantom wallet (write operations):**

```typescript
import { NexumClient } from '@nexumjs/sdk';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnchorWallet } from '@coral-xyz/anchor';

const { wallet } = useWallet();
const client = NexumClient.devnet().withWallet(wallet as AnchorWallet);

// Now use client.tasks, client.profiles, client.disputes
// for on-chain write operations via Phantom
```

-----

### Python

```bash
pip install nexum-sdk
```

```python
import asyncio
from nexum_sdk import NexumClient, Network, TaskFilter, TaskStatus

async def main():
    client = NexumClient.devnet()

    # Fetch all open tasks
    tasks = await client.get_open_tasks()
    for task in tasks:
        print(f"{task.title} — {task.reward_sol:.3f} SOL")

    # Get TVL
    tvl = await client.get_tvl()
    print(f"TVL: {tvl:.3f} SOL")

    # Fetch profile
    profile = await client.get_profile("YOUR_WALLET_ADDRESS")
    if profile:
        print(f"{profile.username} — {profile.sbt_label} ({profile.reputation} REP)")

asyncio.run(main())

# Or use sync wrappers:
client = NexumClient.devnet()
tasks = client.get_all_tasks_sync()
```

-----

### Rust

```toml
[dependencies]
nexum-sdk = "0.1.0"
```

```rust
use nexum_sdk::NexumClient;

fn main() {
    let client = NexumClient::devnet();

    // Fetch task
    if let Ok(Some(task)) = client.get_task(1) {
        println!("Task: {} — {:.3} SOL", task.title, task.reward_sol());
        println!("Status: {:?}", task.status);
        println!("Skills: {:?}", task.skills_vec());
    }

    // TVL
    let tvl = client.get_tvl().unwrap_or(0.0);
    println!("TVL: {:.3} SOL", tvl);

    // Profile
    let owner = "YOUR_WALLET_ADDRESS".parse().unwrap();
    if let Ok(Some(profile)) = client.get_profile(&owner) {
        println!("{} — {} ({} REP)", profile.username, profile.sbt_label(), profile.reputation);
    }
}
```

-----

## API Reference

### NexumClient

|Method                    |Description                             |
|--------------------------|----------------------------------------|
|`NexumClient.devnet()`    |Connect to Devnet                       |
|`NexumClient.mainnet()`   |Connect to Mainnet                      |
|`getTask(taskId)`         |Fetch single task by ID                 |
|`getAllTasks(filter?)`    |Fetch all tasks with optional filter    |
|`getProfile(owner)`       |Fetch user profile by wallet address    |
|`getDispute(taskId)`      |Fetch dispute for a task                |
|`getEscrowBalance(taskId)`|Get SOL locked in escrow                |
|`getTVL()`                |Total SOL locked across all active tasks|

### Utilities

|Function                     |Description              |
|-----------------------------|-------------------------|
|`findTaskPDA(taskId)`        |Derive Task PDA          |
|`findEscrowPDA(taskId)`      |Derive Escrow PDA        |
|`findProfilePDA(owner)`      |Derive Profile PDA       |
|`solToLamports(sol)`         |Convert SOL → lamports   |
|`lamportsToSol(lamports)`    |Convert lamports → SOL   |
|`getSbtLevel(tasksCompleted)`|Get SBT level (0–4)      |
|`getSbtLabel(level)`         |Get SBT label string     |
|`daysLeft(deadlineUnix)`     |Days remaining for a task|
|`explorerUrl(address)`       |Solana Explorer URL      |

### Types

```typescript
enum TaskStatus { Open, InProgress, Completed, Disputed, Cancelled }

interface NexumTask {
  taskId:         BN;
  creator:        PublicKey;
  title:          string;
  description:    string;
  requiredSkills: string;
  rewardLamports: BN;
  deadlineUnix:   BN;
  status:         TaskStatus;
  worker:         PublicKey | null;
}

interface NexumProfile {
  owner:          PublicKey;
  username:       string;
  skills:         string;
  reputation:     BN;
  tasksCompleted: BN;
  tasksCreated:   BN;
  sbtLevel:       number; // 0–4
}
```

-----

## Program Info

|            |                                              |
|------------|----------------------------------------------|
|Program ID  |`7yn8tuqHbNFRojEgiWeSoJkYjYtmdh1w4dKA2bCgNNzA`|
|Network     |Solana Devnet                                 |
|Framework   |Anchor 0.31.0                                 |
|Platform Fee|2.5%                                          |

-----

## License

MIT — see <LICENSE>

Built by [NEXUM Protocol](https://nexum-protocol.netlify.app) · [@nexum_p](https://twitter.com/nexum_p)
