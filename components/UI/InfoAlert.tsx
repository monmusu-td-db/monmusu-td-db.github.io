import { Alert, Col, Row } from "react-bootstrap";
import Images from "./Images";
import Icon from "./Icon";
import type { ReactNode } from "react";
import "./InfoAlert.css";
import cn from "classnames";

function InfoAlert({
  variant,
  className,
  rowClassName,
  icon,
  iconClassName,
  children,
}: {
  variant: string;
  className?: string;
  rowClassName?: string;
  icon: ReactNode;
  iconClassName?: string;
  children: ReactNode;
}) {
  return (
    <Alert variant={variant} className={className}>
      <Row className={rowClassName}>
        <Col xs={12} sm={5} md={4}>
          <div className={cn("mx-auto info-alert-icon-wrapper", iconClassName)}>
            {icon}
          </div>
        </Col>
        <Col xs={12} sm={7} md={8} className="d-flex align-items-center">
          {children}
        </Col>
      </Row>
    </Alert>
  );
}

function Empty() {
  const icon = (
    <>
      <Images.EmptyAlert className="d-block" />
      <Icon.InfoFill width={40} height={40} />
    </>
  );
  return (
    <InfoAlert
      variant="info"
      className="mx-2"
      rowClassName="empty-alert-row"
      icon={icon}
      iconClassName="info"
    >
      表示結果がありませんでした。フィルターや検索ワードを確認してください。
    </InfoAlert>
  );
}

function Warning() {
  const icon = (
    <>
      <Images.NotFound className="d-block" />
      <Icon.ExclamationDiamondFill width={40} height={40} />
    </>
  );
  return (
    <InfoAlert variant="warning" icon={icon} iconClassName="warning">
      ページが見つかりませんでした。
    </InfoAlert>
  );
}

export default Object.assign(InfoAlert, {
  Empty,
  Warning,
});
