"use client";

import "./Panel.css";
import * as Data from "@/components/Data";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  Button,
  Col,
  Collapse,
  Container,
  Form,
  Nav,
  Row,
  Tab,
} from "react-bootstrap";
import SearchInput from "./SearchInput";
import PanelUI from "@/components/UI/PanelUI";
import {
  FilterCondition,
  FilterUnitClass,
  Setting,
  Contexts,
  type Filter,
  type FilterObject,
  type UISetting,
} from "@/components/States";
import SubskillUI from "@/components/UI/SubskillUI";
import BeastUI from "@/components/UI/BeastUI";
import { createPortal } from "react-dom";
import cn from "classnames";

const ID = "panel";
const stat = Data.stat;

const tabs = {
  FILTER: "filter",
  UNIT: "unit",
  FORMATION: "formation",
  ENEMY: "enemy",
  OTHER: "other",
} as const;

type PanelProps = { open: boolean; onClose: () => void; pageType?: PageType };

function Panel({ open, onClose, pageType }: PanelProps) {
  const [tab, setTab] = useState<string>(tabs.FILTER);
  const [resetKey, setResetKey] = useState(0);
  const dispatchFilter = Contexts.useDispatchFilter();
  const dispatchSetting = Contexts.useDispatchSetting();

  function handleReset(): void {
    setResetKey((p) => p + 1);
    switch (tab) {
      case tabs.FILTER:
        dispatchFilter({ type: Contexts.FilterAction.reset });
        break;
      case tabs.UNIT:
        dispatchSetting({ type: Contexts.SettingAction.resetUnit });
        break;
      case tabs.FORMATION:
        dispatchSetting({ type: Contexts.SettingAction.resetFormation });
        break;
      case tabs.ENEMY:
        dispatchSetting({ type: Contexts.SettingAction.resetEnemy });
        break;
      case tabs.OTHER:
        dispatchSetting({ type: Contexts.SettingAction.resetOther });
        break;
    }
  }

  const isSituation = PageTypeUtil.isSituation(pageType);

  return (
    <>
      <Collapse in={open}>
        <section id={ID} className="bg-body-tertiary panel">
          <Container fluid="sm" className="pb-2">
            <SearchInput className="d-block d-md-none mb-2" />
            <Tab.Container
              activeKey={tab}
              onSelect={(t) => setTab(t ?? tabs.FILTER)}
            >
              <Row as="header">
                <div className="h4 col-12 col-sm-3 text-center pt-1">
                  各種設定
                </div>
                <Nav
                  variant="underline"
                  className="panel-header col-12 col-sm-9 ps-3 pe-3 me-auto ms-auto mb-2"
                >
                  <Nav.Item>
                    <Nav.Link eventKey={tabs.FILTER}>フィルター</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey={tabs.UNIT}>ユニット</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey={tabs.FORMATION}>編成</Nav.Link>
                  </Nav.Item>
                  {isSituation && (
                    <Nav.Item>
                      <Nav.Link eventKey={tabs.ENEMY}>敵</Nav.Link>
                    </Nav.Item>
                  )}
                  <Nav.Item>
                    <Nav.Link eventKey={tabs.OTHER}>その他</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Row>
              <Tab.Content>
                <Tab.Pane eventKey={tabs.FILTER}>
                  <TabFilter isSituation={isSituation} />
                </Tab.Pane>
                <Tab.Pane eventKey={tabs.UNIT}>
                  <TabUnit key={resetKey} pageType={pageType} />
                </Tab.Pane>
                <Tab.Pane eventKey={tabs.FORMATION}>
                  <TabFormation key={resetKey} />
                </Tab.Pane>
                <Tab.Pane eventKey={tabs.ENEMY}>
                  <TabEnemy key={resetKey} />
                </Tab.Pane>
                <Tab.Pane eventKey={tabs.OTHER}>
                  <TabOther key={resetKey} isSituation={isSituation} />
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
            <footer className="my-3">
              <div className="d-flex justify-content-end">
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  className="me-3"
                >
                  リセット
                </Button>
                <Button variant="primary" onClick={onClose}>
                  閉じる
                </Button>
              </div>
            </footer>
          </Container>
        </section>
      </Collapse>
      <Backdrop open={open} onClose={onClose} />
    </>
  );
}

