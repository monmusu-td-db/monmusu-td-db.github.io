import type * as Data from "./Data";
import type {
  AttackDebuff,
  DefresDebuff,
  FeatureRequire,
  RawAdditionFactor,
} from "./Feature";
import type { BuffTargetTag, BuffTypeTag } from "./InBattleBuff";
import type { SituationRequire } from "./Situation";

// ここにunit.jsonをコピペして型チェック可能
//         -> __ <-
const units = [] as const satisfies RawUnits;

/** ユニットデータ */
type RawUnit = RawCommonUnit | RawTokenUnit;

type A = Partial<Omit<RawCommonUnit, keyof RawTokenUnit>>;
type B = Partial<Omit<RawTokenUnit, keyof RawCommonUnit>>;
type RawUnitData = Readonly<
  Omit<RawCommonUnit, keyof A> & Omit<RawTokenUnit, keyof B> & A & B
>;

/** ユニットデータ配列 */
type RawUnits = RawUnit[];

/** ユニット基礎データ */
interface RawUnitBase extends RawUnitFactors {
  /** 無効化フラグ */
  DISABLED?: boolean;

  /** データ補足情報 */
  TODO_DESC?: string;

  /** データ補足情報(修正すべき内容) */
  TODO_FATAL?: string;

  /** 基礎能力値が推測情報 */
  TODO_STAT_INFERRED?: boolean;

  /**
   * 内部ID
   *
   * 通常ユニットの場合、ゲーム内IDを使用
   *
   * トークンの場合、[x000y](x:親ID y:子番号)とする
   */
  id: number;

  /** ユニット名 */
  unitName: string;

  /** ユニット略称 */
  unitShortName: string;

  /** レアリティ */
  rarity: Data.Rarity;

  /**
   * クラス名
   *
   * CC1名で指定
   */
  class?: Data.UnitClassTag;

  /** 属性 */
  element?: Data.Element;

  /** 種族タイプ */
  species?: Data.RawSpecies | readonly Data.RawSpecies[];

  /** 最大HP */
  hp: number;

  /** 攻撃力 */
  attack: number;

  /** 物理防御 */
  defense: number;

  /** 魔法防御 */
  resist: number;

  /** ブロック数 */
  block?: number | null;

  /** 対象数 */
  target?: Data.RawTarget;

  /** 移動タイプ */
  moveType?: Data.MoveType;

  /** 配置タイプ */
  placement?: Data.RawPlacement;

  /** 補足 */
  supplements?: readonly string[];

  /** EXスキル1 */
  exSkill1?: Readonly<RawSkill>;

  /** EXスキル2 */
  exSkill2?: Readonly<RawSkill>;

  /** 特徴一覧 */
  features?: readonly Readonly<RawFeature>[];

  /** イベントユニットフラグ */
  isEventUnit?: boolean;

  /** 回復不可能フラグ */
  isUnhealable?: boolean;

  /** 攻撃待機時間固定値(f) */
  fixedDelay?: number;

  /** 対象数加算効果 */
  targetAdd?: number;

  /** 範囲攻撃 */
  splash?: boolean;

  /** 配置数に含まれない数(0で無制限) */
  deployCount?: number;

  /** 移動コスト */
  moveCost?: number;

  /** 潜在覚醒コンプリート効果 */
  potentialBonus?: Readonly<RawUnitFactors>;

  /** 状況一覧 */
  situations?: RawSituations;

  /** バフ一覧 */
  buffs?: readonly Readonly<RawBuff>[];
}

/** ユニット係数データ */
interface RawUnitFactors {
  /** コスト加算効果 */
  costAdd?: number;

  /** 基礎HP倍率 */
  hpMul?: number;

  /** 基礎攻撃力倍率 */
  attackMul?: number;

  /** 基礎物理防御倍率 */
  defenseMul?: number;

  /** 基礎魔法防御倍率 */
  resistMul?: number;

  /** クリティカル率加算効果 */
  criChanceAdd?: number;

  /** クリティカルダメージ倍率加算効果 */
  criDamageAdd?: number;

