"use client";

import "./page.css";
import { useQueryContext, useSetQueryContext } from "@/components/States";
import styles from "./Header.module.css";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { Button, Container, Form, InputGroup, Nav, Navbar, NavDropdown } from "react-bootstrap";
import Icon from "./Icon";
import { useSetThemeContext, useThemeContext } from "./buff/Root";

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
type Theme = typeof Theme[keyof typeof Theme]
const themeName = {
  auto: "自動",
  light: "ライト",
  dark: "ダーク",
} as const;

export default function Header() {
  return (
    <>
      <Navbar as="header" expand="lg" bg="primary" data-bs-theme="dark" sticky="top">
        <SearchInput />
        <Container as="nav" fluid="xxl">
          <Navbar.Brand as={Link} href="./">{BRAND_NAME}</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar" />
          <Navbar.Collapse id="navbar">
            <Nav as="ul" className="me-auto">
              <NavLink href="./unit">{pageNames.UNIT}</NavLink>
              <NavLink href="./buff">{pageNames.BUFF}</NavLink>
            </Nav>
            <Nav>
              <ThemeToggler />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

function NavLink({
  children,
  href,
}: {
  children: ReactNode
  href: string
}) {
  return (
    <li className="nav-item col-auto">
      <Nav.Link as={Link} href={href}>{children}</Nav.Link>
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
          onChange={e => setQuery(e.target.value)}
          ref={inputRef}
        />
      </InputGroup>
    </Form>
  );
}

function ThemeToggler() {
  const theme = useThemeContext();
  return (
    <>
      <NavDropdown
        id="theme-toggler"
        title={<ThemeIcon theme={theme} />}
      >
        <ThemeTogglerButton theme="light" currentTheme={theme} />
        <ThemeTogglerButton theme="dark" currentTheme={theme} />
        <ThemeTogglerButton theme="auto" currentTheme={theme} />
      </NavDropdown>
    </>
  );
}

function ThemeTogglerButton({
  theme,
  currentTheme,
}: {
  theme: Theme
  currentTheme: Theme
}) {
  const setTheme = useSetThemeContext();
  return (
    <NavDropdown.Item as="button" className="d-flex" onClick={() => setTheme(theme)}>
      <span className="me-2 opacity-50">
        <ThemeIcon theme={theme} />
      </span>
      {themeName[theme]}
      {currentTheme === theme && (
        <span className="ms-auto">
          <Icon.Check2 />
        </span>
      )}
    </NavDropdown.Item>
  );
}

function ThemeIcon({
  theme
}: {
  theme: Theme
}) {
  switch (theme) {
    case Theme.LIGHT:
      return <Icon.BrightnessHignFill />;
    case Theme.DARK:
      return <Icon.MoonFill />;
    case Theme.AUTO:
      return <Icon.CircleHalf />;
  }
}
