use std::time::{SystemTime, UNIX_EPOCH};
use crate::constants::{LAMPORTS_PER_SOL, SBT_THRESHOLDS, SBT_LABELS};

pub fn sol_to_lamports(sol: f64) -> u64 {
    (sol * LAMPORTS_PER_SOL as f64) as u64
}

pub fn lamports_to_sol(lamports: u64) -> f64 {
    lamports as f64 / LAMPORTS_PER_SOL as f64
}

pub fn get_sbt_level(tasks_completed: u64) -> usize {
    let mut level = 0;
    for (i, &threshold) in SBT_THRESHOLDS.iter().enumerate() {
        if tasks_completed >= threshold {
            level = i;
        }
    }
    level
}

pub fn get_sbt_label(level: usize) -> &'static str {
    SBT_LABELS.get(level).copied().unwrap_or("Unknown")
}

pub fn days_left(deadline_unix: i64) -> i64 {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;
    ((deadline_unix - now) / 86_400).max(0)
}

pub fn short_address(address: &str) -> String {
    if address.len() <= 8 {
        return address.to_string();
    }
    format!("{}...{}", &address[..4], &address[address.len()-4..])
}

pub fn explorer_url(value: &str, kind: &str, cluster: &str) -> String {
    let cluster_param = if cluster != "mainnet-beta" {
        format!("?cluster={}", cluster)
    } else {
        String::new()
    };
    format!("https://explorer.solana.com/{}/{}{}", kind, value, cluster_param)
}
