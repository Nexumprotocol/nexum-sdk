use reqwest::Client;
use serde_json::{json, Value};
use base58::ToBase58;
use crate::constants::{NEXUM_PROGRAM_ID, NEXUM_DEVNET_RPC, NEXUM_MAINNET_RPC};
use crate::types::{NexumConfig, NexumTask, NexumProfile, NexumDispute, Network, TaskFilter, TaskStatus};
use crate::error::NexumError;

pub struct NexumClient {
    pub network:    Network,
    pub program_id: String,
    pub rpc_url:    String,
    http:           Client,
}

impl NexumClient {
    pub fn new(config: NexumConfig) -> Self {
        let rpc_url = config.rpc_url.unwrap_or_else(|| {
            match config.network {
                Network::Mainnet => NEXUM_MAINNET_RPC.to_string(),
                Network::Devnet  => NEXUM_DEVNET_RPC.to_string(),
            }
        });
        Self {
            network:    config.network,
            program_id: NEXUM_PROGRAM_ID.to_string(),
            rpc_url,
            http: Client::new(),
        }
    }

    pub fn devnet() -> Self {
        Self::new(NexumConfig::default())
    }

    pub fn mainnet() -> Self {
        Self::new(NexumConfig { network: Network::Mainnet, ..Default::default() })
    }

    async fn rpc(&self, method: &str, params: Value) -> Result<Value, NexumError> {
        let body = json!({ "jsonrpc": "2.0", "id": 1, "method": method, "params": params });
        let resp = self.http
            .post(&self.rpc_url)
            .json(&body)
            .send()
            .await?
            .json::<Value>()
            .await?;
        Ok(resp["result"].clone())
    }

    pub async fn get_all_tasks(&self, filter: Option<TaskFilter>) -> Result<Vec<NexumTask>, NexumError> {
        let result = self.rpc(
            "getProgramAccounts",
            json!([self.program_id, {"encoding":"base64","filters":[{"dataSize":892}]}])
        ).await?;

        let accounts = result.as_array().ok_or_else(|| NexumError::Rpc("No accounts".into()))?;
        let mut tasks: Vec<NexumTask> = accounts.iter().filter_map(|item| {
            let data_b64 = item["account"]["data"][0].as_str()?;
            let data = base64::decode(data_b64).ok()?;
            Self::deserialize_task(&data).ok()
        }).collect();

        if let Some(f) = filter {
            if let Some(status) = f.status {
                tasks.retain(|t| t.status == status);
            }
            if let Some(creator) = f.creator {
                tasks.retain(|t| t.creator == creator);
            }
            if let Some(worker) = f.worker {
                tasks.retain(|t| t.worker.as_deref() == Some(&worker));
            }
        }

        Ok(tasks)
    }

    pub async fn get_open_tasks(&self) -> Result<Vec<NexumTask>, NexumError> {
        self.get_all_tasks(Some(TaskFilter { status: Some(TaskStatus::Open), ..Default::default() })).await
    }

    pub async fn get_tvl(&self) -> Result<f64, NexumError> {
        let tasks = self.get_all_tasks(None).await?;
        Ok(tasks.iter()
            .filter(|t| t.status == TaskStatus::Open || t.status == TaskStatus::InProgress)
            .map(|t| t.reward_sol())
            .sum())
    }

    pub fn explorer_url(&self, address: &str, kind: &str) -> String {
        let cluster = match self.network {
            Network::Devnet  => "?cluster=devnet",
            Network::Mainnet => "",
        };
        format!("https://explorer.solana.com/{}/{}{}", kind, address, cluster)
    }

    fn deserialize_task(data: &[u8]) -> Result<NexumTask, NexumError> {
        let mut o = 8usize;
        let task_id = u64::from_le_bytes(data[o..o+8].try_into().map_err(|e| NexumError::Deserialize(format!("{e}")))?); o += 8;
        let creator = data[o..o+32].to_base58(); o += 32;
        let tl = u32::from_le_bytes(data[o..o+4].try_into().unwrap()) as usize; o += 4;
        let title = String::from_utf8_lossy(&data[o..o+tl]).to_string(); o += tl;
        let dl = u32::from_le_bytes(data[o..o+4].try_into().unwrap()) as usize; o += 4;
        let description = String::from_utf8_lossy(&data[o..o+dl]).to_string(); o += dl;
        let sl = u32::from_le_bytes(data[o..o+4].try_into().unwrap()) as usize; o += 4;
        let required_skills = String::from_utf8_lossy(&data[o..o+sl]).to_string(); o += sl;
        let reward_lamports = u64::from_le_bytes(data[o..o+8].try_into().unwrap()); o += 8;
        let deadline_unix = i64::from_le_bytes(data[o..o+8].try_into().unwrap()); o += 8;
        let status = TaskStatus::from_u8(data[o]); o += 1;
        let has_worker = data[o] == 1; o += 1;
        let worker = if has_worker { let w = data[o..o+32].to_base58(); o += 32; Some(w) } else { None };
        let bump = data[o]; o += 1;
        let escrow_bump = data[o];
        Ok(NexumTask { task_id, creator, title, description, required_skills, reward_lamports, deadline_unix, status, worker, bump, escrow_bump })
    }
}