function TabFilter({ isSituation }: { isSituation: boolean }) {
  const filter = Contexts.useFilter();
  const dispatchFilter = Contexts.useDispatchFilter();
  const handleChange = useCallback(
    (nextValue: FilterObject) => {
      dispatchFilter({ type: Contexts.FilterAction.change, nextValue });
    },
    [dispatchFilter]
  );
  const setting = Contexts.useSetting();

  return (
    <TabFilterContent
      filter={filter}
      onChange={handleChange}
      isSituation={isSituation}
      setting={setting}
    />
  );
}

const TabFilterContent = memo(function TabFilterContent({
  filter,
  onChange,
  isSituation,
  setting,
}: {
  filter: Filter;
  onChange: (nextValue: FilterObject) => void;
  isSituation: boolean;
  setting: Setting;
}) {
  const conditions = FilterCondition.getVisibleItems(filter);

  return (
    <Form>
      <PanelUI.FormGroup label="レアリティ">
        <PanelUI.FormCheckboxGroup>
          {Data.Rarity.list.map((v) => {
            const checked = filter.get(v) ?? false;
            return (
              <PanelUI.RarityCheckbox
                key={v}
                rarity={v}
                checked={checked}
                onClick={() => onChange({ [v]: !checked })}
              />
            );
          })}
        </PanelUI.FormCheckboxGroup>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="属性">
        <PanelUI.FormCheckboxGroup>
          {Data.Element.list.map((v) => {
            const checked = filter.get(v) ?? false;
            return (
              <PanelUI.ElementCheckbox
                key={v}
                element={v}
                checked={checked}
                onClick={() => onChange({ [v]: !checked })}
              />
            );
          })}
        </PanelUI.FormCheckboxGroup>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="基礎クラス">
        <PanelUI.FormCheckboxGroup>
          {Data.UnitBaseClass.keys.map((k) => {
            const ekeys = Data.UnitBaseClass.getEquipmentKeys(k);
            return (
              <PanelUI.FormGrid key={k} xs={4} md={3} lg={2}>
                <PanelUI.FormCheckbox
                  name={k}
                  label={Data.UnitBaseClass.tag[k]}
                  checked={ekeys.every((ek) => filter.get(ek))}
                  onClick={(v) => {
                    const s: FilterObject = {};
                    ekeys.forEach((ek) => (s[ek] = v));
                    onChange(s);
                  }}
                />
              </PanelUI.FormGrid>
            );
          })}
        </PanelUI.FormCheckboxGroup>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup
        label={Data.StatType.headerNameOf(stat.className, setting)}
      >
        <PanelUI.FormCheckboxGroup>
          {FilterUnitClass.keys.map((k) => {
            let label;
            switch (setting.classNameType) {
              case Setting.TYPE_CC1:
                label = Data.UnitClass.tag[k];
                break;
              case Setting.TYPE_CC4:
                label = Data.UnitClass.cc4Name[k];
                break;
              case Setting.TYPE_EQUIPMENT:
                label = Data.UnitClass.equipment[k];
                break;
            }
            return (
              <PanelUI.FormGrid key={k} xs={4} md={3} lg={2}>
                <PanelUI.FormCheckbox
                  name={k}
                  label={label}
                  checked={filter.get(k) ?? false}
                  onClick={(v) => onChange({ [k]: v })}
                />
              </PanelUI.FormGrid>
            );
          })}
        </PanelUI.FormCheckboxGroup>
      </PanelUI.FormGroup>
      {isSituation && conditions.length > 0 && (
        <PanelUI.FormGroup label="状況">
          <PanelUI.FormCheckboxGroup>
            {conditions.map((k) => {
              return (
                <PanelUI.FormCheckbox
                  key={k}
                  name={k}
                  label={FilterCondition.getName(k, filter)}
                  checked={filter.get(k) ?? false}
                  onClick={(v) => onChange({ [k]: v })}
                  grid
                />
              );
            })}
          </PanelUI.FormCheckboxGroup>
        </PanelUI.FormGroup>
      )}
      <PanelUI.FormGroup label="タイプ">
        <PanelUI.FormCheckboxGroup>
          {Data.Species.list.map((v) => {
            const checked = filter.get(v) ?? false;
            return (
              <PanelUI.FormCheckbox
                key={v}
                name={v}
                label={Data.Species.name[v]}
                checked={checked}
                onClick={() => onChange({ [v]: !checked })}
                grid
              />
            );
          })}
        </PanelUI.FormCheckboxGroup>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="攻撃属性">
        <PanelUI.FormCheckboxGroup>
          {Data.DamageType.list
            .filter((v) => {
              if (!isSituation) {
                switch (v) {
                  case Data.DamageType.keys.regenerate:
                  case Data.DamageType.keys.absorb:
                    return false;
                }
              }
              return true;
            })
            .map((v) => {
              const checked = filter.get(v) ?? false;
              return (
                <PanelUI.FormCheckbox
                  key={v}
                  name={v}
                  label={Data.DamageType[v]}
                  checked={checked}
                  onClick={() => onChange({ [v]: !checked })}
                  grid
                />
              );
            })}
        </PanelUI.FormCheckboxGroup>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="移動タイプ">
        <PanelUI.FormCheckboxGroup>
          {Data.MoveType.filterKeys.map((v) => {
            const checked = filter.get(v) ?? false;
            const key = Data.MoveType.parseFilterKey(v);
            return (
              <PanelUI.FormCheckbox
                key={v}
                name={v}
                label={Data.MoveType[key]}
                checked={checked}
                onClick={() => onChange({ [v]: !checked })}
                grid
              />
            );
          })}
        </PanelUI.FormCheckboxGroup>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="配置タイプ">
        <PanelUI.FormCheckboxGroup>
          {Data.Placement.list.map((v) => {
            const checked = filter.get(v) ?? false;
            return (
              <PanelUI.FormCheckbox
                key={v}
                name={v}
                label={Data.Placement.desc[v]}
                checked={checked}
                onClick={() => onChange({ [v]: !checked })}
                grid
              />
            );
          })}
        </PanelUI.FormCheckboxGroup>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="トークン">
        <PanelUI.FormCheckboxGroup>
          {Data.TokenType.list.map((v) => {
            const checked = filter.get(v) ?? false;
            return (
              <PanelUI.FormCheckbox
                key={v}
                name={v}
                label={Data.TokenType.desc[v]}
                checked={checked}
                onClick={() => onChange({ [v]: !checked })}
                grid
              />
            );
          })}
        </PanelUI.FormCheckboxGroup>
      </PanelUI.FormGroup>
    </Form>
  );
});

