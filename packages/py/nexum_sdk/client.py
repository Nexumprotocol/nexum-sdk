import struct, asyncio, base64
from typing import Optional, List
import httpx
from .constants import NEXUM_PROGRAM_ID, NEXUM_DEVNET_RPC, NEXUM_MAINNET_RPC
from .types import NexumTask, NexumProfile, NexumDispute, TaskStatus, Network, TaskFilter

class NexumClient:
    def __init__(self, network=Network.DEVNET, rpc_url=None):
        self.network = network
        self.program_id = NEXUM_PROGRAM_ID
        self.rpc_url = rpc_url or (NEXUM_DEVNET_RPC if network == Network.DEVNET else NEXUM_MAINNET_RPC)

    @classmethod
    def devnet(cls, rpc_url=None): return cls(Network.DEVNET, rpc_url)
    @classmethod
    def mainnet(cls, rpc_url=None): return cls(Network.MAINNET, rpc_url)

    async def _rpc(self, method, params):
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(self.rpc_url, json={"jsonrpc":"2.0","id":1,"method":method,"params":params})
            return r.json().get("result")

    async def get_open_tasks(self): return await self.get_all_tasks(TaskFilter(status=TaskStatus.OPEN))

    async def get_all_tasks(self, filter_=None):
        result = await self._rpc("getProgramAccounts",[self.program_id,{"encoding":"base64","filters":[{"dataSize":892}]}])
        if not result: return []
        tasks = []
        for item in result:
            try:
                data = base64.b64decode(item["account"]["data"][0])
                tasks.append(self._deserialize_task(data))
            except: continue
        if filter_ and filter_.status:
            tasks = [t for t in tasks if t.status == filter_.status]
        return tasks

    async def get_task(self, task_id):
        try:
            from .utils import sol_to_lamports
            from solders.pubkey import Pubkey
            import struct
            id_bytes = struct.pack('<Q', task_id)
            pda, _ = Pubkey.find_program_address([b"task", id_bytes], Pubkey.from_string(self.program_id))
            result = await self._rpc("getAccountInfo",[str(pda),{"encoding":"base64"}])
            if not result or not result.get("value"): return None
            data = base64.b64decode(result["value"]["data"][0])
            return self._deserialize_task(data)
        except: return None

    async def get_tvl(self):
        tasks = await self.get_all_tasks()
        return sum(t.reward_sol for t in tasks if t.status in [TaskStatus.OPEN, TaskStatus.IN_PROGRESS])

    def _deserialize_task(self, data):
        o = 8
        task_id = struct.unpack_from('<Q',data,o)[0]; o+=8
        creator = self._pk(data,o); o+=32
        tl=struct.unpack_from('<I',data,o)[0];o+=4; title=data[o:o+tl].decode();o+=tl
        dl=struct.unpack_from('<I',data,o)[0];o+=4; desc=data[o:o+dl].decode();o+=dl
        sl=struct.unpack_from('<I',data,o)[0];o+=4; skills=data[o:o+sl].decode();o+=sl
        reward=struct.unpack_from('<Q',data,o)[0];o+=8
        deadline=struct.unpack_from('<q',data,o)[0];o+=8
        sm={0:TaskStatus.OPEN,1:TaskStatus.IN_PROGRESS,2:TaskStatus.COMPLETED,3:TaskStatus.DISPUTED,4:TaskStatus.CANCELLED}
        status=sm.get(data[o],TaskStatus.OPEN);o+=1
        hw=data[o]==1;o+=1
        worker=self._pk(data,o) if hw else None
        if hw: o+=32
        bump=data[o];o+=1; eb=data[o]
        return NexumTask(task_id,creator,title,desc,skills,reward,deadline,status,worker,bump,eb)

    def _pk(self,data,o):
        import base58
        return base58.b58encode(data[o:o+32]).decode()

    def get_all_tasks_sync(self, filter_=None): return asyncio.run(self.get_all_tasks(filter_))
    def get_tvl_sync(self): return asyncio.run(self.get_tvl())
