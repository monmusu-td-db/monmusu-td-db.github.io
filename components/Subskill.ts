import * as Data from "./Data";
import jsonSubskill from "@/assets/subskill.json";

interface JsonSubskill extends Partial<JsonSubskillFactors> {
  name: string;
  rarity: string;
  group: string;
  class?: string;
  desc: string;
  features?: JsonSubskillFeature[];
  isGeneral?: boolean;
  isIneffective?: boolean;
}

interface JsonSubskillFeature extends Partial<JsonSubskillFactors> {
  require?: string[];
  exclude?: string[];
}

interface JsonSubskillFactors {
  cost: number;
  hp: number;
  attack: number;
  defense: number;
  resist: number;
  hpAdd: number;
  attackAdd: number;
  defenseAdd: number;
  resistAdd: number;
  hpMul: number;
  attackMul: number;
  defenseMul: number;
  resistMul: number;
  damageFactor: number;
  criChanceAdd: number;
  criDamageAdd: number;
  penetration: number;
  formationHp: number;
  formationAttack: number;
  formationDefense: number;
  formationResist: number;
  attackSpeedBuff: number;
  delayCut: number;
  rangeAdd: number;
  physicalDamageCut: number;
  magicalDamageCut: number;
  physicalEvasion: number;
  magicalEvasion: number;
  initialTimeCut: number;
  cooldown: number;
  moveSpeed: number;
  moveSpeedAdd: number;
  fieldBuffFactor: number;

  isHighBeat: boolean;
  isLimitBreak: boolean;
  isRecharge: boolean;
  isLifeBlock: boolean;
  isDullahanSoul: boolean;
}

const group = {
  attack: "攻撃",
  defense: "防御",
  support: "支援",
} as const;
type Group = (typeof group)[keyof typeof group];
const Group = {
  parse(str: string): Group | undefined {
    return Object.values(group).find((v) => v === str);
  },
} as const;

const subskillFactorKeys = [
  "cost",
  "hp",
  "attack",
  "defense",
  "resist",
  "hpAdd",
  "attackAdd",
  "defenseAdd",
  "resistAdd",
  "hpMul",
  "attackMul",
  "defenseMul",
  "resistMul",
  "damageFactor",
  "criChanceAdd",
  "criDamageAdd",
  "penetration",
  "formationHp",
  "formationAttack",
  "formationDefense",
  "formationResist",
  "attackSpeedBuff",
  "delayMul",
  "rangeAdd",
  "physicalDamageCut",
  "magicalDamageCut",
  "physicalEvasion",
  "magicalEvasion",
  "initialTimeCut",
  "cooldown",
  "moveSpeed",
  "moveSpeedAdd",
  "fieldBuffFactor",

  "isHighBeat",
  "isLimitBreak",
  "isRecharge",
  "isLifeBlock",
  "isDullahanSoul",
] as const;
const subskillFactor = Data.Enum(subskillFactorKeys);
export type SubskillFactorKey = (typeof subskillFactorKeys)[number];
type ISubskillFactors = Record<(typeof subskillFactorKeys)[number], unknown>;

class SubskillFactors implements ISubskillFactors {
  readonly cost: number | undefined;
  readonly hp: number | undefined;
  readonly attack: number | undefined;
  readonly defense: number | undefined;
  readonly resist: number | undefined;
  readonly hpAdd: number | undefined;
  readonly attackAdd: number | undefined;
  readonly defenseAdd: number | undefined;
  readonly resistAdd: number | undefined;
  readonly hpMul: number | undefined;
  readonly attackMul: number | undefined;
  readonly defenseMul: number | undefined;
  readonly resistMul: number | undefined;
  readonly damageFactor: number | undefined;
  readonly criChanceAdd: number | undefined;
  readonly criDamageAdd: number | undefined;
  readonly penetration: number | undefined;
  readonly formationHp: number | undefined;
  readonly formationAttack: number | undefined;
  readonly formationDefense: number | undefined;
  readonly formationResist: number | undefined;
  readonly attackSpeedBuff: number | undefined;
  readonly delayMul: number | undefined;
  readonly rangeAdd: number | undefined;
  readonly physicalDamageCut: number | undefined;
  readonly magicalDamageCut: number | undefined;
  readonly physicalEvasion: number | undefined;
  readonly magicalEvasion: number | undefined;
  readonly initialTimeCut: number | undefined;
  readonly cooldown: number | undefined;
  readonly moveSpeed: number | undefined;
  readonly moveSpeedAdd: number | undefined;
  readonly fieldBuffFactor: number | undefined;

