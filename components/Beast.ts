import jsonBeast from "@/assets/beast.json";
import { Enum, Rarity } from "./Data";

interface JsonBeastData extends Partial<JsonBeastFactors> {
  name: string;
  desc: string;
  features?: JsonBeastFeature[];
}

interface JsonBeastFactors {
  cost: number;
  hp: number;
  attack: number;
  defense: number;
  resist: number;
  delayCut: number;
  rangeAdd: number;
  initialTimeCut: number;
  moveSpeedAdd: number;
}

interface JsonBeastFeature extends Partial<JsonBeastFactors> {
  targets: string[];
}

const beastFactorkeys = [
  "cost",
  "hp",
  "attack",
  "defense",
  "resist",
  "delayMul",
  "rangeAdd",
  "initialTimeMul",
  "moveSpeedAdd",
] as const;
export type BeastFactorKeys = (typeof beastFactorkeys)[number];
const beastFactor = Enum(beastFactorkeys);

class BeastFactors implements Record<BeastFactorKeys, number | undefined> {
  readonly cost: number | undefined;
  readonly hp: number | undefined;
  readonly attack: number | undefined;
  readonly defense: number | undefined;
  readonly resist: number | undefined;
  readonly delayMul: number | undefined;
  readonly rangeAdd: number | undefined;
  readonly initialTimeMul: number | undefined;
  readonly moveSpeedAdd: number | undefined;

  constructor(src: Partial<JsonBeastFactors>) {
    this.cost = src.cost;
    this.hp = src.hp;
    this.attack = src.attack;
    this.defense = src.defense;
    this.resist = src.resist;
    this.delayMul = src.delayCut !== undefined ? 100 - src.delayCut : undefined;
    this.rangeAdd = src.rangeAdd;
    this.initialTimeMul =
      src.initialTimeCut !== undefined ? 100 - src.initialTimeCut : undefined;
    this.moveSpeedAdd = src.moveSpeedAdd;
  }
}

class BeastFeature extends BeastFactors {
  readonly targets: string[];

  constructor(src: JsonBeastFeature) {
    super(src);
    this.targets = src.targets;
  }
}

class Beast {
  readonly id: number;
  readonly name: string;
  readonly rarity: Rarity;
  readonly desc: string;

  private readonly factors: BeastFactors;
  private readonly features: BeastFeature[] | undefined;

  constructor(src: JsonBeastData, id: number) {
    this.id = id;
    this.name = src.name;
    this.rarity = Rarity.L;
    this.desc = src.desc;

    this.factors = new BeastFactors(src);
    this.features = src.features?.map((v) => new BeastFeature(v));
  }

  getFactor(
    key: keyof BeastFactors,
    types: (string | undefined)[]
  ): number | undefined {
    if (this.features !== undefined) {
      for (const f of this.features) {
        const hasRequirement = f.targets.some((r) => types.includes(r));
        const fac = f[key];
        if (hasRequirement && fac !== undefined) {
          return fac;
        }
      }
    }
    return this.factors[key];
  }

  static getItem(id: number): Beast | undefined {
    return list[id];
  }

  static getList(): readonly Beast[] {
    return list;
  }

  static get keys() {
    return beastFactor;
  }
}

const list = jsonBeast.map((v, i) => new Beast(v, i));

export default Beast;
