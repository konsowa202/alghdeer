#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const profileUrl = "https://www.instagram.com/alghdeer_sa/";
const featuredReel = "https://www.instagram.com/reel/DXl2kAGijT4/";
const outDir = join(process.cwd(), "public", "instagram");
const outputManifest = join(process.cwd(), "src", "data", "instagram.generated.json");
const cookiesFile = process.env.INSTAGRAM_COOKIES_TXT;

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

const profileCommands = [
  ...(cookiesFile
    ? [
        `yt-dlp --ignore-errors --retries 4 --socket-timeout 45 --cookies "${cookiesFile}" --write-info-json --write-thumbnail --output "${outDir}/%(id)s.%(ext)s" "${profileUrl}"`,
      ]
    : []),
  `yt-dlp --ignore-errors --retries 4 --socket-timeout 45 --cookies-from-browser chrome --write-info-json --write-thumbnail --output "${outDir}/%(id)s.%(ext)s" "${profileUrl}"`,
  `yt-dlp --ignore-errors --retries 4 --socket-timeout 45 --cookies-from-browser edge --write-info-json --write-thumbnail --output "${outDir}/%(id)s.%(ext)s" "${profileUrl}"`,
  `yt-dlp --ignore-errors --retries 4 --socket-timeout 45 --cookies-from-browser firefox --write-info-json --write-thumbnail --output "${outDir}/%(id)s.%(ext)s" "${profileUrl}"`,
  `yt-dlp --ignore-errors --retries 4 --socket-timeout 45 --write-info-json --write-thumbnail --output "${outDir}/%(id)s.%(ext)s" "${profileUrl}"`,
];

const commands = [
  {
    name: "featuredReel",
    command: `yt-dlp --format "best[ext=mp4]/best" --retries 4 --socket-timeout 45 --write-info-json --write-thumbnail --output "${outDir}/%(id)s.%(ext)s" "${featuredReel}"`,
    allowRetry: false,
  },
  ...profileCommands.map((command, idx) => ({
    name: `profile_try_${idx + 1}`,
    command,
    allowRetry: true,
  })),
];

const results = [];
for (const entry of commands) {
  try {
    execSync(entry.command, { stdio: "inherit" });
    results.push({ target: entry.name, ok: true });
    if (entry.allowRetry) {
      break;
    }
  } catch (error) {
    results.push({ target: entry.name, ok: false });
    console.error(`Instagram scrape failed for: ${entry.name}`);
  }
}

const files = readdirSync(outDir).map((name) => {
  const fullPath = join(outDir, name);
  const stats = statSync(fullPath);
  return { name, size: stats.size };
});

const media = files
  .filter((file) => /\.(mp4|jpg|jpeg|png|webp)$/i.test(file.name))
  .map((file) => ({
    fileName: file.name,
    url: `/instagram/${file.name}`,
    kind: file.name.toLowerCase().endsWith(".mp4") ? "video" : "image",
    size: file.size,
  }));

const manifest = {
  generatedAt: new Date().toISOString(),
  profile: profileUrl,
  featuredReel,
  results,
  media,
  note: "Local files are in /public/instagram and can be rendered directly.",
};

writeFileSync(outputManifest, JSON.stringify(manifest, null, 2), "utf-8");
console.log(`Manifest written to ${outputManifest}`);
