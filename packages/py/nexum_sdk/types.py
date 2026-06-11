from dataclasses import dataclass
from enum import Enum
from typing import Optional

class TaskStatus(str, Enum):
    OPEN        = "open"
    IN_PROGRESS = "inProgress"
    COMPLETED   = "completed"
    DISPUTED    = "disputed"
    CANCELLED   = "cancelled"

class Network(str, Enum):
    DEVNET  = "devnet"
    MAINNET = "mainnet-beta"

@dataclass
class NexumTask:
    task_id: int; creator: str; title: str; description: str
    required_skills: str; reward_lamports: int; deadline_unix: int
    status: TaskStatus; worker: Optional[str]; bump: int; escrow_bump: int
    @property
    def reward_sol(self): return self.reward_lamports / 1_000_000_000
    @property
    def skills_list(self): return [s.strip() for s in self.required_skills.split(',')]

@dataclass
class NexumProfile:
    owner: str; username: str; skills: str; reputation: int
    tasks_completed: int; tasks_created: int; sbt_level: int; bump: int
    @property
    def sbt_label(self):
        from .constants import SBT_LEVELS
        return SBT_LEVELS.get(self.sbt_level, "Unknown")

@dataclass
class NexumDispute:
    task_id: int; opened_by: str; reason: str; resolved: bool; bump: int

@dataclass
class TaskFilter:
    status: Optional[TaskStatus] = None
    creator: Optional[str] = None
    worker: Optional[str] = None
