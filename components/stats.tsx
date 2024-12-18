// 'use client';
import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface SystemInfo {
  os: {
    hostname: string;
    platform: string;
    arch: string;
  };
  cpuTemp: number | null;
  cpuUsage: number[];
  memoryUsage: {
    used: number;
    total: number;
    free: number;
  };
  storage: {
    mountPoint: string;
    total: number;
    used: number;
    free: number;
  }[];
  totalStorage: {
    total: number;
    used: number;
    free: number;
  };
  network: {
    latency: number;
    interface: string;
    bytesReceived: number;
    bytesSent: number;
    speed: number;
  }[];
}

const SkeletonLine = () => (
  <div className="h-4 bg-muted rounded animate-pulse" />
);

const SkeletonProgress = () => (
  <div className="h-2 bg-muted rounded animate-pulse" />
);

const SystemInfoSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-orange-500">System Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="w-1/3">
              <SkeletonLine />
            </div>
            <div className="w-1/4">
              <SkeletonLine />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">CPU Usage</h3>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <div className="w-20">
                <SkeletonLine />
              </div>
              <div className="w-12">
                <SkeletonLine />
              </div>
            </div>
            <SkeletonProgress />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Memory Usage</h3>
        <div className="flex justify-between">
          <div className="w-16">
            <SkeletonLine />
          </div>
          <div className="w-24">
            <SkeletonLine />
          </div>
        </div>
        <SkeletonProgress />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Network</h3>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="w-24">
                <SkeletonLine />
              </div>
              <div className="w-16">
                <SkeletonLine />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="w-full">
                <SkeletonLine />
              </div>
              <div className="w-full">
                <SkeletonLine />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const StorageSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-orange-500">Storage</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Total Storage</h3>
          <div className="flex justify-between items-center">
            <div className="w-24">
              <SkeletonLine />
            </div>
            <div className="w-16">
              <SkeletonLine />
            </div>
          </div>
          <div className="w-32">
            <SkeletonLine />
          </div>
          <SkeletonProgress />
        </div>

        <h3 className="text-lg font-semibold text-foreground mt-4">Individual Drives</h3>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="w-32">
                <SkeletonLine />
              </div>
              <div className="w-16">
                <SkeletonLine />
              </div>
            </div>
            <div className="w-32">
              <SkeletonLine />
            </div>
            <SkeletonProgress />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function Stats({ initialSystemInfo }: { initialSystemInfo: SystemInfo | null }) {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(initialSystemInfo);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSystemInfo() {
      try {
        const res = await fetch("/api/system-info");
        if (!res.ok) throw new Error("Failed to fetch system information");
        const data: SystemInfo = await res.json();
        setSystemInfo(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error(errorMessage);
      }
    }

    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <main className="min-h-screen bg-background flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!systemInfo ? (
          <>
            <SystemInfoSkeleton />
            <StorageSkeleton />
          </>
        ) : (
          <>
           {/* Original System Info Card */}
           <Card>
              <CardHeader>
                <CardTitle className="text-orange-500">System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Previous system info content remains the same */}
                <div className="space-y-2">
                  {[
                    ["Hostname", systemInfo.os.hostname],
                    ["Platform", systemInfo.os.platform],
                    ["Architecture", systemInfo.os.arch],
                    [
                      "CPU Temperature",
                      systemInfo.cpuTemp !== null
                        ? `${systemInfo.cpuTemp.toFixed(1)}°C`
                        : "Unavailable",
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}:</span>
                      <span className="text-foreground font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">CPU Usage</h3>
                  {systemInfo.cpuUsage.map((usage: number, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Core {index}</span>
                        <span>{usage}%</span>
                      </div>
                      <Progress value={usage} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Memory Usage</h3>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Used</span>
                    <span>
                      {systemInfo.memoryUsage.used.toFixed(2)} /{" "}
                      {systemInfo.memoryUsage.total.toFixed(2)} GB
                    </span>
                  </div>
                  <Progress
                    value={
                      (systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) * 100
                    }
                    className="h-2"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Network</h3>
                  {systemInfo.network.map((net, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{net.interface}</span>
                        <Badge
                          variant="outline"
                          className={
                            net.latency < 50
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : net.latency < 100
                              ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }
                        >
                          {net.latency.toFixed(1)} ms
                        </Badge>
                      </div>
                      {/*<div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Download:</span>{" "}
                          {(net.bytesReceived / 1024 / 1024).toFixed(2)} MB/s
                        </div>
                        <div>
                          <span className="text-muted-foreground">Upload:</span>{" "}
                          {(net.bytesSent / 1024 / 1024).toFixed(2)} MB/s
                        </div>
                      </div>*/}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Original Storage Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-500">Storage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Total Storage</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">All Drives</span>
                      <Badge variant="outline">
                        {((systemInfo.totalStorage.used / systemInfo.totalStorage.total) * 100).toFixed(1)}% used
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {systemInfo.totalStorage.used.toFixed(1)} / {systemInfo.totalStorage.total.toFixed(1)} GB
                    </div>
                    <Progress
                      value={(systemInfo.totalStorage.used / systemInfo.totalStorage.total) * 100}
                      className="h-2"
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mt-4">Individual Drives</h3>
                  {systemInfo.storage.map((drive, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {drive.mountPoint}
                        </span>
                        <Badge variant="outline">
                          {((drive.used / drive.total) * 100).toFixed(1)}% used
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {drive.used.toFixed(1)} / {drive.total.toFixed(1)} GB
                      </div>
                      <Progress
                        value={(drive.used / drive.total) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/system-info`);
    const data: SystemInfo = await res.json();

    return {
      props: {
        initialSystemInfo: data,
      },
    };
  } catch (error) {
    console.error("SSR Fetch Error:", error);
    return {
      props: {
        initialSystemInfo: null,
      },
    };
  }
};
