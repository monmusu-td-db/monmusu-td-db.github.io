import * as Data from "./Data";
import jsonClasses from "@/assets/class.json";
import { Feature, type FeatureOutput, type JsonFeature } from "./Feature";

interface JsonClass {
  className: string
  cost: number
  attackSpeed?: number
  delay?: number
  block?: number
  target?: number | string
  rounds?: Data.JsonRound
  splash?: boolean
  lancerTarget?: boolean
  range?: number
  moveSpeed: number
  moveType?: string
  penetration?: number
  damageType?: Data.JsonDamageType
  placement: Data.JsonPlacement
  supplements?: string[]
  features?: JsonFeature[]
  situations?: JsonClassSituations
}

interface JsonClassSituation {
  features: readonly string[]
}
type JsonClassSituations = readonly Readonly<Partial<JsonClassSituation>>[]

class Class {
  readonly className: string;
  readonly cost: number;
  readonly attackSpeed: number | undefined;
  readonly delay: number | undefined;
  readonly block: number;
  readonly target: Data.TargetBase;
  readonly rounds: Data.Rounds;
  readonly splash: boolean;
  readonly lancerTarget: boolean;
  readonly range: number | undefined;
  readonly moveSpeed: number;
  readonly moveType: Data.MoveType;
  readonly penetration: number;
  readonly damageType: Data.DamageType | undefined;
  readonly placement: Data.Placement;
  readonly supplements: ReadonlySet<string>;
  readonly features: readonly Readonly<FeatureOutput>[];
  readonly situations: JsonClassSituations | undefined;

  constructor(src: Readonly<JsonClass>) {
    this.className = src.className;
    this.cost = src.cost;
    this.attackSpeed = src.attackSpeed;
    this.delay = src.delay;
    this.block = src.block ?? 1;
    this.target = Data.JsonTarget.parse(src.target) ?? 1;
    this.rounds = Data.JsonRound.parse(src.rounds ?? 1);
    this.splash = src.splash ?? false;
    this.lancerTarget = src.lancerTarget ?? false;
    this.range = src.range;
    this.moveSpeed = src.moveSpeed;
    this.moveType = Data.MoveType.parse(src.moveType) ?? Data.MoveType.normal;
    this.penetration = src.penetration ?? 0;
    this.damageType = Data.JsonDamageType.parse(src.damageType) ?? undefined;
    this.placement = Data.JsonPlacement.parse(src.placement);
    this.supplements = new Set(src.supplements);
    this.features = Feature.parseList(src.features ?? []);
    this.situations = src.situations;
  }

  static getItem(value: string): Class | undefined {
    return Class.list.find(v => v.className === value);
  }

  static get list(): readonly Class[] {
    return list;
  }
}

const list = jsonClasses.map(item => new Class(item));

export default Class;
