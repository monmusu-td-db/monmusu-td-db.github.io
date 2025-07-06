"use client";

import "./Navbar.css";
import Image from "next/image";
import { Button, Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import Icon from "./Icon";
import { type ReactNode } from "react";
import Theme from "./Theme";
import Panel, { type PageType } from "./Panel";
import cn from "classnames";
import SearchInput from "./SearchInput";

const SEARCH_ICON_SIZE = 18;
const IMAGE_ALT_TEXT = "モンスター娘DB ロゴ";

function Header({ pageType }: { pageType?: PageType }) {
  const open = Panel.Contexts.useOpen();
  const setOpen = Panel.Contexts.useSetOpen();

  return (
    <header className="mb-2 sticky-top header">
      <NavArea />
      <Panel open={open} onClose={() => setOpen(false)} pageType={pageType} />
    </header>
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
    <Navbar.Brand href="/" className="d-flex ms-3 align-items-center brand">
      <Logo />
      <span className="ms-2">モンスター娘DB</span>
    </Navbar.Brand>
  );
}

function Logo() {
  return (
    <Image
      src={"/icon_40x40.png"}
      width={40}
      height={40}
      alt={IMAGE_ALT_TEXT}
      className="logo"
      priority
      quality={100}
    />
  );
}

function LogoPlaceholder() {
  return (
    <Image
      src={"/Logo.svg"}
      width={40}
      height={40}
      alt={IMAGE_ALT_TEXT}
      className="logo"
      priority
      quality={100}
    />
  );
}

function ThemeToggler() {
  return (
    <>
      <div className="d-none ms-1 me-1 theme-light">
        <HeaderButton onClick={() => Theme.toggle(Theme.LIGHT)}>
          <Icon.BrightnessHignFill
            width={SEARCH_ICON_SIZE}
            height={SEARCH_ICON_SIZE}
          />
        </HeaderButton>
      </div>
      <div className="d-none ms-1 me-1 theme-dark">
        <HeaderButton onClick={() => Theme.toggle(Theme.DARK)}>
          <Icon.MoonFill width={SEARCH_ICON_SIZE} height={SEARCH_ICON_SIZE} />
        </HeaderButton>
      </div>
    </>
  );
}

function PanelToggler() {
  const open = Panel.Contexts.useOpen();
  const setOpen = Panel.Contexts.useSetOpen();

  return (
    <div className="flex ms-1 me-1">
      <Button
        variant="outline-secondary"
        className={cn("header-btn", { "header-btn-checked": open })}
        onClick={() => setOpen((p) => !p)}
        aria-controls={Panel.ID}
        aria-expanded={open}
      >
        <Icon.GearFill width={SEARCH_ICON_SIZE} height={SEARCH_ICON_SIZE} />
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
