import fs from "node:fs";

const file = fs.readFileSync("./assets/unit.json", {
  encoding: "utf-8",
});
const jsonUnits: JsonUnit[] = JSON.parse(file);
interface JsonUnit {
  id: number;
  species?: string | string[];
  cost?: number;
  hp: number;
}

const SPECIES_NAME = "魔獣";
const targetIds = new Set([
  2, 5, 11, 16, 20, 22, 33, 40, 48, 50, 52, 54, 58, 62, 63, 66, 67, 69, 82, 85,
  86, 90, 93, 104, 116, 132, 135, 183, 184, 191, 193, 203, 232, 241, 249, 269,
  274, 300, 329, 336, 355, 391, 396, 399, 403, 405, 410, 413, 418, 421, 441,
  458, 459, 464,
]);

const species = {
  speciesNone: "なし",
  dragon: "ドラゴン",
  yokai: "妖怪",
  goblin: "ゴブリン",
  kobold: "コボルト",
  alien: "エイリアン",
  fairy: "妖精",
  demon: "悪魔",
  undead: "アンデッド",
  demi: "デミ",
  marine: "海魔",
  freshwater: "水妖",
  mysterious: "ミステリアス",
  beast: "獣神",
  primitive: "魔獣",
  evolution: "進化",
  forbidden: "禁忌",
  visitor: "ビジター",
} as const;
const speciesValues: string[] = Object.values(species);

const result = jsonUnits.map((unit) => {
  if (!targetIds.has(unit.id)) {
    return unit;
  }
  if (!unit.species) {
    const keys = Object.keys(unit);
    const costId = keys.indexOf("cost");
    const hpId = keys.indexOf("hp");
    const index = costId !== -1 ? costId : hpId;
    return insertKey(unit, index, "species", SPECIES_NAME);
  }
  if (Array.isArray(unit.species)) {
    if (!unit.species.includes(SPECIES_NAME)) {
      unit.species.push(SPECIES_NAME);
    }
    return unit;
  }
  if (unit.species === SPECIES_NAME) {
    return unit;
  }
  unit.species = [unit.species, SPECIES_NAME];
  return unit;
}) as JsonUnit[];

result.forEach((unit) => {
  if (Array.isArray(unit.species)) {
    unit.species.sort(
      (a, b) => speciesValues.indexOf(a) - speciesValues.indexOf(b),
    );
  }
});

function insertKey(obj: JsonUnit, index: number, key: string, value: unknown) {
  const entries = Object.entries(obj);
  entries.splice(index, 0, [key, value]);
  return Object.fromEntries(entries);
}

fs.writeFileSync("./assets/unit.json", JSON.stringify(result, null, 2), {
  encoding: "utf-8",
});
