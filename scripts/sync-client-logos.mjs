import { readdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const dir = join(process.cwd(), "public", "clients");
const imageRe = /\.(jpe?g|png|gif|webp|svg)$/i;

let files = [];
if (existsSync(dir)) {
  files = readdirSync(dir)
    .filter((f) => imageRe.test(f) && !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

const paths = files.map((f) => `/clients/${encodeURIComponent(f)}`);

const out = `/**
 * يُولَّد تلقائياً بـ \`npm run sync:client-logos\` (ويُشغَّل قبل dev/build).
 * أضف أو احذف صوراً في \`public/clients\` ثم أعد تشغيل dev أو شغّل السكربت.
 */
export const clientLogoPaths: string[] = ${JSON.stringify(paths, null, 2)};
`;

const outPath = join(process.cwd(), "src", "data", "clientLogos.ts");
writeFileSync(outPath, out, "utf8");
console.log(`sync-client-logos: wrote ${paths.length} paths -> ${outPath}`);
