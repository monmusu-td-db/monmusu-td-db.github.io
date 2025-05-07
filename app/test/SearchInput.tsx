"use client";

import { Contexts } from "@/components/States";
import { useRef } from "react";
import { Form, InputGroup } from "react-bootstrap";
import Icon from "../Icon";

function SearchInput({ className }: { className?: string }) {
  const query = Contexts.useQuery();
  const setQuery = Contexts.useSetQuery();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleResetButton() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <Form className={className}>
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

export default SearchInput;