  /** 貫通率加算効果 */
  penetrationAdd?: number;

  /**
   * 攻撃速度加算効果
   *
   * (単位はユニット画面の表示と同じ)
   */
  attackSpeedAdd?: number;

  /** 攻撃待機時間倍率 */
  delayMul?: number;

  /** ブロック数加算効果 */
  blockAdd?: number;

  /** 攻撃回数 */
  rounds?: Data.Rounds;

  /** 射程加算効果 */
  rangeAdd?: number;

  /** 物理回避率 */
  physicalEvasion?: number;

  /** 魔法回避率 */
  magicalEvasion?: number;

  /** 移動速度加算効果 */
  moveSpeedAdd?: number;

  /** 移動速度倍率 */
  moveSpeedMul?: number;
}

/** トークン以外のユニットデータ */
interface RawCommonUnit extends RawUnitBase {
  class: Data.UnitClassTag;
  element: Data.Element;
  exSkill1: Readonly<RawSkill>;

  /** 潜在覚醒 */
  potentials: readonly [
    Data.Potential,
    Data.Potential,
    Data.Potential,
    Data.Potential,
    Data.Potential,
  ];

  /** 専用武器データ */
  weapon?: Data.Weapon;

  /** 編成バフデータ */
  formationBuffs?: readonly Readonly<RawFormationBuff>[];
}

/** トークンユニットデータ */
interface RawTokenUnit extends RawUnitBase {
  /** トークン親ID */
  parentId: number;

  /** コスト */
  cost?: number;

  /**
   * 攻撃速度
   *
   * (単位はユニット画面の表示と同じ)
   */
  attackSpeed?: number;

  /** 攻撃待機時間(f) */
  delay?: number;

  /** 射程 */
  range?: number;

  /** 移動速度 */
  moveSpeed?: number;

  /** ダメージ種別 */
  damageType?: Data.RawDamageType;
}

/** スキルデータ */
interface RawSkill {
  /** スキル名 */
  skillName: string;

  /** オーバーチャージフラグ */
  isOverCharge?: boolean;

  /** 状態一覧 */
  conditions?: readonly RawCondition[];

  /** HP乗算バフ */
  hpMul?: number;

  /** 攻撃乗算バフ */
  attackMul?: number;

  /** 物理防御乗算バフ */
  defenseMul?: number;

  /** 魔法防御乗算バフ */
  resistMul?: number;

  /** ダメージ倍率 */
  damageFactor?: number;

  /** クリティカル率加算効果 */
  criChanceAdd?: number;

  /** クリティカルダメージ倍率加算効果 */
  criDamageAdd?: number;

  /** クリティカル率上限加算効果 */
  criChanceLimitAdd?: number;

  /** クリティカルダメージ倍率上限加算効果 */
  criDamageLimitAdd?: number;

  /** 攻撃モーション時間乗算効果 */
  attackMotionMul?: number;

  /** 攻撃速度倍率 */
  attackSpeedBuff?: number;

  /** 攻撃待機時間倍率 */
  delayMul?: number;

  /** 攻撃待機時間固定値(f) */
  fixedDelay?: number;

  /** ブロック数 */
  block?: number;

  /** ブロック数加算効果 */
  blockAdd?: number;

  /** 対象数 */
  target?: Data.RawTarget;

  /** 対象数加算効果 */
  targetAdd?: number;

  /** 攻撃回数 */
  rounds?: Data.Rounds;

  /** 範囲攻撃 */
  splash?: boolean;

  /** 直線上対象攻撃 */
  laser?: boolean;

  /** 射程 */
  range?: number;

  /** 射程倍率 */
  rangeMul?: number;

  /** 物理回避率 */
  physicalEvasion?: number;

  /** 魔法回避率 */
  magicalEvasion?: number;

  /** スキル持続時間(s) */
  duration: Data.RawDuration;

  /** スキル再発動時間(s) */
  cooldown: number;

  /** ダメージ種別 */
  damageType?: Data.RawDamageType;

  /** 補足 */
  supplements?: readonly string[];