function TabUnit({ pageType }: { pageType: PageType }) {
  const [setting, handleChangeSetting] = useSettingChange();
  const uISetting = Contexts.useUISetting();
  const dispatchUISetting = Contexts.useDispatchUISetting();

  const handleChangeUISetting = useCallback(
    (updater: SetStateAction<UISetting>) => {
      dispatchUISetting({
        type: Contexts.UISettingAction.update,
        updater,
      });
    },
    [dispatchUISetting]
  );

  return (
    <TabUnitContent
      setting={setting}
      onChangeSetting={handleChangeSetting}
      uISetting={uISetting}
      onChangeUISetting={handleChangeUISetting}
      pageType={pageType}
    />
  );
}

const TabUnitContent = memo(function TabUnitContent({
  setting,
  onChangeSetting,
  uISetting,
  onChangeUISetting,
  pageType,
}: {
  setting: Setting;
  onChangeSetting: (nextValue: Partial<Setting>) => void;
  uISetting: UISetting;
  onChangeUISetting: (updater: SetStateAction<UISetting>) => void;
  pageType: PageType;
}) {
  const isSituation = PageTypeUtil.isSituation(pageType);
  const isBuff = PageTypeUtil.isBuff(pageType);

  return (
    <Form>
      <PanelUI.CardButtonGroup label="サブスキル">
        {[
          <SubskillUI.Selector
            key={1}
            id={setting.subskill1}
            uiSetting={uISetting}
            onSelect={useCallback(
              (id) => onChangeSetting({ subskill1: id }),
              [onChangeSetting]
            )}
            onChangeUI={useCallback(
              (updater) => onChangeUISetting(updater),
              [onChangeUISetting]
            )}
          />,
          <SubskillUI.Selector
            key={2}
            id={setting.subskill2}
            uiSetting={uISetting}
            onSelect={useCallback(
              (id) => onChangeSetting({ subskill2: id }),
              [onChangeSetting]
            )}
            onChangeUI={useCallback(
              (updater) => onChangeUISetting(updater),
              [onChangeUISetting]
            )}
          />,
        ]}
      </PanelUI.CardButtonGroup>
      {isSituation && (
        <>
          <PanelUI.FormGroup label="乗算バフ">
            <Col>
              <Row>
                {[stat.attack, stat.defense, stat.resist].map((v) => (
                  <PanelUI.FormNumber
                    key={v}
                    name={`${v}-mul-buff`}
                    label={Data.BaseStatType.name[v]}
                    value={setting[Data.BaseStatType.mulKey[v]]}
                    onChange={(n) =>
                      onChangeSetting({
                        [Data.BaseStatType.mulKey[v]]: n,
                      })
                    }
                    isValid={Setting.isValidMul}
                  />
                ))}
              </Row>
            </Col>
          </PanelUI.FormGroup>
          <PanelUI.FormGroup label="加算バフ">
            <Col>
              <Row>
                {[stat.hp, stat.attack, stat.defense, stat.resist].map((v) => (
                  <PanelUI.FormNumber
                    key={v}
                    name={`${v}-add-buff`}
                    label={Data.BaseStatType.name[v]}
                    value={setting[Data.BaseStatType.addKey[v]]}
                    onChange={(n) =>
                      onChangeSetting({
                        [Data.BaseStatType.addKey[v]]: n,
                      })
                    }
                    isValid={Setting.isValidAdd}
                    sign=""
                  />
                ))}
              </Row>
            </Col>
          </PanelUI.FormGroup>
          <PanelUI.FormGroup label="ダメージ倍率">
            <Col>
              <Row>
                <PanelUI.FormNumber
                  name={"damage-factor"}
                  label={"攻撃倍率"}
                  value={setting.damageFactor}
                  onChange={(n) => onChangeSetting({ damageFactor: n })}
                  isValid={Setting.isValidMul}
                />
                <PanelUI.FormNumber
                  name={"physical-damage-cut"}
                  label={"物理攻撃軽減"}
                  value={setting.physicalDamageCut}
                  onChange={(n) => onChangeSetting({ physicalDamageCut: n })}
                  isValid={Setting.isValidDamageCut}
                />
                <PanelUI.FormNumber
                  name={"magical-damage-cut"}
                  label={"魔法攻撃軽減"}
                  value={setting.magicalDamageCut}
                  onChange={(n) => onChangeSetting({ magicalDamageCut: n })}
                  isValid={Setting.isValidDamageCut}
                />
              </Row>
            </Col>
          </PanelUI.FormGroup>
        </>
      )}
      {(isSituation || isBuff) && (
        <PanelUI.FormGroup label="その他">
          <Col>
            <Row>
              {isSituation && (
                <>
                  <PanelUI.FormNumber
                    name={"attack-speed-buff"}
                    label={"攻撃速度バフ"}
                    value={setting.attackSpeedBuff}
                    onChange={(n) => onChangeSetting({ attackSpeedBuff: n })}
                    isValid={Setting.isValidMul}
                  />
                  <PanelUI.FormNumber
                    name={"delay-cut"}
                    label={"待機時間短縮"}
                    value={setting.delayCut}
                    onChange={(n) => onChangeSetting({ delayCut: n })}
                    isValid={Setting.isValidCut}
                  />
                </>
              )}
              <PanelUI.FormNumber
                name={"cooldown-cut"}
                label={"スキルCT短縮"}
                value={setting.cooldownCut}
                onChange={(n) => onChangeSetting({ cooldownCut: n })}
                isValid={Setting.isValidCooldownCut}
                sign="秒"
              />
            </Row>
          </Col>
        </PanelUI.FormGroup>
      )}
    </Form>
  );
});

