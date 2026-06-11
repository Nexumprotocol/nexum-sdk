use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum TaskStatus {
    Open,
    InProgress,
    Completed,
    Disputed,
    Cancelled,
}

impl TaskStatus {
    pub fn from_u8(v: u8) -> Self {
        match v {
            0 => Self::Open,
            1 => Self::InProgress,
            2 => Self::Completed,
            3 => Self::Disputed,
            4 => Self::Cancelled,
            _ => Self::Open,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Network {
    Devnet,
    Mainnet,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NexumTask {
    pub task_id:         u64,
    pub creator:         String,
    pub title:           String,
    pub description:     String,
    pub required_skills: String,
    pub reward_lamports: u64,
    pub deadline_unix:   i64,
    pub status:          TaskStatus,
    pub worker:          Option<String>,
    pub bump:            u8,
    pub escrow_bump:     u8,
}

impl NexumTask {
    pub fn reward_sol(&self) -> f64 {
        self.reward_lamports as f64 / 1_000_000_000.0
    }
    pub fn skills_list(&self) -> Vec<&str> {
        self.required_skills.split(',').map(|s| s.trim()).collect()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NexumProfile {
    pub owner:           String,
    pub username:        String,
    pub skills:          String,
    pub reputation:      u64,
    pub tasks_completed: u64,
    pub tasks_created:   u64,
    pub sbt_level:       u8,
    pub bump:            u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NexumDispute {
    pub task_id:   u64,
    pub opened_by: String,
    pub reason:    String,
    pub resolved:  bool,
    pub bump:      u8,
}

#[derive(Debug, Clone, Default)]
pub struct TaskFilter {
    pub status:  Option<TaskStatus>,
    pub creator: Option<String>,
    pub worker:  Option<String>,
}

#[derive(Debug, Clone)]
pub struct NexumConfig {
    pub network:    Network,
    pub rpc_url:    Option<String>,
    pub commitment: String,
}

impl Default for NexumConfig {
    fn default() -> Self {
        Self {
            network:    Network::Devnet,
            rpc_url:    None,
            commitment: "confirmed".to_string(),
        }
    }
}
