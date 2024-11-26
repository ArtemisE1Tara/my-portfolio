import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function getCpuUsage() {
  const cpus = os.cpus();
  return cpus.map((cpu) => {
    const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
    const usage = 100 - (100 * cpu.times.idle) / total;
    return parseFloat(usage.toFixed(1));
  });
}

async function getCpuTemp() {
  try {
    const { stdout } = await execAsync("vcgencmd measure_temp");
    return parseFloat(stdout.replace("temp=", "").replace("'C", ""));
  } catch {
    return null;
  }
}

function bytesToGB(bytes: number) {
  return parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2));
}

async function getStorageInfo() {
  try {
    const { stdout } = await execAsync("df -B1");
    const lines = stdout.split("\n").slice(1); // Skip header
    const storageInfo = lines
      .filter((line) => line.trim())
      .map((line) => {
        const [, blocks, used, available, , mountpoint] = line.split(/\s+/);
        return {
          mountPoint: mountpoint,
          total: bytesToGB(parseInt(blocks)),
          used: bytesToGB(parseInt(used)),
          free: bytesToGB(parseInt(available)),
        };
      })
      .filter((info) => info.total > 0); // Filter out special filesystems

    // Calculate total storage
    const totalStorage = storageInfo.reduce(
      (acc, drive) => ({
        total: acc.total + drive.total,
        used: acc.used + drive.used,
        free: acc.free + drive.free,
      }),
      { total: 0, used: 0, free: 0 }
    );

    return { storageInfo, totalStorage };
  } catch (error) {
    console.error("Error getting storage info:", error);
    return {
      storageInfo: [],
      totalStorage: { total: 0, used: 0, free: 0 },
    };
  }
}

async function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const networkStats = [];

  for (const [name, info] of Object.entries(interfaces)) {
    if (!info) continue;

    const activeInterface = info.find(
      (addr) => !addr.internal && addr.family === "IPv4"
    );
    if (activeInterface) {
      try {
        // Get latency
        const { stdout: pingResult } = await execAsync(`ping -c 1 8.8.8.8`);
        const latencyMatch = pingResult.match(/time=([\d.]+)/);
        const latency = latencyMatch ? parseFloat(latencyMatch[1]) : 0;

        // Get network speed using ifconfig or ip
        const { stdout: speedInfo } = await execAsync(
          `ifconfig ${name} || ip link show ${name}`
        );
        const speedMatch = speedInfo.match(/(\d+)Mb\/s/);
        const speed = speedMatch ? parseInt(speedMatch[1]) : 0;

        networkStats.push({
          interface: name,
          latency,
          speed,
        });
      } catch (error) {
        console.error(`Error getting network info for ${name}:`, error);
      }
    }
  }

  return networkStats;
}

export async function GET() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  const { storageInfo, totalStorage } = await getStorageInfo();
  const network = await getNetworkInfo();

  return new Response(
    JSON.stringify({
      os: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
      },
      cpuTemp: await getCpuTemp(),
      cpuUsage: getCpuUsage(),
      memoryUsage: {
        total: bytesToGB(totalMem),
        used: bytesToGB(usedMem),
        free: bytesToGB(freeMem),
      },
      storage: storageInfo,
      totalStorage,
      network,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
