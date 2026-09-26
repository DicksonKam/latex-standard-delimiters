import { readFile } from "node:fs/promises";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const [manifest, packageJson, versions] = await Promise.all([
  readJson("manifest.json"),
  readJson("package.json"),
  readJson("versions.json")
]);

if (manifest.version !== packageJson.version) {
  throw new Error("manifest.json and package.json versions do not match");
}

if (versions[manifest.version] !== manifest.minAppVersion) {
  throw new Error("versions.json does not map the current version to minAppVersion");
}

const tag = process.argv[2];
if (tag && tag !== manifest.version) {
  throw new Error("Release tag must exactly match manifest.version (no v prefix)");
}
