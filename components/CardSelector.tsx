import {
  Fragment,
  memo,
  useCallback,
  useState,
  type MouseEventHandler,
} from "react";
import {
  Button as BButton,
  Card,
  Col,
  Modal,
  Row,
  type ModalProps,
} from "react-bootstrap";
import * as Data from "./Data";
import classNames from "classnames";
import bClassNames from "classnames/bind";
import styles from "./CardSelector.module.css";

const cx = bClassNames.bind(styles);

interface Resource {
  id: number;
  name: string;
  rarity: Data.Rarity;
  desc: string;
}

interface Props {
  src: Resource | undefined;
}

interface ButtonProps extends Props {
  disabled?: boolean | undefined;
  onClick?: MouseEventHandler;
}
function Button(props: ButtonProps) {
  const src = props.src;

  const cardClassNames = [
    "ms-auto me-auto",
    cx("button", {
      disabled: props.disabled,
      "table-c-yellow": src?.rarity === Data.Rarity.L,
      "table-c-indigo": src?.rarity === Data.Rarity.E,
      "table-c-blue": src?.rarity === Data.Rarity.R,
      "table-c-gray": src?.rarity === Data.Rarity.C || src === undefined,
    }),
  ];

  const cardHeaderColor = {
    "table-c-yellow-300": src?.rarity === Data.Rarity.L,
    "table-c-indigo-300": src?.rarity === Data.Rarity.E,
    "table-c-blue-300": src?.rarity === Data.Rarity.R,
    "table-c-gray-400": src?.rarity === Data.Rarity.C,
  };

  let role, onClick;
  if (!props.disabled) {
    role = "button";
    onClick = props.onClick;
  }

  return (
    <Card className={classNames(cardClassNames)} role={role} onClick={onClick}>
      {src !== undefined && (
        <>
          <Card.Header className={classNames(cardHeaderColor)}>
            <span className="me-2">{src.rarity}</span>
            <span>{src.name}</span>
          </Card.Header>
          <Card.Body>
            <div className="d-grid h-100 align-items-center text-break">
              {src.desc.split("\n").map((v, i) => (
                <Fragment key={i}>
                  {i !== 0 && <br />}
                  {v}
                </Fragment>
              ))}
            </div>
          </Card.Body>
        </>
      )}
    </Card>
  );
}

function useSelector(onSelect: undefined | ((id: number) => void)) {
  const [show, setShow] = useState(false);

  const handleOpen = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleSelect = useCallback(
    (id: number) => {
      handleClose();
      onSelect?.(id);
    },
    [onSelect]
  );
  const handleRemove = () => handleSelect(-1);

  return {
    show,
    handleOpen,
    handleClose,
    handleSelect,
    handleRemove,
  };
}

interface SelectorBaseProps {
  list: readonly Resource[];
  onSelect?: (id: number) => void;
  disabled?: boolean | undefined;
}
export interface SelectorProps extends Props, SelectorBaseProps {}
interface SelectorModalProps extends SelectorProps {
  title: string;
}
function Selector(props: SelectorModalProps) {
  const selector = useSelector(props.onSelect);
  return (
    <>
      <Button
        src={props.src}
        onClick={selector.handleOpen}
        disabled={props.disabled}
      />
      <SelectorModal show={selector.show} onHide={selector.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{props.title}</Modal.Title>
          <RemoveButton
            className="ms-5 me-auto"
            onClick={selector.handleRemove}
          />
        </Modal.Header>
        <Modal.Body>
          <Row className="gx-2 gy-2 pb-2 mb-3">
            <Items
              {...props}
              disabled={!selector.show}
              onSelect={selector.handleSelect}
            />
          </Row>
        </Modal.Body>
      </SelectorModal>
    </>
  );
}

function SelectorModal(props: ModalProps) {
  const modalClassNames = cx("selector-modal", { disabled: !props.show });
  const dialogClassNames = cx("selector-dialog");
  const backdropClassNames = cx("selector-backdrop");

  return (
    <Modal
      {...props}
      className={modalClassNames}
      dialogClassName={dialogClassNames}
      backdropClassName={backdropClassNames}
      scrollable
    >
      {props.children}
    </Modal>
  );
}

function RemoveButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string | undefined;
}) {
  return (
    <Col xs={2} className={classNames("d-grid", className)}>
      <BButton variant="danger" onClick={onClick}>
        はずす
      </BButton>
    </Col>
  );
}

interface ItemsProps extends SelectorBaseProps {
  disabled: boolean;
}
function Items(props: ItemsProps) {
  const handleSelect = (id: number) => props.onSelect?.(id);
  return (
    <>
      {props.list.map((item) => (
        <Col key={item.id} lg={4} sm={6}>
          <Button
            disabled={props.disabled}
            src={item}
            onClick={() => handleSelect(item.id)}
          />
        </Col>
      ))}
    </>
  );
}

interface RarityContainerProps extends ItemsProps {
  rarity: Data.Rarity;
}
const RarityContainer = memo(function RarityContainer(
  props: RarityContainerProps
) {
  const list = props.list.filter((item) => item.rarity === props.rarity);
  if (list.length === 0) return;

  return (
    <Row className="border p-1 rounded gx-2 gy-2 pb-2 mb-3">
      <Col xs={12} className="d-grid gy-0">
        <div className="ms-auto me-auto">
          <span className="me-2">{props.rarity}</span>
          <span>{Data.Rarity.alias[props.rarity]}</span>
        </div>
      </Col>
      <Items {...props} list={list} />
    </Row>
  );
});

export default Object.assign(Selector, {
  Button,
  useSelector,
  Modal: SelectorModal,
  RarityContainer,
  RemoveButton,
});
