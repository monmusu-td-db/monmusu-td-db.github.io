"use client";

import { Col, Form, Modal, Nav, Row, Tab, ToggleButton } from "react-bootstrap";
import * as Data from "../Data";
import CardSelector from "./CardSelector";
import Subskill from "../Subskill";
import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import PanelUI from "./PanelUI";
import type { UISetting } from "../States";

// Const

type HandleCond = (cond: number) => number;
const list = Subskill.getList();

const tabs = {
  SELECT: "select",
  VIEW: "view",
} as const;
const tabTexts = {
  SELECT: "選択",
  VIEW: "表示",
} as const;

const groups = {
  ATTACK: "attack",
  DEFENSE: "defense",
  SUPPORT: "support",
} as const;
const groupTexts = {
  ATTACK: "攻撃",
  DEFENSE: "防御",
  SUPPORT: "支援",
} as const;
const groupCond = Data.Cond(Object.keys(groups) as (keyof typeof groups)[]);

const rarityCond = Data.Cond(Object.keys(Data.Rarity.name) as Data.Rarity[]);

const labelTexts = {
  HEADER: "サブスキル選択",
  SORT: "ソート",
  RARITY: "レアリティ",
  OTHER: "その他",
} as const;

const sortCond = {
  DEFAULT: 0,
  NAME: 1,
} as const;
const sortTexts = {
  DEFAULT: "標準",
  NAME: "名前",
} as const;
const sortOrderTexts = ["▲昇順", "▼降順"] as const;

const GENERAL_SKILL_TEXT = "ダンジョンor大迷宮産スキルのみ表示";

const viewHandleKeys = {
  SORT_TYPE: 0,
  SORT_ORDER: 1,
  RARITY: 2,
  GENERAL: 3,
} as const;
type ViewHandleKey = (typeof viewHandleKeys)[keyof typeof viewHandleKeys];
type ViewHandleValue<T extends ViewHandleKey> = T extends 0 | 1
  ? number
  : T extends 2
  ? HandleCond
  : boolean;

// Util

function isChecked(value: number, cond: number): boolean {
  return (cond & value) === value;
}

// Components

function SubskillSelector(props: {
  id: number;
  uiSetting: UISetting;
  onSelect: (id: number) => void;
  onChangeUI: Dispatch<SetStateAction<UISetting>>;
}) {
  const selector = CardSelector.useSelector(props.onSelect);
  const [tab, setTab] = useState<string>(tabs.SELECT);
  const s = props.uiSetting;
  const group = s.subskillGroup;
  const rarity = s.subskillRarity;
  const isGeneral = s.subskillIsGeneral;

  const filteredList = useMemo(
    () =>
      list.filter((item) => {
        const a =
          group === 0 ||
          (isChecked(groupCond.ATTACK, group) &&
            item.group === groupTexts.ATTACK) ||
          (isChecked(groupCond.DEFENSE, group) &&
            item.group === groupTexts.DEFENSE) ||
          (isChecked(groupCond.SUPPORT, group) &&
            item.group === groupTexts.SUPPORT);

        const b =
          rarity === 0 ||
          (isChecked(rarityCond.L, rarity) && item.rarity === Data.Rarity.L) ||
          (isChecked(rarityCond.E, rarity) && item.rarity === Data.Rarity.E) ||
          (isChecked(rarityCond.R, rarity) && item.rarity === Data.Rarity.R) ||
          (isChecked(rarityCond.C, rarity) && item.rarity === Data.Rarity.C);

        const c = isGeneral ? item.isGeneral : true;

        return a && b && c;
      }),
    [group, isGeneral, rarity]
  );

  const sortType = s.subskillSortType;
  const sortOrder = s.subskillSortReversed;

  const sortedList = useMemo(() => {
    switch (sortType) {
      case sortCond.NAME:
        const fn = (a: Subskill, b: Subskill) => a.name.localeCompare(b.name);
        if (sortOrder) return filteredList.toSorted((a, b) => fn(b, a));
        else return filteredList.toSorted(fn);
      default:
        if (sortOrder) return filteredList.toReversed();
        else return filteredList;
    }
  }, [filteredList, sortOrder, sortType]);
  const dSortedList = useDeferredValue(sortedList);

  const src = Subskill.getItem(props.id);
  const p = {
    list: dSortedList,
    onSelect: selector.handleSelect,
    disabled: !selector.show,
  };

  const onChangeUI = props.onChangeUI;
  function handleGroup(callback: HandleCond) {
    onChangeUI((p) => ({ ...p, subskillGroup: callback(p.subskillGroup) }));
  }
  const handleTabView = useCallback(
    function <T extends ViewHandleKey>(key: T, value: ViewHandleValue<T>) {
      switch (key) {
        case viewHandleKeys.SORT_TYPE:
          onChangeUI((p) => ({
            ...p,
            subskillSortType: value as ViewHandleValue<0>,
          }));
          break;
        case viewHandleKeys.SORT_ORDER:
          onChangeUI((p) => ({ ...p, subskillSortReversed: value === 1 }));
          break;
        case viewHandleKeys.RARITY: {
          const callback = value as ViewHandleValue<2>;
          onChangeUI((p) => ({
            ...p,
            subskillRarity: callback(p.subskillRarity),
          }));
          break;
        }
        case viewHandleKeys.GENERAL:
          onChangeUI((p) => ({
            ...p,
            subskillIsGeneral: value as ViewHandleValue<3>,
          }));
          break;
      }
    },
    [onChangeUI]
  );

  return (
    <>
      <CardSelector.Button src={src} onClick={selector.handleOpen} />
      <CardSelector.Modal
        show={selector.show}
        onHide={selector.handleClose}
        onShow={() => setTab(tabs.SELECT)}
      >
        <Tab.Container
          activeKey={tab}
          onSelect={(t) => setTab(t ?? tabs.SELECT)}
        >
          <Modal.Header>
            <Row>
              <Modal.Title className="col-4">{labelTexts.HEADER}</Modal.Title>
              <CardSelector.RemoveButton
                className="ms-5 me-auto"
                onClick={selector.handleRemove}
              />
              <Col xs={12}>
                <HeaderButton
                  id={groups.ATTACK}
                  checked={isChecked(groupCond.ATTACK, group)}
                  onClick={() => handleGroup((v) => v ^ groupCond.ATTACK)}
                >
                  {groupTexts.ATTACK}
                </HeaderButton>
                <HeaderButton
                  id={groups.DEFENSE}
                  checked={isChecked(groupCond.DEFENSE, group)}
                  onClick={() => handleGroup((v) => v ^ groupCond.DEFENSE)}
                >
                  {groupTexts.DEFENSE}
                </HeaderButton>
                <HeaderButton
                  id={groups.SUPPORT}
                  checked={isChecked(groupCond.SUPPORT, group)}
                  onClick={() => handleGroup((v) => v ^ groupCond.SUPPORT)}
                >
                  {groupTexts.SUPPORT}
                </HeaderButton>
              </Col>
            </Row>
            <Nav variant="underline" justify className="col-3 ps-2 pe-4">
              <Nav.Item>
                <Nav.Link eventKey={tabs.SELECT}>{tabTexts.SELECT}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey={tabs.VIEW}>{tabTexts.VIEW}</Nav.Link>
              </Nav.Item>
            </Nav>
            <button
              className="btn-close me-2"
              type="button"
              onClick={selector.handleClose}
              aria-label="Close"
            />
          </Modal.Header>
          <Modal.Body>
            <Tab.Content>
              <Tab.Pane eventKey={tabs.SELECT}>
                {Data.Rarity.list.map((v) => (
                  <CardSelector.RarityContainer key={v} {...p} rarity={v} />
                ))}
              </Tab.Pane>
              <Tab.Pane eventKey={tabs.VIEW}>
                <TabView
                  sortType={sortType}
                  sortOrder={sortOrder}
                  rarity={rarity}
                  isGeneral={isGeneral}
                  onChange={handleTabView}
                />
              </Tab.Pane>
            </Tab.Content>
          </Modal.Body>
        </Tab.Container>
      </CardSelector.Modal>
    </>
  );
}

