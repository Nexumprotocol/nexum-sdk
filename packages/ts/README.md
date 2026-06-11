# @nexumjs/sdk

Official TypeScript/JavaScript SDK for [NEXUM Protocol](https://nexum-protocol.netlify.app) — a decentralized freelance marketplace built on Solana.

## Installation

```bash
npm install @nexumjs/sdk
# or
yarn add @nexumjs/sdk
# or
pnpm add @nexumjs/sdk
```

## Quick Start

```ts
import { NexumClient, Network } from '@nexumjs/sdk';

// Connect to devnet
const client = NexumClient.devnet();

// Or connect to mainnet
const client = NexumClient.mainnet();

// Or with a custom RPC
const client = new NexumClient({
  network: Network.Devnet,
  rpcUrl: 'https://your-custom-rpc.com',
  commitment: 'confirmed',
});
```

## Tasks

```ts
import { NexumClient, TaskStatus } from '@nexumjs/sdk';

const client = NexumClient.devnet();

// Fetch all open tasks
const openTasks = await client.tasks.fetchOpen();

// Fetch a specific task by ID
const task = await client.getTask(1);
if (task) {
  console.log(task.title);
  console.log(task.reward_sol);         // reward in SOL
  console.log(task.skills_list);        // ['Rust', 'Solana']
}

// Fetch all tasks with filters
const tasks = await client.getAllTasks({ status: TaskStatus.InProgress });

// Get total value locked (open + in-progress escrows)
const tvl = await client.getTVL();
console.log(`TVL: ${tvl} SOL`);

// Get escrow balance for a task
const balance = await client.tasks.getEscrowBalance(1);
```

## Profiles

```ts
import { PublicKey } from '@solana/web3.js';

const owner = new PublicKey('YourPublicKeyHere');
const profile = await client.getProfile(owner);

if (profile) {
  console.log(profile.username);
  console.log(profile.sbtLevel);        // 0–4
  console.log(profile.tasksCompleted.toNumber());
}
```

## Disputes

```ts
const dispute = await client.getDispute(taskId);
if (dispute) {
  console.log(dispute.reason);
  console.log(dispute.resolved);
}
```

## Utilities

```ts
import {
  solToLamports,
  lamportsToSol,
  getSbtLevel,
  getSbtLabel,
  daysLeft,
  shortAddress,
  explorerUrl,
} from '@nexumjs/sdk';

solToLamports(1.5);                          // BN(1500000000)
lamportsToSol(new BN(1_000_000_000));        // 1.0

getSbtLevel(20);                             // 3
getSbtLabel(3);                              // "Expert"

daysLeft(deadlineUnix);                      // 7

shortAddress('7yn8tuqH...NNzA');             // "7yn8...NNzA"
explorerUrl('7yn8...', 'address', 'devnet'); // https://explorer.solana.com/...
```

## Constants

```ts
import {
  NEXUM_PROGRAM_ID,
  NEXUM_DEVNET_RPC,
  NEXUM_MAINNET_RPC,
  PLATFORM_FEE_BPS,
  SBT_LEVELS,
  SBT_THRESHOLDS,
  SEEDS,
} from '@nexumjs/sdk';
```

## Links

- [NEXUM Protocol](https://nexum-protocol.netlify.app)
- [GitHub](https://github.com/Nexumprotocol/nexum-sdk)
- [npm](https://www.npmjs.com/package/@nexumjs/sdk)

## License

MIT
