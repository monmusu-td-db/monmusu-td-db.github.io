import {
  memo,
  useCallback,
  useState,
  type ChangeEventHandler,
  type ReactNode,
} from "react";
import {
  Button,
  Col,
  Form,
  FormGroup,
  FormLabel,
  InputGroup,
  Modal,
  Nav,
  Row,
  Tab,
} from "react-bootstrap";
import {
  type Filter,
  FilterEquipment,
  HandleChange,
  Setting,
  type FilterObject,
  type UISetting,
  FilterCondition,
  Contexts,
} from "./States";
import * as Data from "./Data";
import Styles from "./styles.module.css";
import SubskillUI from "./SubskillUI";
import BeastUI from "./BeastUI";
import ModalUI from "./ModalUI";

const stat = Data.stat;

const tabs = {
  FILTER: "filter",
  UNIT: "unit",
  FORMATION: "formation",
  OTHER: "other",
} as const;

export default function SettingPanel({
  show,
  handleClose,
  setting,
  uISetting,
  onChange,
  isSituation,
}: {
  show: boolean;
  handleClose: () => void;
  setting: Setting;
  uISetting: UISetting;
  onChange: HandleChange;
  isSituation: boolean;
}) {
  const [tab, setTab] = useState<string>(tabs.FILTER);
  const [resetKey, setResetKey] = useState(0);

  function handleReset(): void {
    setResetKey((p) => p + 1);
    switch (tab) {
      case tabs.FILTER:
        onChange(HandleChange.RESET_FILTER);
        break;
      case tabs.UNIT:
        onChange(HandleChange.RESET_SETTING_UNIT);
        break;
      case tabs.FORMATION:
        onChange(HandleChange.RESET_SETTING_FORMATION);
        break;
      case tabs.OTHER:
        onChange(HandleChange.RESET_SETTING_OTHER);
        break;
    }
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      dialogClassName={Styles.modal ?? ""}
      scrollable
    >
      <Tab.Container activeKey={tab} onSelect={(t) => setTab(t ?? tabs.FILTER)}>
        <Modal.Header closeButton>
          <Modal.Title>各種設定</Modal.Title>
          <Nav variant="underline" justify className="col-8 ms-auto me-auto">
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
        </Modal.Header>
        <Modal.Body>
          <Tab.Content>
            <Tab.Pane eventKey={tabs.FILTER}>
              <TabFilter isSituation={isSituation} />
            </Tab.Pane>
            <Tab.Pane eventKey={tabs.UNIT}>
              <TabUnit
                key={resetKey}
                setting={setting}
                uISetting={uISetting}
                onChange={onChange}
                isSituation={isSituation}
              />
            </Tab.Pane>
            <Tab.Pane eventKey={tabs.FORMATION}>
              <TabFormation
                setting={setting}
                onChange={onChange}
                key={resetKey}
              />
            </Tab.Pane>
            <Tab.Pane eventKey={tabs.OTHER}>
              <TabOther
                setting={setting}
                onChange={onChange}
                isSituation={isSituation}
              />
            </Tab.Pane>
          </Tab.Content>
        </Modal.Body>
      </Tab.Container>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleReset}>
          リセット
        </Button>
        <Button variant="primary" onClick={handleClose}>
          閉じる
        </Button>
      </Modal.Footer>
    </Modal>
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

  return (
    <_TabFilter
      filter={filter}
      handleChange={handleChange}
      isSituation={isSituation}
    />
  );
}