function TabFormation() {
  const [setting, handleChange] = useSettingChange();

  return <TabFormationContent setting={setting} onChange={handleChange} />;
}

const TabFormationContent = memo(function TabFormationContent({
  setting,
  onChange,
}: {
  setting: Setting;
  onChange: (nextValue: Partial<Setting>) => void;
}) {
  return (
    <Form>
      <PanelUI.CardButtonGroup label="獣神">
        {[
          <BeastUI.Selector
            key={1}
            id={setting.mainBeast}
            onSelect={(n) => {
              switch (n) {
                case -1:
                case setting.subBeast:
                  onChange({
                    mainBeast: n,
                    subBeast: -1,
                  });
                  break;
                default:
                  onChange({ mainBeast: n });
                  break;
              }
            }}
            isMain
          />,
          <BeastUI.Selector
            key={2}
            id={setting.subBeast}
            onSelect={(n) => {
              if (setting.mainBeast === -1) {
                onChange({ mainBeast: n });
              } else {
                onChange({ subBeast: n });
              }
            }}
          />,
        ]}
      </PanelUI.CardButtonGroup>
      <PanelUI.FormGroup label="獣神バフ">
        <Col>
          <Row>
            <PanelUI.FormSelect
              name="s-possAmount"
              label="所持数"
              value={setting.possBuffAmount}
              onChange={(e) =>
                onChange({
                  possBuffAmount: Number.parseInt(e.target.value),
                })
              }
            >
              <option value={-1}>適用しない</option>
              <PanelUI.SelectOptions value={9} />
              <option value={10}>10以上</option>
            </PanelUI.FormSelect>
            <PanelUI.FormSelect
              name="s-possLevel"
              label="レベル"
              value={setting.possBuffLevel}
              onChange={(e) =>
                onChange({
                  possBuffLevel: Number.parseInt(e.target.value),
                })
              }
              disabled={setting.possBuffAmount === -1}
            >
              <PanelUI.SelectOptions value={Data.MAX_POSS_BUFF_LEVEL} />
            </PanelUI.FormSelect>
          </Row>
        </Col>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="編成バフ">
        <Col>
          <Row>
            {Data.BaseStatType.list.map((v) => (
              <PanelUI.FormNumber
                key={v}
                name={`formation-${v}`}
                label={Data.BaseStatType.name[v]}
                value={setting[Setting.formation.key[v]]}
                onChange={(n) =>
                  onChange({
                    [Setting.formation.key[v]]: n,
                  })
                }
                isValid={Setting.isValidMul}
              />
            ))}
          </Row>
        </Col>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="タイプボーナス">
        <Col sm={9} md={6} lg={4} className="d-grid">
          <PanelUI.FormRadio
            name="formation-type-bonus"
            items={["適用する", "適用しない"]}
            value={setting.typeBonus === Setting.TYPE_ENABLED ? 0 : 1}
            onChange={(v) =>
              onChange({
                typeBonus:
                  v === 0 ? Setting.TYPE_ENABLED : Setting.TYPE_DISABLED,
              })
            }
          />
        </Col>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="同一属性編成">
        <Col sm={9} md={7} lg={5} className="d-grid">
          <PanelUI.FormRadio
            name="formation-element"
            items={["8体以上編成", "適用しない"]}
            value={setting.sameElement === 8 ? 0 : 1}
            onChange={(v) => onChange({ sameElement: v === 0 ? 8 : 0 })}
          />
        </Col>
      </PanelUI.FormGroup>
    </Form>
  );
});

