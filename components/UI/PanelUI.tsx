"use client";

import {
  useRef,
  useState,
  type ChangeEventHandler,
  type ReactNode,
} from "react";
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
import * as Data from "../Data";
import cn from "classnames";
import "./PanelUI.css";
import Icon from "./Icon";

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
      <Form.Group
        as={Row}
        className="panel-form-group mb-2 mb-md-1 border p-1 rounded"
      >
        <Form.Label column="sm" md={2}>
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
      className="panel-btn"
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
          className="panel-btn"
        >
          {v}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

function FormGrid(props: ColProps) {
  return (
    <Col {...props} className="d-grid gy-1">
      {props.children}
    </Col>
  );
}

function RarityCheckbox({
  rarity,
  checked,
  onClick,
  lg,
}: {
  rarity: Data.Rarity;
  checked: boolean;
  onClick: () => void;
  lg?: boolean;
}) {
  const badge = Data.Rarity.selectorOf(rarity);
  const ret = (
    <FormCheckbox
      name={Data.Rarity[rarity]}
      label={
        <>
          <span className={cn("badge rarity-badge me-2", badge)}>
            {Data.Rarity[rarity]}
          </span>
          {Data.Rarity.alias[rarity]}
        </>
      }
      checked={checked}
      onClick={onClick}
      grid={!lg}
    />
  );
  if (lg) {
    return (
      <FormGrid xs={6} md={3}>
        {ret}
      </FormGrid>
    );
  } else {
    return ret;
  }
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
  const badge = Data.Element.selectorOf(element);
  function getIcon() {
    switch (element) {
      case Data.Element.fire:
        return <Icon.Fire />;
      case Data.Element.water:
        return <Icon.DropletFill />;
      case Data.Element.earth:
        return <Icon.GlobeAsiaAustralia />;
      case Data.Element.wind:
        return <Icon.Hurricane />;
      case Data.Element.light:
        return <Icon.LightningChargeFill />;
      case Data.Element.dark:
        return <Icon.DiskFill />;
    }
  }

  return (
    <FormGrid xs={4} sm={3} md={2}>
      <FormCheckbox
        name={element}
        label={
          <>
            <span className={cn("element-badge me-1", badge)}>{getIcon()}</span>
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
  labelHidden?: boolean;
}) {
  const labelHidden = props.labelHidden ?? false;
  const size = !labelHidden
    ? {
        xs: 12,
        sm: 6,
        lg: 4,
        xxl: 3,
      }
    : {
        xs: 6,
        sm: 4,
        lg: 3,
        xxl: 2,
      };
  return (
    <Col {...size} className="mb-1">
      <Form.Group as={Row} controlId={props.name}>
        <Form.Label
          column="sm"
          xs={5}
          className="ps-2 pe-1"
          visuallyHidden={labelHidden}
        >
          {props.label}
        </Form.Label>
        <Col xs={labelHidden ? 12 : 7} className="ps-1 pe-2">
          {props.children}
        </Col>
      </Form.Group>
    </Col>
  );
}

function FormSelect(props: {
  children: ReactNode;
  name: string;
  label: string;
  value: number;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  disabled?: boolean;
}) {
  return (
    <FormItem {...props}>
      <Form.Select
        value={props.value}
        onChange={props.onChange}
        size="sm"
        disabled={props.disabled}
      >
        {props.children}
      </Form.Select>
    </FormItem>
  );
}

function SelectOptions({ value }: { value: number }) {
  const ret = [];
  for (let i = 0; i <= value; i++) {
    ret.push(
      <option value={i} key={i}>
        {i}
      </option>
    );
  }
  return ret;
}

function FormNumber(props: {
  name: string;
  label: ReactNode;
  labelHidden?: boolean;
  value: number;
  defaultValue?: number;
  onChange: (value: number) => void;
  isValid: (arg: number) => boolean;
  sign?: ReactNode;
  leftButton?: boolean;
}) {
  const [text, setText] = useState<null | string>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isInvalid = text !== null;
  const defaultValue = (props.defaultValue ?? 0).toString();

  function handleChange(value: string) {
    const v = Number.parseInt(value);
    if (props.isValid(v)) {
      props.onChange(v);
      setText(null);
    } else {
      setText(value);
    }
  }

  function handleReset() {
    handleChange(defaultValue);
    inputRef.current?.focus();
  }

  const button = (
    <InputGroup.Text
      role="button"
      onClick={handleReset}
      className="panel-number-btn"
    >
      {props.sign ?? "%"}
    </InputGroup.Text>
  );

  return (
    <FormItem {...props}>
      <InputGroup size="sm" hasValidation={isInvalid}>
        {props.leftButton && button}
        <Form.Control
          type="number"
          value={isInvalid ? text : props.value}
          onChange={(e) => handleChange(e.target.value)}
          isInvalid={isInvalid}
          ref={inputRef}
        />
        {!props.leftButton && button}
        {isInvalid && (
          <Form.Control.Feedback type="invalid">
            無効な値です。
          </Form.Control.Feedback>
        )}
      </InputGroup>
    </FormItem>
  );
}

function CardButtonGroup({
  label,
  children,
}: {
  label: string;
  children: [ReactNode, ReactNode];
}) {
  const cardColProps: ColProps = {
    xs: 12,
    md: 6,
    xl: 4,
  };

  return (
    <FormGroup label={label}>
      <Col xs={12} md={10}>
        <Row>
          <Col {...cardColProps} className="pb-1 pb-md-0">
            {children[0]}
          </Col>
          <Col {...cardColProps}>{children[1]}</Col>
        </Row>
      </Col>
    </FormGroup>
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
    FormSelect,
    SelectOptions,
    FormNumber,
    CardButtonGroup,
  }
);