  readonly isHighBeat: boolean | undefined;
  readonly isLimitBreak: boolean | undefined;
  readonly isRecharge: boolean | undefined;
  readonly isLifeBlock: boolean | undefined;
  readonly isDullahanSoul: boolean | undefined;

  constructor(src: Partial<JsonSubskillFactors>) {
    this.cost = src.cost;
    this.hp = src.hp;
    this.attack = src.attack;
    this.defense = src.defense;
    this.resist = src.resist;
    this.hpAdd = src.hpAdd;
    this.attackAdd = src.attackAdd;
    this.defenseAdd = src.defenseAdd;
    this.resistAdd = src.resistAdd;
    this.hpMul = src.hpMul;
    this.attackMul = src.attackMul;
    this.defenseMul = src.defenseMul;
    this.resistMul = src.resistMul;
    this.damageFactor = src.damageFactor;
    this.criChanceAdd = src.criChanceAdd;
    this.criDamageAdd = src.criDamageAdd;
    this.penetration = src.penetration;
    this.formationHp = src.formationHp;
    this.formationAttack = src.formationAttack;
    this.formationDefense = src.formationDefense;
    this.formationResist = src.formationResist;
    this.attackSpeedBuff = src.attackSpeedBuff;
    this.delayMul = src.delayCut !== undefined ? 100 - src.delayCut : undefined;
    this.rangeAdd = src.rangeAdd;
    this.physicalDamageCut = src.physicalDamageCut;
    this.magicalDamageCut = src.magicalDamageCut;
    this.physicalEvasion = src.physicalEvasion;
    this.magicalEvasion = src.magicalEvasion;
    this.initialTimeCut = src.initialTimeCut;
    this.cooldown = src.cooldown;
    this.moveSpeed = src.moveSpeed;
    this.moveSpeedAdd = src.moveSpeedAdd;
    this.fieldBuffFactor = src.fieldBuffFactor;

    this.isHighBeat = src.isHighBeat;
    this.isLimitBreak = src.isLimitBreak;
    this.isRecharge = src.isRecharge;
    this.isLifeBlock = src.isLifeBlock;
    this.isDullahanSoul = src.isDullahanSoul;
  }
}

class SubskillFeature extends SubskillFactors {
  readonly require: string[] | undefined;
  readonly exclude: string[] | undefined;

  constructor(src: JsonSubskillFeature) {
    super(src);
    this.require = src.require;
    this.exclude = src.exclude;
  }
}

class Subskill {
  readonly id: number;
  readonly name: string;
  readonly rarity: Data.Rarity;
  readonly group: Group;
  readonly className: string | undefined;
  readonly desc: string;
  readonly isGeneral: boolean;
  readonly isEffective: boolean;

  private readonly factors: SubskillFactors;
  private readonly features: SubskillFeature[] | undefined;

  constructor(src: JsonSubskill, id: number) {
    this.id = id;
    this.name = src.name;
    this.rarity = Data.Rarity.parse(src.rarity) ?? Data.Rarity.C;
    this.group = Group.parse(src.group) ?? group.attack;
    this.className = src.class;
    this.desc = src.desc;
    this.isGeneral = src.isGeneral ?? false;
    this.isEffective = !(src.isIneffective ?? false);

    this.factors = new SubskillFactors(src);
    this.features = src.features?.map((f) => new SubskillFeature(f));
  }

  getFactor<T extends keyof SubskillFactors>(
    key: T,
    types: (string | undefined)[]
  ): SubskillFactors[T] {
    if (this.features !== undefined) {
      for (const f of this.features) {
        const hasRequirement =
          f.require?.every((r) => types.includes(r)) ?? true;
        const isExcluded = f.exclude?.some((r) => types.includes(r));
        const fac = f[key];
        if (hasRequirement && !isExcluded && fac !== undefined) {
          return fac;
        }
      }
    }
    if (types.includes("トークン")) {
      return;
    }
    return this.factors[key];
  }

  static getItem(id: number): Subskill | undefined {
    return list[id];
  }

  static getList(): readonly Subskill[] {
    return list;
  }

  static isStackable(
    obj1: Subskill | undefined,
    obj2: Subskill | undefined
  ): boolean {
    if (
      obj1?.id === obj2?.id ||
      (obj1?.className !== undefined && obj1?.className === obj2?.className)
    ) {
      return false;
    }
    return true;
  }

  static get keys() {
    return subskillFactor;
  }
}

const list: Subskill[] = jsonSubskill.map(
  (item, index) => new Subskill(item, index)
);

export default Subskill;