const _TabFilter = memo(function _TabFilter({
  filter,
  handleChange,
  isSituation,
}: {
  filter: Filter;
  handleChange: (nextValue: FilterObject) => void;
  isSituation: boolean;
}) {
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
                onClick={() => handleChange({ [v]: !checked })}
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
                onClick={() => handleChange({ [v]: !checked })}
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
              <ModalUI.FormCheckbox
                key={k}
                name={k}
                label={Data.ClassName.baseNames[k]}
                checked={ekeys.every((ek) => filter.get(ek))}
                onClick={(v) => {
                  const s: FilterObject = {};
                  ekeys.forEach((ek) => (s[ek] = v));
                  handleChange(s);
                }}
                grid
              />
            );
          })}
        </ModalUI.FormCheckboxGroup>
      </ModalUI.FormGroup>
      <ModalUI.FormGroup label="武器">
        <ModalUI.FormCheckboxGroup>
          {FilterEquipment.keys.map((k) => {
            return (
              <ModalUI.FormCheckbox
                key={k}
                name={k}
                label={FilterEquipment.names[k]}
                checked={filter.get(k) ?? false}
                onClick={(v) => handleChange({ [k]: v })}
                grid
              />
            );
          })}
        </ModalUI.FormCheckboxGroup>
      </ModalUI.FormGroup>
      {isSituation && (
        <ModalUI.FormGroup label="状況">
          <ModalUI.FormCheckboxGroup>
            {FilterCondition.getVisibleItems(filter).map((k) => {
              return (
                <ModalUI.FormCheckbox
                  key={k}
                  name={k}
                  label={FilterCondition.names[k]}
                  checked={filter.get(k) ?? false}
                  onClick={(v) => handleChange({ [k]: v })}
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
                onClick={() => handleChange({ [v]: !checked })}
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
                onClick={() => handleChange({ [v]: !checked })}
                grid
              />
            );
          })}
        </ModalUI.FormCheckboxGroup>
      </ModalUI.FormGroup>
    </Form>
  );
});

function TabUnit({
  setting,
  uISetting,
  onChange,
  isSituation,
}: {
  setting: Setting;
  uISetting: UISetting;
  onChange: HandleChange;
  isSituation: boolean;
}) {
  return (
    <Form>
      <ModalUI.FormGroup label="サブスキル">
        <Col>
          <SubskillUI.Selector
            id={setting.subskill1}
            uiSetting={uISetting}
            onSelect={useCallback(
              (id) => onChange(HandleChange.SETTING, { subskill1: id }),
              [onChange]
            )}
            onChangeUI={useCallback(
              (e) => onChange(HandleChange.UI_SETTING, e),
              [onChange]
            )}
          />
        </Col>
        <Col>
          <SubskillUI.Selector
            id={setting.subskill2}
            uiSetting={uISetting}
            onSelect={useCallback(
              (id) => onChange(HandleChange.SETTING, { subskill2: id }),
              [onChange]
            )}
            onChangeUI={useCallback(
              (e) => onChange(HandleChange.UI_SETTING, e),
              [onChange]
            )}
          />
        </Col>
      </ModalUI.FormGroup>
      {isSituation && (
        <>
          <ModalUI.FormGroup label="乗算バフ">
            <Row as={Col}>
              {[stat.attack, stat.defense, stat.resist].map((v) => (
                <FormNumber
                  key={v}
                  name={`${v}-mul-buff`}
                  label={Data.BaseStatType.name[v]}
                  value={setting[Data.BaseStatType.mulKey[v]]}
                  onChange={(n) =>
                    onChange(HandleChange.SETTING, {
                      [Data.BaseStatType.mulKey[v]]: n,
                    })
                  }
                  isValid={Setting.isValidMul}
                />
              ))}
            </Row>
          </ModalUI.FormGroup>
          <ModalUI.FormGroup label="加算バフ">
            <Row as={Col}>
              {[stat.attack, stat.defense, stat.resist].map((v) => (
                <FormNumber
                  key={v}
                  name={`${v}-add-buff`}
                  label={Data.BaseStatType.name[v]}
                  value={setting[Data.BaseStatType.addKey[v]]}
                  onChange={(n) =>
                    onChange(HandleChange.SETTING, {
                      [Data.BaseStatType.addKey[v]]: n,
                    })
                  }
                  isValid={Setting.isValidAdd}
                  isAdd
                />
              ))}
            </Row>
          </ModalUI.FormGroup>
          <ModalUI.FormGroup label="ダメージ倍率">
            <Row as={Col}>
              <FormNumber
                name={"damage-factor"}
                label={"攻撃倍率"}
                value={setting.damageFactor}
                onChange={(n) =>
                  onChange(HandleChange.SETTING, { damageFactor: n })
                }
                isValid={Setting.isValidMul}
              />
              <FormNumber
                name={"physical-damage-cut"}
                label={"物理攻撃軽減"}
                value={setting.physicalDamageCut}
                onChange={(n) =>
                  onChange(HandleChange.SETTING, { physicalDamageCut: n })
                }
                isValid={Setting.isValidDamageCut}
              />
              <FormNumber
                name={"magical-damage-cut"}
                label={"魔法攻撃軽減"}
                value={setting.magicalDamageCut}
                onChange={(n) =>
                  onChange(HandleChange.SETTING, { magicalDamageCut: n })
                }
                isValid={Setting.isValidDamageCut}
              />
            </Row>
          </ModalUI.FormGroup>
          <ModalUI.FormGroup label="その他">
            <Row as={Col}>
              <FormNumber
                name={"attack-speed-buff"}
                label={"攻撃速度バフ"}
                value={setting.attackSpeedBuff}
                onChange={(n) =>
                  onChange(HandleChange.SETTING, { attackSpeedBuff: n })
                }
                isValid={Setting.isValidMul}
              />
              <FormNumber
                name={"delay-cut"}
                label={"待機時間短縮"}
                value={setting.delayCut}
                onChange={(n) =>
                  onChange(HandleChange.SETTING, { delayCut: n })
                }
                isValid={Setting.isValidCut}
              />
            </Row>
          </ModalUI.FormGroup>
        </>
      )}
    </Form>
  );
}

