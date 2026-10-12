import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const assetsRoot = path.join(projectRoot, "assets");
const unitsRoot = path.join(assetsRoot, "units");
const catalogPath = path.join(unitsRoot, "catalog.json");
const manifestsRoot = path.join(unitsRoot, "manifests");

function readNames(fileName) {
    const filePath = path.join(assetsRoot, fileName);
    const names = new Map();
    for (const line of fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
        const [unitId, unitName] = line.split("\t");
        if (/^\d{3}$/.test(unitId?.trim()) && unitName?.trim()) names.set(unitId.trim(), unitName.trim());
    }
    return names;
}

const japaneseNames = readNames("UnitName_jp.txt");
const koreanNames = readNames("UnitName_kr.txt");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const index = {};
let japaneseFilled = 0;
let koreanFilled = 0;
let stillUnnamed = 0;

for (const [unitId, unit] of Object.entries(catalog)) {
    if (!unit.name?.trim() || unit.name.trim() === unitId) {
        if (japaneseNames.has(unitId)) {
            unit.name = japaneseNames.get(unitId);
            japaneseFilled++;
        } else if (koreanNames.has(unitId)) {
            unit.name = koreanNames.get(unitId);
            koreanFilled++;
        } else {
            stillUnnamed++;
        }
    }

    index[unitId] = {
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
fs.writeFileSync(path.join(unitsRoot, "index.js"), `window.UNIT_INDEX = ${JSON.stringify(index)};\n`);
console.log(`Filled Japanese: ${japaneseFilled}; Korean: ${koreanFilled}; still unnamed: ${stillUnnamed}.`);
