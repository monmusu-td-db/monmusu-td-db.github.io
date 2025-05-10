"use client";

import "./Navbar.css";
import Image from "next/image";
import Logo from "@/assets/logo.svg";
import { Button, Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import Icon from "./Icon";
import { useState, type ReactNode } from "react";
import Theme from "./Theme";
import Panel from "./Panel";
import cn from "classnames";
import SearchInput from "./SearchInput";

const ICON_SIZE = 18;

function Header() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <Panel.Contexts.Open.Provider value={panelOpen}>
      <Panel.Contexts.Toggle.Provider value={() => setPanelOpen((p) => !p)}>
        <header className="mb-2 sticky-top header">
          <NavArea />
          <Panel open={panelOpen} onClose={() => setPanelOpen(false)} />
        </header>
      </Panel.Contexts.Toggle.Provider>
    </Panel.Contexts.Open.Provider>
  );
}

function NavArea() {
  const offcanvasId = "navbar-offcanvas";
  const labelId = "navbar-offcanvas-label";

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <div className="d-flex">
          <Navbar.Toggle aria-controls={offcanvasId} />
          <Brand />
        </div>
        <Navbar.Offcanvas
          id={offcanvasId}
          aria-labelledby={labelId}
          placement="start"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={labelId}>
              <Brand />
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-start flex-grow-1 pe-3">
              <Nav.Link href="/unit">ユニット</Nav.Link>
              <Nav.Link href="/buff">バフ</Nav.Link>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
        <SearchInput className="header-search-input d-none d-md-block" />
        <div className="d-flex justify-content-end">
          <ThemeToggler />
          <PanelToggler />
        </div>
      </Container>
    </Navbar>
  );
}

function Brand() {
  return (
    <Navbar.Brand href="/" className="d-flex ms-3 align-items-center">
      <Image src={Logo} width={32} height={32} alt="Monmusu DB Logo" />
      <span className="ms-2">Monmusu DB</span>
    </Navbar.Brand>
  );
}

function ThemeToggler() {
  return (
    <>
      <div className="d-none ms-1 me-1 theme-light">
        <HeaderButton onClick={() => Theme.toggle(Theme.LIGHT)}>
          <Icon.BrightnessHignFill width={ICON_SIZE} height={ICON_SIZE} />
        </HeaderButton>
      </div>
      <div className="d-none ms-1 me-1 theme-dark">
        <HeaderButton onClick={() => Theme.toggle(Theme.DARK)}>
          <Icon.MoonFill width={ICON_SIZE} height={ICON_SIZE} />
        </HeaderButton>
      </div>
    </>
  );
}

function PanelToggler() {
  const open = Panel.Contexts.useOpen();
  const toggle = Panel.Contexts.useToggle();

  return (
    <div className="flex ms-1 me-1">
      <Button
        variant="outline-secondary"
        className={cn("header-btn", { "header-btn-checked": open })}
        onClick={toggle}
        aria-controls={Panel.ID}
        aria-expanded={open}
      >
        <Icon.GearFill width={ICON_SIZE} height={ICON_SIZE} />
      </Button>
    </div>
  );
}

function HeaderButton({
  children,
  onClick,
}: {
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="outline-secondary"
      className="header-btn"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export default Header;