function TabFormation({
  setting,
  onChange,
}: {
  setting: Setting;
  onChange: HandleChange;
}) {
  return (
    <Form>
      <ModalUI.FormGroup label="獣神">
        <Col>
          <BeastUI.Selector
            id={setting.mainBeast}
            onSelect={(n) => {
              switch (n) {
                case -1:
                case setting.subBeast:
                  onChange(HandleChange.SETTING, {
                    mainBeast: n,
                    subBeast: -1,
                  });
                  break;
                default:
                  onChange(HandleChange.SETTING, { mainBeast: n });
                  break;
              }
            }}
          />
        </Col>
        <Col>
          <BeastUI.Selector
            id={setting.subBeast}
            onSelect={(n) => onChange(HandleChange.SETTING, { subBeast: n })}
            disabled={setting.mainBeast === -1}
          />
        </Col>
      </ModalUI.FormGroup>
      <ModalUI.FormGroup label="獣神バフ">
        <Row as={Col}>
          <FormSelect
            name="s-possAmount"
            label="所持数"
            value={setting.possBuffAmount}
            onChange={(e) =>
              onChange(HandleChange.SETTING, {
                possBuffAmount: Number.parseInt(e.target.value),
              })
            }
          >
            <option value={-1}>適用しない</option>
            <SelectOptions value={9} />
            <option value={10}>10以上</option>
          </FormSelect>
          <FormSelect
            name="s-possLevel"
            label="レベル"
            value={setting.possBuffLevel}
            onChange={(e) =>
              onChange(HandleChange.SETTING, {
                possBuffLevel: Number.parseInt(e.target.value),
              })
            }
            disabled={setting.possBuffAmount === -1}
          >
            <SelectOptions value={Data.MAX_POSS_BUFF_LEVEL} />
          </FormSelect>
        </Row>
      </ModalUI.FormGroup>
      <ModalUI.FormGroup label="編成バフ">
        <Row as={Col}>
          {Data.BaseStatType.list.map((v) => (
            <FormNumber
              key={v}
              name={`formation-${v}`}
              label={Data.BaseStatType.name[v]}
              value={setting[Setting.formation.key[v]]}
              onChange={(n) =>
                onChange(HandleChange.SETTING, {
                  [Setting.formation.key[v]]: n,
                })
              }
              isValid={Setting.isValidMul}
            />
          ))}
        </Row>
      </ModalUI.FormGroup>
    </Form>
  );
}

