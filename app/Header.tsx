"use client";

import "./page.css";
import { useQueryContext, useSetQueryContext } from "@/components/States";
import styles from "./Header.module.css";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import {
  Button,
  Container,
  Form,
  InputGroup,
  Nav,
  Navbar,
  NavDropdown,
} from "react-bootstrap";
import Icon from "./Icon";

const BRAND_NAME = "Monmusu DB";
const pageNames = {
  UNIT: "ユニット",
  BUFF: "バフ",
} as const;
const Theme = {
  AUTO: "auto",
  LIGHT: "light",
  DARK: "dark",
} as const;
type Theme = (typeof Theme)[keyof typeof Theme];
const themeName = {
  auto: "自動",
  light: "ライト",
  dark: "ダーク",
} as const;

declare global {
  interface Window {
    __setPreferredTheme: (theme: Theme) => void;
  }
}

export default function Header({
  showSettingPanel,
}: {
  showSettingPanel?: () => void;
}) {
  return (
    <Navbar
      as="header"
      expand="lg"
      bg="primary"
      data-bs-theme="dark"
      sticky="top"
      className="mb-2"
    >
      <SearchInput />
      <Container as="nav" fluid="xxl">
        <Navbar.Brand as={Link} href="./">
          {BRAND_NAME}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar" />
        <Navbar.Collapse id="navbar">
          <Nav as="ul" className="me-auto">
            <NavLink href="./unit">{pageNames.UNIT}</NavLink>
            <NavLink href="./buff">{pageNames.BUFF}</NavLink>
          </Nav>
          <Nav>
            {showSettingPanel !== undefined && (
              <>
                <SettingPanelToggler onClick={showSettingPanel} />
                <Vr />
              </>
            )}
            <ThemeToggler />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function NavLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <li className="nav-item col-auto">
      <Nav.Link as={Link} href={href}>
        {children}
      </Nav.Link>
    </li>
  );
}

function SearchInput() {
  const query = useQueryContext();
  const setQuery = useSetQueryContext();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleResetButton() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <Form className={styles["search-input"]}>
      <InputGroup>
        <InputGroup.Text role="button" onClick={handleResetButton}>
          <Icon.Search />
        </InputGroup.Text>
        <Form.Control
          type="search"
          placeholder="検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          ref={inputRef}
        />
      </InputGroup>
    </Form>
  );
}

function ThemeToggler() {
  return (
    <NavDropdown
      id="theme-toggler"
      title={
        <>
          <CurrentTheme theme="light" />
          <CurrentTheme theme="dark" />
          <CurrentTheme theme="auto" />
        </>
      }
    >
      <ThemeTogglerButton theme="light" />
      <ThemeTogglerButton theme="dark" />
      <ThemeTogglerButton theme="auto" />
    </NavDropdown>
  );
}

function CurrentTheme({ theme }: { theme: Theme }) {
  return (
    <span className={`d-none theme-${theme}`}>
      <ThemeIcon theme={theme} />
    </span>
  );
}

function ThemeTogglerButton({ theme }: { theme: Theme }) {
  return (
    <NavDropdown.Item
      as="button"
      className="d-flex"
      onClick={() => window.__setPreferredTheme(theme)}
    >
      <span className="me-2 opacity-50">
        <ThemeIcon theme={theme} />
      </span>
      {themeName[theme]}
      <span className={`ms-auto d-none theme-${theme}`}>
        <Icon.Check2 />
      </span>
    </NavDropdown.Item>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  switch (theme) {
    case Theme.LIGHT:
      return <Icon.BrightnessHignFill />;
    case Theme.DARK:
      return <Icon.MoonFill />;
    case Theme.AUTO:
      return <Icon.CircleHalf />;
  }
}

function SettingPanelToggler({
  onClick,
}: {
  onClick?: (() => void) | undefined;
}) {
  return (
    <Button variant="link" className="nav-link" onClick={onClick}>
      <Icon.GearFill />
    </Button>
  );
}

function Vr() {
  return <div className="vr mx-2 text-white" />;
}
