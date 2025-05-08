"use client";

import "./Panel.css";
import * as Data from "@/components/Data";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useState,
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
  type ColProps,
} from "react-bootstrap";
import SearchInput from "./SearchInput";
import ModalUI from "@/components/PanelUI";
import {
  FilterCondition,
  FilterEquipment,
  Setting,
  Contexts as StatesContexts,
  type Filter,
  type FilterObject,
  type UISetting,
} from "@/components/States";
import SubskillUI from "@/components/SubskillUI";

const ID = "panel";
const stat = Data.stat;

const tabs = {
  FILTER: "filter",
  UNIT: "unit",
  FORMATION: "formation",
  OTHER: "other",
} as const;

function Panel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<string>(tabs.FILTER);
  const [resetKey, setResetKey] = useState(0);
  const dispatchFilter = StatesContexts.useDispatchFilter();
  const dispatchSetting = StatesContexts.useDispatchSetting();

  function handleReset(): void {
    setResetKey((p) => p + 1);
    switch (tab) {
      case tabs.FILTER:
        dispatchFilter({ type: StatesContexts.FilterAction.reset });
        break;
      case tabs.UNIT:
        dispatchSetting({ type: StatesContexts.SettingAction.resetUnit });
        break;
      case tabs.FORMATION:
        dispatchSetting({ type: StatesContexts.SettingAction.resetFormation });
        break;
      case tabs.OTHER:
        dispatchSetting({ type: StatesContexts.SettingAction.resetOther });
        break;
    }
  }

  return (
    <Collapse in={open}>
      <section id={ID} className="bg-body-tertiary">
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
              <Tab.Pane eventKey={tabs.FORMATION}>AAAA</Tab.Pane>
              <Tab.Pane eventKey={tabs.OTHER}>AAAA</Tab.Pane>
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
  );
}

function TabFilter() {
  const filter = StatesContexts.useFilter();
  const dispatchFilter = StatesContexts.useDispatchFilter();
  const handleChange = useCallback(
    (nextValue: FilterObject) => {
      dispatchFilter({ type: StatesContexts.FilterAction.change, nextValue });
    },
    [dispatchFilter]
  );
  const isSituation = true; // TODO

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
      <ModalUI.FormGroup label="レアリティ">
        <ModalUI.FormCheckboxGroup>
          {Data.Rarity.list.map((v) => {
            const checked = filter.get(v) ?? false;
            return (
              <ModalUI.RarityCheckbox
                key={v}
                rarity={v}
                checked={checked}
                onClick={() => onChange({ [v]: !checked })}
              />
            );
          })}
        </ModalUI.FormCheckboxGroup>
      </ModalUI.FormGroup>
      <ModalUI.FormGroup label="属性">
        <ModalUI.FormCheckboxGroup>
          {Data.Element.list.map((v) => {
            const checked = filter.get(v) ?? false;
            return (
              <ModalUI.ElementCheckbox
                key={v}
                element={v}
                checked={checked}
                onClick={() => onChange({ [v]: !checked })}
              />
            );
          })}
        </ModalUI.FormCheckboxGroup>
      </ModalUI.FormGroup>
      <ModalUI.FormGroup label="基礎クラス">
        <ModalUI.FormCheckboxGroup>
          {Data.ClassName.getBaseKeys().map((k) => {
            const ekeys = Data.ClassName.equipmentKeysOf(k);
            return (
              <ModalUI.FormGrid key={k} xs={4} md={3} lg={2}>
                <ModalUI.FormCheckbox
                  name={k}
                  label={Data.ClassName.baseNames[k]}
                  checked={ekeys.every((ek) => filter.get(ek))}
                  onClick={(v) => {
                    const s: FilterObject = {};
                    ekeys.forEach((ek) => (s[ek] = v));
                    onChange(s);
                  }}
                />
              </ModalUI.FormGrid>
            );
          })}
        </ModalUI.FormCheckboxGroup>
      </ModalUI.FormGroup>
      <ModalUI.FormGroup label="武器">
        <ModalUI.FormCheckboxGroup>
          {FilterEquipment.keys.map((k) => {
            return (
              <ModalUI.FormGrid key={k} xs={4} md={3} lg={2}>
                <ModalUI.FormCheckbox
                  name={k}
                  label={FilterEquipment.names[k]}
                  checked={filter.get(k) ?? false}
                  onClick={(v) => onChange({ [k]: v })}
                />
              </ModalUI.FormGrid>
            );
          })}
        </ModalUI.FormCheckboxGroup>
      </ModalUI.FormGroup>
      {isSituation && conditions.length > 0 && (
        <ModalUI.FormGroup label="状況">
          <ModalUI.FormCheckboxGroup>
            {conditions.map((k) => {
              return (
                <ModalUI.FormCheckbox
                  key={k}
                  name={k}
                  label={FilterCondition.names[k]}
                  checked={filter.get(k) ?? false}
                  onClick={(v) => onChange({ [k]: v })}
                  grid
                />
              );
            })}
          </ModalUI.FormCheckboxGroup>
        </ModalUI.FormGroup>
      )}
      <ModalUI.FormGroup label="タイプ">
        <ModalUI.FormCheckboxGroup>
          {Data.Species.list.map((v) => {
            const checked = filter.get(v) ?? false;
            return (
              <ModalUI.FormCheckbox
                key={v}
                name={v}
                label={Data.Species.name[v]}
                checked={checked}
                onClick={() => onChange({ [v]: !checked })}
                grid
              />
            );
          })}
        </ModalUI.FormCheckboxGroup>
      </ModalUI.FormGroup>
      <ModalUI.FormGroup label="配置タイプ">
        <ModalUI.FormCheckboxGroup>
          {Data.Placement.list.map((v) => {
            const checked = filter.get(v) ?? false;
            return (
              <ModalUI.FormCheckbox
                key={v}
                name={v}
                label={Data.Placement.desc[v]}
                checked={checked}
                onClick={() => onChange({ [v]: !checked })}
                grid
              />
            );
          })}
        </ModalUI.FormCheckboxGroup>
      </ModalUI.FormGroup>
    </Form>
  );
});

