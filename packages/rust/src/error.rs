use thiserror::Error;
#[derive(Debug,Error)]
pub enum NexumError {
    #[error("RPC error: {0}")] Rpc(String),
    #[error("Account not found")] AccountNotFound,
    #[error("Deserialize error: {0}")] Deserialize(String),
    #[error("Network error: {0}")] Network(#[from] reqwest::Error),
}
