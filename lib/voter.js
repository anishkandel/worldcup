import crypto from "crypto";

export function getIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export function voterKey(ip, fingerprint) {
  return crypto
    .createHash("sha256")
    .update(ip + "|" + (fingerprint || ""))
    .digest("hex")
    .slice(0, 24);
}