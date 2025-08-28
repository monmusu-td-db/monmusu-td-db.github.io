"use client";

import Icon from "@/components/UI/Icon";
import "./Header.css";
import Images from "@/components/UI/Images";
import { type ReactNode } from "react";
import { Button, Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import Theme from "@/components/UI/Theme";

const ICON_SIZE = 18;
const PAGE_NAME = "モンスター娘TD DB";
const IMAGE_ALT_TEXT = "モンスター娘TD DB ロゴ";

interface HeaderProps extends NavAreaProps {
  panel?: ReactNode;
}

function Header(props: HeaderProps): ReactNode {
  return (
    <header className="sticky-top header">
      <NavArea {...props} />
      {props.panel}
    </header>
  );
}

interface NavAreaProps {
  searchInput?: ReactNode;
  panelToggler?: ReactNode;
}

function NavArea({ searchInput, panelToggler }: NavAreaProps) {
  const offcanvasId = "navbar-offcanvas";
  const labelId = "navbar-offcanvas-label";

  return (
    <Navbar expand="xl" className="bg-body-secondary">
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
          <Offcanvas.Body className="d-flex">
            <Nav className="justify-content-start flex-grow-1 pe-3">
              <Nav.Link href="/unit">ユニット</Nav.Link>
              <Nav.Link href="/buff">バフ</Nav.Link>
            </Nav>
            <Images.OffCanvas className="offcanvas-icon" />
          </Offcanvas.Body>
        </Navbar.Offcanvas>
        {searchInput}
        <div className="d-flex justify-content-end">
          <ThemeToggler />
          {panelToggler}
        </div>
      </Container>
    </Navbar>
  );
}

function Brand() {
  return (
    <Navbar.Brand
      href="/"
      className="d-flex mx-2 mx-sm-3 align-items-center brand"
    >
      <Logo />
      <span className="ms-2">{PAGE_NAME}</span>
    </Navbar.Brand>
  );
}

function Logo() {
  return <Images.Logo className="logo" alt={IMAGE_ALT_TEXT} />;
}

// function LogoPlaceholder() {
//   return (
//     <Image
//       src={"/logo_placeholder.svg"}
//       width={40}
//       height={40}
//       alt={IMAGE_ALT_TEXT}
//       className="logo"
//       priority
//       quality={100}
//     />
//   );
// }

function ThemeToggler() {
  return (
    <>
      <div className="d-none mx-1 theme-light">
        <HeaderButton onClick={() => Theme.toggle(Theme.LIGHT)}>
          <Icon.BrightnessHignFill width={ICON_SIZE} height={ICON_SIZE} />
        </HeaderButton>
      </div>
      <div className="d-none mx-1 theme-dark">
        <HeaderButton onClick={() => Theme.toggle(Theme.DARK)}>
          <Icon.MoonFill width={ICON_SIZE} height={ICON_SIZE} />
        </HeaderButton>
      </div>
    </>
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
