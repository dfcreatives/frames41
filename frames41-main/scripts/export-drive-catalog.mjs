import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT_FOLDER_ID = "14ZUgP1Ib4fgB2vfblViL-j9Hw51fLzeR";
const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const outputDirectory = fileURLToPath(
  new URL("../Client/src/data/", import.meta.url),
);

function decodeDriveData(value) {
  return value
    .replace(/\\x([0-9a-f]{2})/gi, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    )
    .replace(/\\\//g, "/");
}

async function getFolderEntries(folderId) {
  const response = await fetch(
    `https://drive.google.com/drive/folders/${folderId}`,
  );
  if (!response.ok) {
    throw new Error(`Drive folder ${folderId} returned ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/_DRIVE_ivd'\]\s*=\s*'(.*?)';/s);
  if (!match) {
    throw new Error(
      `Could not read Drive folder ${folderId}. Ensure link sharing is public.`,
    );
  }

  const driveData = JSON.parse(decodeDriveData(match[1]));
  return (driveData[0] ?? []).map((entry) => ({
    id: entry[0],
    name: entry[2],
    mimeType: entry[3],
    size: entry[4] ?? null,
  }));
}

async function crawlFolder(folderId, ancestors = []) {
  const entries = await getFolderEntries(folderId);
  const result = [];

  for (const entry of entries) {
    const folderPath = [...ancestors, entry.name];
    result.push({
      ...entry,
      parentFolderId: folderId,
      path: folderPath.join("/"),
    });

    if (entry.mimeType === FOLDER_MIME_TYPE) {
      result.push(...(await crawlFolder(entry.id, folderPath)));
    }
  }

  return result;
}

function nameWithoutExtension(fileName) {
  return fileName.replace(/\.[^.]+$/, "");
}

const items = await crawlFolder(ROOT_FOLDER_ID);
const imageItems = items.filter((item) => item.mimeType.startsWith("image/"));
const products = imageItems.map((image) => {
  const pathParts = image.path.split("/");
  const fileName = pathParts.pop();
  const category = pathParts.at(-1) ?? "Uncategorised";

  return {
    id: image.id,
    name: nameWithoutExtension(fileName),
    category,
    page: pathParts[0] ?? null,
    source: "google-drive",
    imageId: image.id,
    imageUrl: `https://drive.google.com/uc?export=view&id=${image.id}`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${image.id}`,
    drivePath: image.path,
  };
});

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(
    path.join(outputDirectory, "drive-items.json"),
    `${JSON.stringify(items, null, 2)}\n`,
  ),
  writeFile(
    path.join(outputDirectory, "drive-products.json"),
    `${JSON.stringify(products, null, 2)}\n`,
  ),
]);

console.log(
  `Exported ${items.length} Drive items and ${products.length} image products.`,
);