const TabView = memo(function TabView({
  sortType,
  sortOrder,
  rarity,
  isGeneral,
  onChange,
}: {
  sortType: number;
  sortOrder: boolean;
  rarity: number;
  isGeneral: boolean;
  onChange: <T extends ViewHandleKey>(
    key: T,
    value: ViewHandleValue<T>
  ) => void;
}) {
  const handleRarity = (fn: HandleCond) => onChange(viewHandleKeys.RARITY, fn);

  return (
    <Form>
      <PanelUI.FormGroup label={labelTexts.SORT}>
        <PanelUI.FormGrid sm={3}>
          <PanelUI.FormRadio
            name="sort-type"
            items={Object.values(sortTexts)}
            value={sortType}
            onChange={(n) => onChange(viewHandleKeys.SORT_TYPE, n)}
          />
        </PanelUI.FormGrid>
        <PanelUI.FormGrid sm={3}>
          <PanelUI.FormRadio
            name="sort-order"
            items={sortOrderTexts}
            value={sortOrder ? 1 : 0}
            onChange={(n) => onChange(viewHandleKeys.SORT_ORDER, n)}
          />
        </PanelUI.FormGrid>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label={labelTexts.RARITY}>
        <PanelUI.FormCheckboxGroup>
          {Data.Rarity.list.map((v) => (
            <PanelUI.RarityCheckbox
              key={v}
              rarity={v}
              checked={isChecked(rarityCond[v], rarity)}
              onClick={() => handleRarity((p) => p ^ rarityCond[v])}
            />
          ))}
        </PanelUI.FormCheckboxGroup>
      </PanelUI.FormGroup>
      <PanelUI.FormGroup label={labelTexts.OTHER}>
        <PanelUI.FormGrid sm={5}>
          <PanelUI.FormCheckbox
            name="general-skill"
            label={GENERAL_SKILL_TEXT}
            checked={isGeneral}
            onClick={() => onChange(viewHandleKeys.GENERAL, !isGeneral)}
          />
        </PanelUI.FormGrid>
      </PanelUI.FormGroup>
    </Form>
  );
});

function HeaderButton(props: {
  id: string;
  checked: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Col xs={4} className="d-grid">
      <ToggleButton
        id={"subskill-" + props.id}
        type="checkbox"
        variant="outline-primary"
        size="sm"
        checked={props.checked}
        value={props.id}
        onClick={props.onClick}
      >
        {props.children}
      </ToggleButton>
    </Col>
  );
}

export default Object.assign(
  {},
  {
    Selector: SubskillSelector,
  }
);