function TabEnemy() {
  const [setting, handleChange] = useSettingChange();

  return <TabEnemyContent setting={setting} onChange={handleChange} />;
}

const TabEnemyContent = memo(function TabEnemyContent({
  setting,
  onChange,
}: {
  setting: Setting;
  onChange: (nextValue: Partial<Setting>) => void;
}) {
  return (
    <Form>
      <PanelUI.FormGroup label="敵防御力">
        <Col>
          <Row>
            {([1, 2, 3, 4, 5] as const).map((i) => {
              const name = `dps-${i}`;
              const key = Setting.getDpsKey(i);
              return (
                <PanelUI.FormNumber
                  key={i}
                  name={name}
                  label={name}
                  labelHidden
                  value={setting[key]}
                  defaultValue={Setting.defaultValue[key]}
                  onChange={(n) =>
                    onChange({
                      [key]: n,
                    })
                  }
                  isValid={Setting.isValidDps}
                  sign={i}
                  leftButton
                />
              );
            })}
          </Row>
        </Col>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="ダメージ耐性">
        <Col>
          <Row>
            <PanelUI.FormNumber
              name={"enemy-damage-cut"}
              label={"ダメージ軽減"}
              value={setting.enemyDamageCut}
              onChange={(n) => onChange({ enemyDamageCut: n })}
              isValid={Setting.isValidDamageCutPos}
            />
            <PanelUI.FormNumber
              name={"enemy-physical-damage-cut"}
              label={"物理攻撃軽減"}
              value={setting.enemyPhysicalDamageCut}
              onChange={(n) => onChange({ enemyPhysicalDamageCut: n })}
              isValid={Setting.isValidDamageCutPos}
            />
            <PanelUI.FormNumber
              name={"enemy-magical-damage-cut"}
              label={"魔法攻撃軽減"}
              value={setting.enemyMagicalDamageCut}
              onChange={(n) => onChange({ enemyMagicalDamageCut: n })}
              isValid={Setting.isValidDamageCutPos}
            />
          </Row>
        </Col>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="ダメージ耐性デバフ">
        <Col>
          <Row>
            <PanelUI.FormNumber
              name={"enemy-damage-debuff"}
              label={"ダメージ耐性減少"}
              value={setting.damageDebuff}
              onChange={(n) => onChange({ damageDebuff: n })}
              isValid={Setting.isValidMul}
            />
            <PanelUI.FormNumber
              name={"enemy-physical-damage-debuff"}
              label={"物理耐性減少"}
              value={setting.physicalDamageDebuff}
              onChange={(n) => onChange({ physicalDamageDebuff: n })}
              isValid={Setting.isValidMul}
            />
            <PanelUI.FormNumber
              name={"enemy-magical-damage-debuff"}
              label={"魔法耐性減少"}
              value={setting.magicalDamageDebuff}
              onChange={(n) => onChange({ magicalDamageDebuff: n })}
              isValid={Setting.isValidMul}
            />
          </Row>
        </Col>
      </PanelUI.FormGroup>
    </Form>
  );
});

