"use client";

import Styles from "./styles.module.css";
import { useRef, useState } from "react";
import { Container, Form, FormControl, InputGroup, Nav, Navbar } from "react-bootstrap";

import { HandleChange, type States } from "./States";
import SettingPanel from "./SettingPanel";
import Link from "next/link";

export default function NavigationBar(props: {
  states: States
  onChange: HandleChange
  isSituation?: boolean
}) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showPanel, setShowPanel] = useState(false);
  const handleShowPanel = () => setShowPanel(true);
  const handleClosePanel = () => setShowPanel(false);

  return (
    <>
      <style href="scrollbar-fixed" precedence="medium">
        {`body { overflow-y: scroll; }`}
      </style>
      <SettingPanel
        show={showPanel}
        handleClose={handleClosePanel}
        filter={props.states.filter}
        setting={props.states.setting}
        uISetting={props.states.uISetting}
        onChange={props.onChange}
        isSituation={props.isSituation ?? false}
      />
      <Navbar expand={false} bg="secondary" data-bs-theme="dark" sticky="top" className={Styles.navbar}>
        <Form className={Styles.search}>
          <InputGroup>
            <InputGroup.Text role="button" onClick={() => {
              props.onChange(HandleChange.QUERY, "");
              searchInputRef.current?.focus();
            }}>
              <SearchIcon />
            </InputGroup.Text>
            <FormControl
              type="search"
              placeholder="検索"
              value={props.states.query}
              onChange={e => props.onChange(HandleChange.QUERY, e.target.value)}
              ref={searchInputRef}
            />
          </InputGroup>
        </Form>

        <Container fluid>
          <Navbar.Brand href="./">Monmusu-Tools</Navbar.Brand>

          <Nav className="me-auto">
            <Nav.Link href="./unit" as={Link}>ユニット一覧</Nav.Link>
            <Nav.Link href="./buff" as={Link}>バフ</Nav.Link>
          </Nav>

          <button className={`navbar-toggler ms-auto ${Styles.navbarToggler}`} onClick={handleShowPanel}>
            <span className="navbar-toggler-icon" />
          </button>
        </Container>
      </Navbar>
    </>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
    </svg>
  );
}
