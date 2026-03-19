import os from "node:os";
import type { NextConfig } from "next";

function getAllowedDevOrigins(): string[] {
  const hosts = new Set(["localhost", "127.0.0.1"]);

  for (const network of Object.values(os.networkInterfaces())) {
    for (const address of network ?? []) {
      if (address.family === "IPv4" && !address.internal) {
        hosts.add(address.address);
      }
    }
  }

  return [...hosts];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
};

export default nextConfig;
