import type { ReactNode } from "react";
import {
  Col,
  Container,
  Form,
  Row,
  ToggleButton,
  ToggleButtonGroup,
  type ColProps,
} from "react-bootstrap";
import * as Data from "./Data";
import cn from "classnames";
import bcn from "classnames/bind";
import style from "./ModalUI.module.css";

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
        <Form.Label column="sm" sm={2}>
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
    >
      {label}
    </ToggleButton>
  );
  if (grid) return <FormGrid sm={3}>{ret}</FormGrid>;
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
      grid
    />
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
  }
);