function TabUnit() {
  const setting = StatesContexts.useSetting();
  const dispatchSetting = StatesContexts.useDispatchSetting();
  const uISetting = StatesContexts.useUISetting();
  const dispatchUISetting = StatesContexts.useDispatchUISetting();
  const isSituation = true; // TODO

  const handleChangeSetting = useCallback(
    (nextValue: Partial<Setting>) => {
      dispatchSetting({ type: StatesContexts.SettingAction.change, nextValue });
    },
    [dispatchSetting]
  );

  const handleChangeUISetting = useCallback(
    (updater: SetStateAction<UISetting>) => {
      dispatchUISetting({
        type: StatesContexts.UISettingAction.update,
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
  const subSkillColProps: ColProps = {
    xs: 12,
    md: 6,
    xl: 4,
  };

  return (
    <Form>
      <ModalUI.FormGroup label="サブスキル">
        <Col xs={12} sm={10}>
          <Row>
            <Col {...subSkillColProps} className="pb-1 pb-md-0">
              <SubskillUI.Selector
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
              />
            </Col>
            <Col {...subSkillColProps}>
              <SubskillUI.Selector
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
              />
            </Col>
          </Row>
        </Col>
      </ModalUI.FormGroup>
      {isSituation && (
        <>
          <ModalUI.FormGroup label="乗算バフ">
            <Col>
              <Row>
                {[stat.attack, stat.defense, stat.resist].map((v) => (
                  <ModalUI.FormNumber
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
          </ModalUI.FormGroup>
          <ModalUI.FormGroup label="加算バフ">
            <Col>
              <Row>
                {[stat.attack, stat.defense, stat.resist].map((v) => (
                  <ModalUI.FormNumber
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
          </ModalUI.FormGroup>
          <ModalUI.FormGroup label="ダメージ倍率">
            <Col>
              <Row>
                <ModalUI.FormNumber
                  name={"damage-factor"}
                  label={"攻撃倍率"}
                  value={setting.damageFactor}
                  onChange={(n) => onChangeSetting({ damageFactor: n })}
                  isValid={Setting.isValidMul}
                />
                <ModalUI.FormNumber
                  name={"physical-damage-cut"}
                  label={"物理攻撃軽減"}
                  value={setting.physicalDamageCut}
                  onChange={(n) => onChangeSetting({ physicalDamageCut: n })}
                  isValid={Setting.isValidDamageCut}
                />
                <ModalUI.FormNumber
                  name={"magical-damage-cut"}
                  label={"魔法攻撃軽減"}
                  value={setting.magicalDamageCut}
                  onChange={(n) => onChangeSetting({ magicalDamageCut: n })}
                  isValid={Setting.isValidDamageCut}
                />
              </Row>
            </Col>
          </ModalUI.FormGroup>
          <ModalUI.FormGroup label="その他">
            <Col>
              <Row>
                <ModalUI.FormNumber
                  name={"attack-speed-buff"}
                  label={"攻撃速度バフ"}
                  value={setting.attackSpeedBuff}
                  onChange={(n) => onChangeSetting({ attackSpeedBuff: n })}
                  isValid={Setting.isValidMul}
                />
                <ModalUI.FormNumber
                  name={"delay-cut"}
                  label={"待機時間短縮"}
                  value={setting.delayCut}
                  onChange={(n) => onChangeSetting({ delayCut: n })}
                  isValid={Setting.isValidCut}
                />
              </Row>
            </Col>
          </ModalUI.FormGroup>
        </>
      )}
    </Form>
  );
});

const Contexts = {
  Open: createContext(false),
  Toggle: createContext(() => {}),
  useOpen: () => useContext(Contexts.Open),
  useToggle: () => useContext(Contexts.Toggle),
};

export default Object.assign(Panel, {
  ID,
  Contexts,
});