  /** スキル特徴一覧 */
  skillFeatures?: readonly Readonly<RawSkillFeature>[];
}

/** スキル特徴 */
interface RawSkillFeature extends Omit<Partial<RawSkill>, "skillFeatures"> {
  /** 特徴セレクター名 */
  featureName: string;
}

/** 編成バフデータ */
interface RawFormationBuff extends RawFormationBuffFactor {
  /** 対象(AND) */
  targets: readonly Data.FormationBuffTarget[];

  /** 前提条件(AND) */
  require?: readonly Data.FormationBuffRequire[];

  /** 潜在覚醒コンプリート効果 */
  potentialBonus?: Readonly<RawFormationBuffFactor>;
}

/** 編成バフ係数データ */
interface RawFormationBuffFactor {
  /** コスト加算効果 */
  cost?: number;

  /** HP倍率 */
  hp?: number;

  /** 攻撃力倍率 */
  attack?: number;

  /** 物理防御倍率 */
  defense?: number;

  /** 魔法防御倍率 */
  resist?: number;

  /** クリティカル率加算効果 */
  criChanceAdd?: number;

  /** クリティカル率上限加算効果 */
  criChanceLimitAdd?: number;

  /** 攻撃待機時間短縮倍率 */
  delay?: number;

  /** 移動速度加算効果 */
  moveSpeed?: number;
}

/** 特徴データ */
interface RawFeature extends RawFeatureFactor {
  /** 特徴セレクター名 */
  featureName?: string;

  /** 前提条件(AND) */
  require?: readonly FeatureRequire[];

  /** 除外条件(OR) */
  exclude?: readonly FeatureRequire[];

  /**
   * EXスキル使用状態
   *
   * -1：スキルと無関係の効果
   *
   * 0：スキル未使用時
   *
   * 1：EXスキル1
   *
   * 2：EXスキル2
   *  */
  skill?: -1 | 0 | 1 | 2;

  /** 味方に影響を及ぼすスキルバフに指定して背景色を設定 */
  isBuffSkill?: boolean;

  /** 必要潜在覚醒(AND) */
  hasPotentials?: readonly Data.Potential[];

  /** 潜在覚醒コンプリート効果 */
  potentialBonus?: Readonly<RawFeatureFactor>;
}

/** 特徴係数データ */
interface RawFeatureFactor {
  /**
   * 補足説明をabilityモードにする
   *
   * (一部の補足を非表示にする)
   *  */
  isAbility?: boolean;

  /** 補足説明をabilityモードで表示しない */
  isNotAbility?: boolean;

  /** クラスやユニット固有の補足説明を無効化 */
  noBaseSupplements?: boolean;

  /** DPSを非表示にする */
  flagNoDps?: boolean;

  /** 加算バフフラグ(攻撃力の前に+を表示) */
  isSupport?: boolean;

  /** 一時的な特徴に指定して背景色を設定 */
  isConditionalBuff?: boolean;

  /** 一時的な特徴に指定して背景色を設定(補足を否定的に設定) */
  isConditionalDebuff?: boolean;

  /** スキル中に指定して背景色を設定 */
  isConditionalSkillBuff?: boolean;

  /** スキル中に指定して背景色を設定(補足を否定的に設定) */
  isConditionalSkillDebuff?: boolean;

  /** 移動中フラグ */
  isMoving?: boolean;

  /** 回復不可能フラグ */
  isUnhealable?: boolean;

  /** 対象数強調表示フラグ */
  flagTargetSkillBuff?: boolean;

  /** スキル再発動時間継続短縮効果を効果時間も有効な設定にする */
  flagCooldownReductionType?: boolean;

  /** マス属性 */
  fieldElements?: readonly Data.Element[];

  /** 注釈 */
  annotations?: readonly string[];

  /** 注釈取り消し */
  deleteAnnotations?: readonly string[];

  /** 状態補足一覧 */
  conditions?: readonly RawCondition[];

  /** 現在HP割合 */
  currentHp?: number;

  /** スキル等段階 */
  phase?: number;