function TabOther({
  setting,
  onChange,
  isSituation,
}: {
  setting: Setting;
  onChange: HandleChange;
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
      <ModalUI.FormGroup label="潜在覚醒">
        <Col sm={7} className="d-grid">
          <ModalUI.FormRadio
            name="s-potential"
            items={["全員に適用", "E以下orイベユニのみ適用", "適用しない"]}
            value={getTypeValue(setting.potential)}
            onChange={(v) =>
              onChange(HandleChange.SETTING, { potential: getTypeName(v) })
            }
          />
        </Col>
      </ModalUI.FormGroup>
      <ModalUI.FormGroup label="専用武器">
        <Col sm={7} className="d-grid">
          <ModalUI.FormRadio
            name="s-weapon"
            items={["武器強化を適用", "基礎性能のみ適用", "適用しない"]}
            value={getTypeValue(setting.weapon)}
            onChange={(v) =>
              onChange(HandleChange.SETTING, { weapon: getTypeName(v) })
            }
          />
        </Col>
      </ModalUI.FormGroup>
      {isSituation && (
        <ModalUI.FormGroup label="属性マス">
          <Col sm={7} className="d-grid">
            <ModalUI.FormRadio
              name="s-field-element"
              items={["無属性", "ユニットと同属性"]}
              value={setting.fieldElement === Setting.NONE ? 0 : 1}
              onChange={(v) =>
                onChange(HandleChange.SETTING, {
                  fieldElement: v === 0 ? Setting.NONE : Setting.SAME,
                })
              }
            />
          </Col>
        </ModalUI.FormGroup>
      )}
    </Form>
  );
}

function SelectOptions({ value }: { value: number }) {
  const ret = [];
  for (let i = 0; i <= value; i++) {
    ret.push(
      <option value={i} key={i}>
        {i}
      </option>
    );
  }
  return ret;
}

function FormItem(props: {
  children: ReactNode;
  name: string;
  label: ReactNode;
}) {
  return (
    <Col sm={6} className="mb-1">
      <FormGroup as={Row} controlId={props.name}>
        <FormLabel column="sm" sm={5}>
          {props.label}
        </FormLabel>
        <Col sm={7}>{props.children}</Col>
      </FormGroup>
    </Col>
  );
}

function FormSelect(props: {
  children: ReactNode;
  name: string;
  label: string;
  value: number;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  disabled?: boolean;
}) {
  return (
    <FormItem {...props}>
      <Form.Select
        value={props.value}
        onChange={props.onChange}
        size="sm"
        disabled={props.disabled}
      >
        {props.children}
      </Form.Select>
    </FormItem>
  );
}

function FormNumber(props: {
  name: string;
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  isValid: (arg: number) => boolean;
  isAdd?: boolean;
}) {
  const [text, setText] = useState<string>(props.value.toString());

  const isInvalid = !props.isValid(Number.parseInt(text));

  function handleChange(value: string) {
    setText(value);
    const v = Number.parseInt(value);
    if (props.isValid(v)) props.onChange(v);
  }

  return (
    <FormItem {...props}>
      <InputGroup size="sm" hasValidation={isInvalid}>
        {/* <InputGroup.Text role="button" onClick={() => handleChange("0")}>
          +
        </InputGroup.Text> */}
        <Form.Control
          type="number"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          isInvalid={isInvalid}
        />
        <InputGroup.Text
          role="button"
          onClick={() => handleChange("0")}
          style={{ width: "2em" }}
        >
          {!props.isAdd && "%"}
        </InputGroup.Text>
        {isInvalid && (
          <Form.Control.Feedback type="invalid">
            無効な値です。
          </Form.Control.Feedback>
        )}
      </InputGroup>
    </FormItem>
  );
}
