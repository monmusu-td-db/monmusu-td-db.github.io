"use client";

import "./Panel.css";
import * as Data from "@/components/Data";
import { createContext, memo, useCallback, useContext, useState } from "react";
import { Collapse, Container, Form, Nav, Row, Tab } from "react-bootstrap";
import SearchInput from "./SearchInput";
import ModalUI from "@/components/PanelUI";
import {
  FilterCondition,
  FilterEquipment,
  Contexts as StatesContexts,
  type Filter,
  type FilterObject,
} from "@/components/States";

const ID = "panel";

const tabs = {
  FILTER: "filter",
  UNIT: "unit",
  FORMATION: "formation",
  OTHER: "other",
} as const;

function Panel({ open }: { open: boolean }) {
  const [tab, setTab] = useState<string>(tabs.FILTER);

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
              <Tab.Pane eventKey={tabs.UNIT}>AAAA</Tab.Pane>
              <Tab.Pane eventKey={tabs.FORMATION}>AAAA</Tab.Pane>
              <Tab.Pane eventKey={tabs.OTHER}>AAAA</Tab.Pane>
            </Tab.Content>
          </Tab.Container>
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
