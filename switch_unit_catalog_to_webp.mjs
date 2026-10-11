import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname);
const unitsRoot = path.join(projectRoot, "assets", "units");
const catalogPath = path.join(unitsRoot, "catalog.json");
const manifestsRoot = path.join(unitsRoot, "manifests");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const unitIndex = {};

for (const [unitId, unit] of Object.entries(catalog)) {
    for (const part of unit.parts ?? []) {
        part.src = part.src.replace(/\.png$/i, ".webp");
    }

    unitIndex[unitId] = {
        id: unit.id ?? unitId,
        name: unit.name ?? unitId,
        folder: unit.folder ?? unitId,
        forms: [...new Set((unit.parts ?? []).map((part) => part.form))].sort(),
    };

    fs.writeFileSync(path.join(manifestsRoot, `${unitId}.json`), JSON.stringify(unit));
    fs.writeFileSync(
        path.join(manifestsRoot, `${unitId}.js`),
        `window.UNIT_MANIFESTS ??= {};window.UNIT_MANIFESTS[${JSON.stringify(unitId)}]=${JSON.stringify(unit)};\n`,
    );
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
fs.writeFileSync(path.join(unitsRoot, "catalog.js"), `window.UNIT_CATALOG = ${JSON.stringify(catalog)};\n`);
fs.writeFileSync(path.join(unitsRoot, "index.js"), `window.UNIT_INDEX = ${JSON.stringify(unitIndex)};\n`);
console.log(`Updated ${Object.keys(catalog).length} character manifests to WebP.`);