  /** 段階スキル名称 */
  phaseName?: string;

  /** 親ユニットのEXスキル(トークンのみ) */
  parentSkill?: 0 | 1 | 2;

  /** HP乗算バフ */
  hpMul?: number;

  /** 攻撃乗算バフ */
  attackMul?: number;

  /** 物理防御乗算バフ */
  defenseMul?: number;

  /** 魔法防御乗算バフ */
  resistMul?: number;

  /** ダメージ倍率 */
  damageFactor?: number;

  /** 攻撃力加算バフ */
  attackAdd?: number | RawAdditionFactor;

  /** 物理防御加算バフ */
  defenseAdd?: number | RawAdditionFactor;

  /** 魔法防御加算バフ */
  resistAdd?: number | RawAdditionFactor;

  /** 攻撃軽減率 */
  damageCut?: number;

  /** 物理攻撃軽減率 */
  physicalDamageCut?: number;

  /** 魔法攻撃軽減率 */
  magicalDamageCut?: number;

  /** クリティカル率加算効果 */
  criChanceAdd?: number;

  /** クリティカルダメージ倍率加算効果 */
  criDamageAdd?: number;

  /** クリティカル率上限加算効果 */
  criChanceLimitAdd?: number;

  /** クリティカルダメージ倍率上限加算効果 */
  criDamageLimitAdd?: number;

  /** 貫通率加算効果 */
  penetrationAdd?: number;

  /** 攻撃力非依存ダメージ */
  staticDamage?: Readonly<Data.StaticDamage>;

  /** 固定物理防御表示 */
  staticDefense?: Readonly<Data.StaticDamage>;

  /** 固定魔法防御表示 */
  staticResist?: Readonly<Data.StaticDamage>;

  /** 攻撃デバフ効果 */
  attackDebuff?: number | AttackDebuff;

  /** 物理防御デバフ効果 */
  defenseDebuff?: number | DefresDebuff;

  /** 魔法防御デバフ効果 */
  resistDebuff?: number | DefresDebuff;

  /** 被ダメージデバフ倍率 */
  damageDebuff?: number;

  /** 物理被ダメージデバフ倍率 */
  physicalDamageDebuff?: number;

  /** 魔法被ダメージデバフ倍率 */
  magicalDamageDebuff?: number;

  /** 物理回避率 */
  physicalEvasion?: number;

  /** 魔法回避率 */
  magicalEvasion?: number;

  /** 攻撃モーション時間乗算効果 */
  attackMotionMul?: number;

  /** 攻撃速度倍率 */
  attackSpeedBuff?: number;

  /**
   * 攻撃速度加算バフ
   *
   * (単位はユニット画面の表示と同じ)
   *  */
  attackSpeedAgilityBuff?: number;

  /** 攻撃待機時間倍率 */
  delayMul?: number;

  /** 攻撃待機時間固定値(f) */
  fixedDelay?: number;

  /**
   * 攻撃間隔
   *
   * nullで無効化
   *  */
  interval?: number | null;

  /** ブロック数加算効果 */
  blockAdd?: number;

  /** 対象数 */
  target?: Data.RawTarget;

  /** 対象数加算効果 */
  targetAdd?: number;

  /** 固定対象数 */
  fixedTarget?: Data.RawTarget;

  /** 攻撃回数 */
  rounds?: Data.Rounds;

  /** 命中回数 */
  hits?: number;

  /** 範囲攻撃 */
  splash?: boolean;

  /** 範囲攻撃強調フラグ */
  splashEmphasis?: boolean;

  /** 周囲対象攻撃 */
  wideTarget?: boolean;

  /**
   * 射程
   *
   * nullで無効化
   * */
  range?: number | null;

  /** 射程倍率 */
  rangeMul?: number;

  /** 射程加算効果 */
  rangeAdd?: number;

  /** targetの設定にかかわらず、射程を非表示にしない */
  flagRangeIsVisible?: boolean;

  /** スキル初動短縮(秒) */
  initialTimeCut?: number;

  /** 移動速度加算効果 */
  moveSpeedAdd?: number;

