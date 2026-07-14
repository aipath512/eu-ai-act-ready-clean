/**
 * rrvi-generator-worker
 * ----------------------
 * DRAFT — not yet deployed. Test via workers.dev URL first.
 *
 * Fetches the 95 RRVI template docs from GitHub (raw.githubusercontent.com),
 * substitutes {{COMPANY_NAME}} and {{RESPONSIBLE_PERSON}}, packages the
 * result as a real .zip file (built by hand below — no npm libraries,
 * so this pastes directly into the Cloudflare dashboard code editor with
 * no build step required), and returns it as a download.
 *
 * BEFORE THIS WORKS, you need to:
 *   1. Push the rrvi_templates/ folder (95 .md files) to a GitHub repo
 *   2. Push rrvi-manifest.json (list of the 95 file paths) to that same repo
 *   3. Update GITHUB_RAW_BASE below to match your repo's raw URL
 *
 * Call it with:
 *   POST /generate
 *   { "companyName": "Acme AI Ltd", "responsiblePerson": "Jane Demo" }
 *
 * Returns: a .zip file download.
 */

const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/aipath512/REPO-NAME-HERE/main/rrvi_templates";
const MANIFEST_URL = "https://raw.githubusercontent.com/aipath512/REPO-NAME-HERE/main/rrvi-manifest.json";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (url.pathname === "/generate" && request.method === "POST") {
      try {
        const body = await request.json();
        const companyName = (body.companyName || "Demo Company Ltd").trim();
        const responsiblePerson = (body.responsiblePerson || "Demo Contact").trim();

        // 1. Get the list of all 95 file paths
        const manifestResp = await fetch(MANIFEST_URL);
        if (!manifestResp.ok) {
          return new Response("Could not load file manifest from GitHub", { status: 502 });
        }
        const filePaths = await manifestResp.json();

        // 2. Fetch and render each file
        const renderedFiles = [];
        for (const relPath of filePaths) {
          const fileResp = await fetch(`${GITHUB_RAW_BASE}/${relPath}`);
          if (!fileResp.ok) {
            console.error(`Failed to fetch ${relPath}: ${fileResp.status}`);
            continue;
          }
          let text = await fileResp.text();
          text = text.replaceAll("{{COMPANY_NAME}}", companyName);
          text = text.replaceAll("{{RESPONSIBLE_PERSON}}", responsiblePerson);
          renderedFiles.push({ path: relPath, content: text });
        }

        // 3. Build a real .zip file (STORE method = no compression, keeps this dependency-free)
        const zipBytes = buildZip(renderedFiles);

        const safeName = companyName.replace(/[^a-zA-Z0-9]/g, "_");
        return new Response(zipBytes, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="RRVI-Kit-${safeName}.zip"`,
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (err) {
        console.error("Generation error:", err);
        return new Response("Generation failed: " + err.message, { status: 500 });
      }
    }

    return new Response("RRVI Generator API — POST to /generate with companyName + responsiblePerson");
  }
};

// ---- Minimal ZIP writer (STORE / uncompressed entries only) ----
// This exists so the Worker has zero external dependencies and can be
// pasted directly into the Cloudflare dashboard editor.

function crc32(data) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.path);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);
    const size = dataBytes.length;

    // Local file header
    const localHeader = new DataView(new ArrayBuffer(30));
    localHeader.setUint32(0, 0x04034b50, true);   // signature
    localHeader.setUint16(4, 20, true);           // version needed
    localHeader.setUint16(6, 0, true);            // flags
    localHeader.setUint16(8, 0, true);            // method = 0 (store)
    localHeader.setUint16(10, 0, true);           // mod time
    localHeader.setUint16(12, 0, true);           // mod date
    localHeader.setUint32(14, crc, true);
    localHeader.setUint32(18, size, true);        // compressed size
    localHeader.setUint32(22, size, true);        // uncompressed size
    localHeader.setUint16(26, nameBytes.length, true);
    localHeader.setUint16(28, 0, true);           // extra field length

    localParts.push(new Uint8Array(localHeader.buffer), nameBytes, dataBytes);

    // Central directory header
    const centralHeader = new DataView(new ArrayBuffer(46));
    centralHeader.setUint32(0, 0x02014b50, true);
    centralHeader.setUint16(4, 20, true);
    centralHeader.setUint16(6, 20, true);
    centralHeader.setUint16(8, 0, true);
    centralHeader.setUint16(10, 0, true);
    centralHeader.setUint16(12, 0, true);
    centralHeader.setUint16(14, 0, true);
    centralHeader.setUint32(16, crc, true);
    centralHeader.setUint32(20, size, true);
    centralHeader.setUint32(24, size, true);
    centralHeader.setUint16(28, nameBytes.length, true);
    centralHeader.setUint16(30, 0, true);
    centralHeader.setUint16(32, 0, true);
    centralHeader.setUint16(34, 0, true);
    centralHeader.setUint16(36, 0, true);
    centralHeader.setUint32(38, 0, true);
    centralHeader.setUint32(42, offset, true);    // offset of local header

    centralParts.push(new Uint8Array(centralHeader.buffer), nameBytes);

    offset += localHeader.buffer.byteLength + nameBytes.length + dataBytes.length;
  }

  const centralDirSize = centralParts.reduce((sum, p) => sum + p.length, 0);
  const centralDirOffset = offset;

  const endRecord = new DataView(new ArrayBuffer(22));
  endRecord.setUint32(0, 0x06054b50, true);
  endRecord.setUint16(4, 0, true);
  endRecord.setUint16(6, 0, true);
  endRecord.setUint16(8, files.length, true);
  endRecord.setUint16(10, files.length, true);
  endRecord.setUint32(12, centralDirSize, true);
  endRecord.setUint32(16, centralDirOffset, true);
  endRecord.setUint16(20, 0, true);

  const allParts = [...localParts, ...centralParts, new Uint8Array(endRecord.buffer)];
  const totalSize = allParts.reduce((sum, p) => sum + p.length, 0);
  const result = new Uint8Array(totalSize);
  let pos = 0;
  for (const part of allParts) {
    result.set(part, pos);
    pos += part.length;
  }
  return result;
}