function TabOther({ isSituation }: { isSituation: boolean }) {
  const [setting, handleChange] = useSettingChange();

  return (
    <TabOtherContent
      setting={setting}
      onChange={handleChange}
      isSituation={isSituation}
    />
  );
}

const TabOtherContent = memo(function TabOtherContent({
  setting,
  onChange,
  isSituation,
}: {
  setting: Setting;
  onChange: (nextValue: Partial<Setting>) => void;
  isSituation: boolean;
}) {
  const storageOption = Contexts.useSaveOption();
  const setStorageOption = Contexts.useSetSaveOption();

  function getTypeValue(value: string) {
    switch (value) {
      default:
        return 0;
      case Setting.PARTIAL:
        return 1;
      case Setting.NONE:
        return 2;
    }
  }
  function getTypeName(value: number) {
    switch (value) {
      default:
        return Setting.ALL;
      case 1:
        return Setting.PARTIAL;
      case 2:
        return Setting.NONE;
    }
  }

  return (
    <Form>
      <PanelUI.FormGroup label="潜在覚醒">
        <Col md={7} className="d-grid">
          <PanelUI.FormRadio
            name="s-potential"
            items={[
              "全員に適用",
              <>
                E以下orイベユニのみ
                <span className="d-none d-sm-inline">適用</span>
              </>,
              "適用しない",
            ]}
            value={getTypeValue(setting.potential)}
            onChange={(v) => onChange({ potential: getTypeName(v) })}
          />
        </Col>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="専用武器">
        <Col md={7} className="d-grid">
          <PanelUI.FormRadio
            name="s-weapon"
            items={["武器強化を適用", "基礎性能のみ適用", "適用しない"]}
            value={getTypeValue(setting.weapon)}
            onChange={(v) => onChange({ weapon: getTypeName(v) })}
          />
        </Col>
      </PanelUI.FormGroup>
      {isSituation && (
        <>
          <PanelUI.FormGroup label="属性マス">
            <Col sm={8} md={5} className="d-grid">
              <PanelUI.FormRadio
                name="s-field-element"
                items={["無属性", "ユニットと同属性"]}
                value={setting.fieldElement === Setting.NONE ? 0 : 1}
                onChange={(v) =>
                  onChange({
                    fieldElement: v === 0 ? Setting.NONE : Setting.SAME,
                  })
                }
              />
            </Col>
          </PanelUI.FormGroup>
        </>
      )}
      <PanelUI.FormGroup label="クラス名表示">
        <Col sm={8} md={5} className="d-grid">
          <PanelUI.FormRadio
            name="s-class-name-type"
            items={["CC1", "CC4", "武器種"]}
            value={(() => {
              switch (setting.classNameType) {
                case Setting.TYPE_CC1:
                  return 0;
                case Setting.TYPE_CC4:
                  return 1;
                case Setting.TYPE_EQUIPMENT:
                  return 2;
              }
            })()}
            onChange={(v) => {
              let ret;
              switch (v) {
                case 0:
                  ret = Setting.TYPE_CC1;
                  break;
                case 1:
                  ret = Setting.TYPE_CC4;
                  break;
                default:
                  ret = Setting.TYPE_EQUIPMENT;
                  break;
              }
              onChange({ classNameType: ret });
            }}
          />
        </Col>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label="設定の保存">
        <Col sm={6} md={3} className="d-grid">
          <PanelUI.FormRadio
            name="s-storage"
            items={["する", "しない"]}
            value={storageOption === Setting.STORAGE_LOCAL ? 0 : 1}
            onChange={(v) =>
              setStorageOption(
                v === 0 ? Setting.STORAGE_LOCAL : Setting.STORAGE_SESSION
              )
            }
          />
        </Col>
      </PanelUI.FormGroup>
    </Form>
  );
});

