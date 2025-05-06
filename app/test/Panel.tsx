"use client";

import "./Panel.css";
import { createContext, useContext, useState } from "react";
import { Collapse, Container, Nav, Tab } from "react-bootstrap";

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
          <Tab.Container
            activeKey={tab}
            onSelect={(t) => setTab(t ?? tabs.FILTER)}
          >
            <header className="d-flex">
              <h1 className="panel-label">各種設定</h1>
              <Nav
                variant="underline"
                justify
                className="col-8 me-auto ms-auto"
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
            </header>
            <Tab.Content>
              <Tab.Pane eventKey={tabs.FILTER}>AAAA</Tab.Pane>
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
