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
} from "react-bootstrap";
import Icon from "./Icon";

const BRAND_NAME = "Monmusu DB";
const pageNames = {
  UNIT: "ユニット",
  BUFF: "バフ",
} as const;
const Theme = {
  LIGHT: "light",
  DARK: "dark",
} as const;
type Theme = (typeof Theme)[keyof typeof Theme];

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
    <>
      <CurrentTheme theme={Theme.LIGHT} />
      <CurrentTheme theme={Theme.DARK} />
    </>
  );
}

function CurrentTheme({ theme }: { theme: Theme }) {
  function handleClick() {
    const newTheme = theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    return window.__setPreferredTheme(newTheme);
  }

  return (
    <Button
      variant="link"
      className={`nav-link d-none theme-${theme}`}
      onClick={handleClick}
    >
      <ThemeIcon theme={theme} />
    </Button>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  switch (theme) {
    case Theme.LIGHT:
      return <Icon.BrightnessHignFill />;
    case Theme.DARK:
      return <Icon.MoonFill />;
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
