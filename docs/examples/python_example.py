"""
NEXUM Protocol SDK — Python Examples
"""
import asyncio
from nexum_sdk import (
    NexumClient,
    TaskFilter, TaskStatus,
    get_sbt_label, lamports_to_sol, days_left, explorer_url
)


async def main():
    # ── 1. Connect ────────────────────────────────────────────────────────
    client = NexumClient.devnet()
    print(f"Connected: {client.rpc_url}")
    print(f"Program: {client.program_id}")

    # ── 2. All open tasks ─────────────────────────────────────────────────
    print("\n=== Open Tasks ===")
    tasks = await client.get_open_tasks()

    for task in tasks:
        dl = days_left(task.deadline_unix)
        print(f"[{task.task_id}] {task.title}")
        print(f"  Reward: {task.reward_sol:.3f} SOL | {dl} days left")
        print(f"  Skills: {task.skills_list}")
        print(f"  Status: {task.status.value}")
        print(f"  Explorer: {explorer_url(task.creator)}")

    # ── 3. Specific task ──────────────────────────────────────────────────
    print("\n=== Task #1 ===")
    task = await client.get_task(1)
    if task:
        print(f"Title: {task.title}")
        print(f"Reward: {task.reward_sol:.3f} SOL")
        print(f"Status: {task.status.value}")
        print(f"Worker: {task.worker or 'None'}")

    # ── 4. Profile ────────────────────────────────────────────────────────
    print("\n=== Profile ===")
    profile = await client.get_profile("YOUR_WALLET_ADDRESS_HERE")
    if profile:
        print(f"Username: {profile.username}")
        print(f"Reputation: {profile.reputation}")
        print(f"Tasks Completed: {profile.tasks_completed}")
        print(f"SBT: Level {profile.sbt_level} — {profile.sbt_label}")
        print(f"Skills: {profile.skills_list}")
    else:
        print("No profile found")

    # ── 5. TVL ────────────────────────────────────────────────────────────
    print("\n=== Protocol Stats ===")
    tvl = await client.get_tvl()
    print(f"Total Value Locked: {tvl:.3f} SOL")


if __name__ == "__main__":
    asyncio.run(main())
