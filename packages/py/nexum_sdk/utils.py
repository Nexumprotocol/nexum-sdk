import time, struct
from .constants import LAMPORTS_PER_SOL, SBT_LEVELS, SBT_THRESHOLDS, PLATFORM_FEE_BPS

def sol_to_lamports(sol): return int(sol * LAMPORTS_PER_SOL)
def lamports_to_sol(lamps): return lamps / LAMPORTS_PER_SOL
def get_sbt_level(tasks):
    for i in range(len(SBT_THRESHOLDS)-1,-1,-1):
        if tasks >= SBT_THRESHOLDS[i]: return i
    return 0
def get_sbt_label(level): return SBT_LEVELS.get(level, "Unknown")
def days_left(deadline): return max(0, (deadline - int(time.time())) // 86400)
def short_address(pk): return f"{pk[:4]}...{pk[-4:]}"
def explorer_url(val, type_="address", cluster="devnet"):
    cp = f"?cluster={cluster}" if cluster != "mainnet-beta" else ""
    return f"https://explorer.solana.com/{type_}/{val}{cp}"
