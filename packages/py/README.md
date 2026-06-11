# nexum-sdk (Python)

Official Python SDK for [NEXUM Protocol](https://nexum-protocol.netlify.app) — a decentralized freelance marketplace built on Solana.

## Installation

```bash
pip install nexum-sdk
```

## Requirements

- Python 3.10+
- Dependencies: `httpx`, `base58`, `solders`

## Quick Start

```python
from nexum_sdk import NexumClient, Network

# Connect to devnet
client = NexumClient.devnet()

# Connect to mainnet
client = NexumClient.mainnet()

# Custom RPC
client = NexumClient(network=Network.DEVNET, rpc_url="https://your-custom-rpc.com")
```

## Tasks (async)

```python
import asyncio
from nexum_sdk import NexumClient, TaskStatus

client = NexumClient.devnet()

async def main():
    # Fetch all open tasks
    tasks = await client.get_open_tasks()
    for task in tasks:
        print(task.title, task.reward_sol, "SOL")
        print(task.skills_list)   # ['Rust', 'Solana']

    # Fetch a specific task
    task = await client.get_task(1)
    if task:
        print(task.title)
        print(task.status)        # TaskStatus.OPEN

    # Fetch all tasks
    all_tasks = await client.get_all_tasks()

    # Total value locked
    tvl = await client.get_tvl()
    print(f"TVL: {tvl:.2f} SOL")

asyncio.run(main())
```

## Tasks (sync helpers)

```python
client = NexumClient.devnet()

# Synchronous wrappers — no async/await needed
tasks = client.get_all_tasks_sync()
tvl   = client.get_tvl_sync()
```

## Utilities

```python
from nexum_sdk import (
    sol_to_lamports,
    lamports_to_sol,
    get_sbt_level,
    get_sbt_label,
    days_left,
    short_address,
)

sol_to_lamports(1.5)          # 1500000000
lamports_to_sol(1_000_000_000) # 1.0

get_sbt_level(20)             # 3
get_sbt_label(3)              # "Expert"

days_left(deadline_unix)      # 7

short_address("7yn8tuqH...NNzA")  # "7yn8...NNzA"
```

## Constants

```python
from nexum_sdk import (
    NEXUM_PROGRAM_ID,
    NEXUM_DEVNET_RPC,
    PLATFORM_FEE_BPS,
    SBT_LEVELS,
)
```

## Types

```python
from nexum_sdk import NexumTask, NexumProfile, NexumDispute, TaskStatus, Network, TaskFilter

# Filter tasks
filter_ = TaskFilter(status=TaskStatus.IN_PROGRESS)
tasks = await client.get_all_tasks(filter_)
```

## Links

- [NEXUM Protocol](https://nexum-protocol.netlify.app)
- [GitHub](https://github.com/Nexumprotocol/nexum-sdk)
- [PyPI](https://pypi.org/project/nexum-sdk)

## License

MIT