function Backdrop({ open, onClose }: PanelProps) {
  const [item, setItem] = useState<ReactNode>();

  useEffect(() => {
    setItem(
      <>
        {createPortal(
          <div
            className={cn("fade modal-backdrop panel-backdrop", {
              show: open,
              "pe-none": !open,
            })}
            onClick={onClose}
          />,
          document.body
        )}
      </>
    );
  }, [open, onClose]);

  return item;
}

function useSettingChange() {
  const setting = Contexts.useSetting();
  const dispatch = Contexts.useDispatchSetting();

  const handleChange = useCallback(
    (nextValue: Partial<Setting>) => {
      dispatch({ type: Contexts.SettingAction.change, nextValue });
    },
    [dispatch]
  );

  return [setting, handleChange] as const;
}

const pageTypes = {
  SITUATION: "situation",
  BUFF: "buff",
} as const;
export type PageType = (typeof pageTypes)[keyof typeof pageTypes] | undefined;
class PageTypeUtil {
  static isSituation(pageType: PageType) {
    return pageType === pageTypes.SITUATION;
  }

  static isBuff(pageType: PageType) {
    return pageType === pageTypes.BUFF;
  }
}

const PanelContexts = {
  Open: createContext(false),
  SetOpen: createContext<(action: SetStateAction<boolean>) => void>(() => {}),
  useOpen: () => useContext(PanelContexts.Open),
  useSetOpen: () => useContext(PanelContexts.SetOpen),
};

export default Object.assign(Panel, {
  ID,
  Contexts: PanelContexts,
  pageType: pageTypes,
});