  /** 移動速度倍率 */
  moveSpeedMul?: number;

  /** 属性マス効果倍率 */
  fieldBuffFactor?: number;

  /**
   * 効果持続時間(s)
   *
   * nullで効果時間類を非表示
   *  */
  duration?: Data.RawDurationFeature | null;

  /** スキル再発動時間短縮(秒) */
  cooldownCut?: number;

  /** スキル再発動時間継続短縮効果 */
  cooldownReductions?: readonly number[];

  /** ダメージ種別 */
  damageType?: Data.RawDamageType;

  /** 補足 */
  supplements?: readonly string[];

  /** 補足取り消し */
  deleteSupplements?: readonly string[];
}

/** 状況設定 */
interface RawSituation {
  /** クラス状況前提条件(AND) */
  depend: readonly string[];

  /** クラス状況除外条件(OR) */
  exclude: readonly string[];

  /** 前提条件(AND) */
  require: readonly SituationRequire[];

  /**
   * ユニット固有の状況
   *
   * (クラス状況の影響を受けない)
   * 　*/
  proper: boolean;

  /**
   * ユニット固有の状況(最下部に配置)
   *
   * (クラス状況の影響を受けない)
   *  */
  bottom: boolean;

  /**
   * EXスキル使用状態
   *
   * -1：スキルと無関係の効果
   *
   * 0：スキル未使用時
   *
   * 1：EXスキル1
   *
   * 2：EXスキル2
   *  */
  skill: -1 | 0 | 1 | 2;

  /** フィルター状況設定を無視して表示 */
  isGeneral: boolean;

  /**
   * フィルター状況設定を一部無視して表示
   *
   * (クラス特効、斧 被ダメ強化、鞭 防御デバフ)
   */
  isGeneralDefinite: boolean;

  /** 必要潜在覚醒(AND) */
  hasPotentials?: readonly Data.Potential[];

  /** 適用する特徴 */
  features: readonly string[];
}

type RawSituations = readonly Partial<Readonly<RawSituation>>[];

/** バフ設定 */
interface RawBuff extends RawBuffFactor {
  /** 要求条件 */
  require?: readonly string[];

  /**
   * EXスキル使用状態
   *
   * -1：スキルと無関係の効果
   *
   * 0：スキル未使用時
   *
   * 1：EXスキル1
   *
   * 2：EXスキル2
   *  */
  skill?: -1 | 0 | 1 | 2;

  /** 適用する特徴 */
  features?: readonly string[];

  /** 対象 */
  target?: BuffTargetTag;

  /**
   * 射程
   *
   * nullで無効化
   * */
  range?: number | null;

  /** 効果持続時間(s) */
  duration?: number | typeof Data.Duration.always;

  /** 補足 */
  supplements?: readonly string[];

  /** 効果 */
  effects?: readonly RawBuffEffect[];

  /** 潜在覚醒コンプリート効果 */
  potentialBonus?: Omit<
    RawBuff,
    "type" | "require" | "skill" | "potentialBonus"
  >;
}

/** バフ効果設定 */
interface RawBuffFactor {
  /** バフ種別セレクター名 */
  type?: BuffTypeTag;

  /** 効果量 */
  value?: number;

  /** 属性 */
  element?: Data.Element;

  /** 天候 */
  weather?: Data.Weather;

  /** 状態異常フラグ(デフォルト値はtrue) */
  status?: boolean;
}

interface RawBuffEffect extends RawBuffFactor {
  type: BuffTypeTag;

  /** 潜在覚醒コンプリート効果 */
  potentialBonus?: Omit<RawBuffFactor, "potentialBonus">;
}

/** 状況補足データ */
interface RawConditionKvp {
  /** 状況種別 */
  key: Data.ConditionTag;

  /** 効果量 */
  value: number;
}

type RawCondition = Data.ConditionTag | RawConditionKvp;

export default units;
export type {
  RawUnit,
  RawUnitData,
  RawUnits,
  RawUnitFactors,
  RawSituations,
  RawBuff,
  RawBuffFactor,
};
