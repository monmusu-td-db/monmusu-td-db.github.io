"use client";

import "./Panel.css";
import * as Data from "@/components/Data";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
import PanelUI from "@/components/PanelUI";
import {
  FilterCondition,
  FilterEquipment,
  Setting,
  Contexts,
  type Filter,
  type FilterObject,
  type UISetting,
} from "@/components/States";
import SubskillUI from "@/components/SubskillUI";
import BeastUI from "@/components/BeastUI";
import { createPortal } from "react-dom";
import cn from "classnames";

const ID = "panel";
const stat = Data.stat;

const tabs = {
  FILTER: "filter",
  UNIT: "unit",
  FORMATION: "formation",
  OTHER: "other",
} as const;

type PanelProps = { open: boolean; onClose: () => void };

function Panel({ open, onClose }: PanelProps) {
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
      case tabs.OTHER:
        dispatchSetting({ type: Contexts.SettingAction.resetOther });
        break;
    }
  }

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
                <h1 className="panel-label col-12 col-sm-3 text-center pt-1">
                  各種設定
                </h1>
                <Nav
                  variant="underline"
                  justify
                  className="col-12 col-sm-9 ps-3 pe-3 me-auto ms-auto mb-2"
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
                  <Nav.Item>
                    <Nav.Link eventKey={tabs.OTHER}>その他</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Row>
              <Tab.Content>
                <Tab.Pane eventKey={tabs.FILTER}>
                  <TabFilter />
                </Tab.Pane>
                <Tab.Pane eventKey={tabs.UNIT}>
                  <TabUnit key={resetKey} />
                </Tab.Pane>
                <Tab.Pane eventKey={tabs.FORMATION}>
                  <TabFormation key={resetKey} />
                </Tab.Pane>
                <Tab.Pane eventKey={tabs.OTHER}>
                  <TabOther />
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
            <footer>
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

function TabFilter() {
  const filter = Contexts.useFilter();
  const dispatchFilter = Contexts.useDispatchFilter();
  const handleChange = useCallback(
    (nextValue: FilterObject) => {
      dispatchFilter({ type: Contexts.FilterAction.change, nextValue });
    },
    [dispatchFilter]
  );
  const isSituation = PanelContexts.usePageType() === pageType.SITUATION;

  return (
    <_TabFilter
      filter={filter}
      onChange={handleChange}
      isSituation={isSituation}
    />
  );
}

const _TabFilter = memo(function TabFilter({
  filter,
  onChange,
  isSituation,
}: {
  filter: Filter;
  onChange: (nextValue: FilterObject) => void;
  isSituation: boolean;
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
          {Data.ClassName.getBaseKeys().map((k) => {
            const ekeys = Data.ClassName.equipmentKeysOf(k);
            return (
              <PanelUI.FormGrid key={k} xs={4} md={3} lg={2}>
                <PanelUI.FormCheckbox
                  name={k}
                  label={Data.ClassName.baseNames[k]}
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
      <PanelUI.FormGroup label="武器">
        <PanelUI.FormCheckboxGroup>
          {FilterEquipment.keys.map((k) => {
            return (
              <PanelUI.FormGrid key={k} xs={4} md={3} lg={2}>
                <PanelUI.FormCheckbox
                  name={k}
                  label={FilterEquipment.names[k]}
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
                  label={FilterCondition.names[k]}
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
    </Form>
  );
});

function TabUnit() {
  const setting = Contexts.useSetting();
  const dispatchSetting = Contexts.useDispatchSetting();
  const uISetting = Contexts.useUISetting();
  const dispatchUISetting = Contexts.useDispatchUISetting();
  const isSituation = PanelContexts.usePageType() === pageType.SITUATION;

  const handleChangeSetting = useCallback(
    (nextValue: Partial<Setting>) => {
      dispatchSetting({ type: Contexts.SettingAction.change, nextValue });
    },
    [dispatchSetting]
  );

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
    <_TabUnit
      setting={setting}
      onChangeSetting={handleChangeSetting}
      uISetting={uISetting}
      onChangeUISetting={handleChangeUISetting}
      isSituation={isSituation}
    />
  );
}

const _TabUnit = memo(function TabUnit({
  setting,
  onChangeSetting,
  uISetting,
  onChangeUISetting,
  isSituation,
}: {
  setting: Setting;
  onChangeSetting: (nextValue: Partial<Setting>) => void;
  uISetting: UISetting;
  onChangeUISetting: (updater: SetStateAction<UISetting>) => void;
  isSituation: boolean;
}) {
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
                {[stat.attack, stat.defense, stat.resist].map((v) => (
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
                    isAdd
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
          <PanelUI.FormGroup label="その他">
            <Col>
              <Row>
                <PanelUI.FormNumber
                  name={"attack-speed-buff"}
                  label={"攻撃速度バフ"}
                  value={setting.attackSpeedBuff}
                  onChange={(n) => onChangeSetting({ attackSpeedBuff: n })}
                  isValid={Setting.isValidAttackSpeed}
                />
                <PanelUI.FormNumber
                  name={"delay-cut"}
                  label={"待機時間短縮"}
                  value={setting.delayCut}
                  onChange={(n) => onChangeSetting({ delayCut: n })}
                  isValid={Setting.isValidCut}
                />
              </Row>
            </Col>
          </PanelUI.FormGroup>
        </>
      )}
    </Form>
  );
});

function TabFormation() {
  const setting = Contexts.useSetting();
  const dispatch = Contexts.useDispatchSetting();

  const handleChange = useCallback(
    (nextValue: Partial<Setting>) => {
      dispatch({ type: Contexts.SettingAction.change, nextValue });
    },
    [dispatch]
  );

  return <_TabFormation setting={setting} onChange={handleChange} />;
}

const _TabFormation = memo(function _TabFormation({
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
    </Form>
  );
});

function TabOther() {
  const setting = Contexts.useSetting();
  const dispatch = Contexts.useDispatchSetting();
  const isSituation = PanelContexts.usePageType() === pageType.SITUATION;

  const handleChange = useCallback(
    (nextValue: Partial<Setting>) => {
      dispatch({ type: Contexts.SettingAction.change, nextValue });
    },
    [dispatch]
  );

  return (
    <_TabOther
      setting={setting}
      onChange={handleChange}
      isSituation={isSituation}
    />
  );
}

const _TabOther = memo(function _TabOther({
  setting,
  onChange,
  isSituation,
}: {
  setting: Setting;
  onChange: (nextValue: Partial<Setting>) => void;
  isSituation: boolean;
}) {
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
        <PanelUI.FormGroup label="属性マス">
          <Col md={7} className="d-grid">
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
      )}
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

const pageType = {
  SITUATION: "situation",
} as const;
type PageType = typeof pageType.SITUATION | undefined;

const PanelContexts = {
  Open: createContext(false),
  Toggle: createContext(() => {}),
  PageType: createContext<PageType>(undefined),
  useOpen: () => useContext(PanelContexts.Open),
  useToggle: () => useContext(PanelContexts.Toggle),
  usePageType: () => useContext(PanelContexts.PageType),
};

export default Object.assign(Panel, {
  ID,
  Contexts: PanelContexts,
});
