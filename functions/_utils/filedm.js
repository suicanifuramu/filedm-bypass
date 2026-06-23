const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crc32Table[i] = c;
}

function crc32(data) {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c = crc32Table[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function xorWithKey(str, key) {
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    buf[i] = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
  }
  return buf;
}

export async function getDirectUrl(channel) {
  const html = await fetch(`https://filedm.com/${channel}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}: filedm.com`);
    return r.text();
  });

  const m = html.match(/href="(https:\/\/cleansoftwaredl\.com\/lp\?[^"]+)"/);
  if (!m) throw new Error("LP URL not found");
  const lpUrl = m[1];

  const name = new URL(lpUrl).searchParams.get("id");
  if (!name) throw new Error("id not found in LP URL");

  const params = new URLSearchParams({ request: "getDownloadInfo", name });
  const info = await fetch("https://www.dlsft.com/service.php", {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}: dlsft.com`);
    return r.json();
  });

  const key = "SCI_multipart";
  const xord = xorWithKey(info.id, key);
  const s = crc32(xord).toString(16).padStart(8, "0");

  return `${info.payload}?id=${info.id}&s=${s}`;
}
