"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  ToggleButton,
  ToggleButtonGroup,
  type ColProps,
} from "react-bootstrap";
import * as Data from "./Data";
import cn from "classnames";
import bcn from "classnames/bind";
import style from "./PanelUI.module.css";

const cx = bcn.bind(style);

const BUTTON_VARIANT = "outline-primary";

function FormGroup({
  label,
  children,
}: {
  label: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Container>
      <Form.Group as={Row} className="mb-1 border p-1 rounded">
        <Form.Label column="sm" sm={2} className={cx("label")}>
          {label}
        </Form.Label>
        {children}
      </Form.Group>
    </Container>
  );
}

function FormCheckbox({
  name,
  label,
  checked,
  onClick,
  grid,
}: {
  name: string;
  label: ReactNode;
  checked: boolean;
  onClick: (arg: boolean) => void;
  grid?: boolean;
}) {
  const ret = (
    <ToggleButton
      id={name + "-checkbox"}
      type="checkbox"
      size="sm"
      variant={BUTTON_VARIANT}
      checked={checked}
      value={0}
      onClick={() => onClick(!checked)}
      className={cx("button")}
    >
      {label}
    </ToggleButton>
  );
  if (grid)
    return (
      <FormGrid xs={6} sm={4} md={3} lg={2}>
        {ret}
      </FormGrid>
    );
  return ret;
}

function FormCheckboxGroup({ children }: { children: ReactNode }) {
  return (
    <Container as={Col}>
      <Row className="gy-1">{children}</Row>
    </Container>
  );
}

function FormRadio({
  name,
  items,
  value,
  onChange,
}: {
  name: string;
  items: readonly ReactNode[];
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <ToggleButtonGroup
      type="radio"
      size="sm"
      name={name}
      value={value}
      className="align-self-center"
    >
      {items.map((v, i) => (
        <ToggleButton
          id={name + "-radio-" + i}
          value={i}
          key={i}
          variant={BUTTON_VARIANT}
          onClick={() => onChange(i)}
        >
          {v}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

function FormGrid(props: ColProps) {
  return (
    <Col {...props} className="d-grid">
      {props.children}
    </Col>
  );
}

function RarityCheckbox({
  rarity,
  checked,
  onClick,
}: {
  rarity: Data.Rarity;
  checked: boolean;
  onClick: () => void;
}) {
  const className = [
    {
      "text-bg-warning": rarity === Data.Rarity.L,
    },
    cx({
      "text-bg-epic": rarity === Data.Rarity.E,
      "text-bg-rare": rarity === Data.Rarity.R,
      "text-bg-common": rarity === Data.Rarity.C,
    }),
  ];
  return (
    <FormCheckbox
      name={Data.Rarity[rarity]}
      label={
        <>
          <span className={cn("badge me-2", className)}>
            {Data.Rarity[rarity]}
          </span>
          {Data.Rarity.alias[rarity]}
        </>
      }
      checked={checked}
      onClick={onClick}
      grid
    />
  );
}

function ElementCheckbox({
  element,
  checked,
  onClick,
}: {
  element: (typeof Data.Element.list)[number];
  checked: boolean;
  onClick: () => void;
}) {
  const className = [
    {
      "bg-danger": element === Data.Element.fire,
      "bg-success": element === Data.Element.wind,
      "bg-warning": element === Data.Element.light,
    },
    cx({
      "element-badge": true,
      "bg-e-water": element === Data.Element.water,
      "bg-e-earth": element === Data.Element.earth,
      "bg-e-dark": element === Data.Element.dark,
    }),
  ];

  return (
    <FormGrid xs={4} sm={3} md={2}>
      <FormCheckbox
        name={element}
        label={
          <>
            <span className={cn("badge me-2", className)}>&#8203;</span>
            {Data.Element.name[element]}
          </>
        }
        checked={checked}
        onClick={onClick}
      />
    </FormGrid>
  );
}

function FormItem(props: {
  children: ReactNode;
  name: string;
  label: ReactNode;
}) {
  return (
    <Col xs={12} sm={6} lg={4} xxl={3} className="mb-1">
      <Form.Group as={Row} controlId={props.name}>
        <Form.Label column="sm" xs={5} sm={6} lg={5} className="ps-1 pe-1">
          {props.label}
        </Form.Label>
        <Col xs={7} sm={6} lg={7} className="ps-1 pe-1">
          {props.children}
        </Col>
      </Form.Group>
    </Col>
  );
}

function FormNumber(props: {
  name: string;
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  isValid: (arg: number) => boolean;
  isAdd?: boolean;
}) {
  const [text, setText] = useState<string>(props.value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const isInvalid = !props.isValid(Number.parseInt(text));

  function handleChange(value: string) {
    setText(value);
    const v = Number.parseInt(value);
    if (props.isValid(v)) props.onChange(v);
  }

  function handleReset() {
    handleChange("0");
    inputRef.current?.focus();
  }

  return (
    <FormItem {...props}>
      <InputGroup size="sm" hasValidation={isInvalid}>
        {/* <InputGroup.Text role="button" onClick={() => handleChange("0")}>
          +
        </InputGroup.Text> */}
        <Form.Control
          type="number"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          isInvalid={isInvalid}
          ref={inputRef}
        />
        <InputGroup.Text
          role="button"
          onClick={handleReset}
          style={{ width: "2em" }}
        >
          {!props.isAdd && "%"}
        </InputGroup.Text>
        {isInvalid && (
          <Form.Control.Feedback type="invalid">
            無効な値です。
          </Form.Control.Feedback>
        )}
      </InputGroup>
    </FormItem>
  );
}

export default Object.assign(
  {},
  {
    FormGroup,
    FormCheckbox,
    FormCheckboxGroup,
    FormRadio,
    FormGrid,
    RarityCheckbox,
    ElementCheckbox,
    FormItem,
    FormNumber,
  }
);
