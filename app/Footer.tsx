import { Col, Container, Row, Stack } from "react-bootstrap";
import "./Footer.css";
import Icon from "@/components/UI/Icon";
import type { ReactNode } from "react";
import NextLink, { type LinkProps } from "next/link";
import LinkFocusFix from "./LinkFocusFix";

export default function Footer() {
  return (
    <footer className="bd-footer bg-body-tertiary mt-4 py-4">
      <LinkFocusFix />
      <Container className="text-body-secondary">
        <Row>
          <Col xs={8}>
            <Stack direction="horizontal" gap={3}>
              <Link href="/unit">ユニット</Link>
              <Vr />
              <Link href="/buff">バフ</Link>
              <Vr />
              <Link href="/contact">お問い合わせ</Link>
            </Stack>
          </Col>
          <Col xs={4}>
            <Stack direction="horizontal" gap={3}>
              <ExternalLink
                href="https://x.com/kd1042"
                icon={<Icon.TwitterX width={21} height={21} />}
              >
                X
              </ExternalLink>
              <Vr />
              <ExternalLink
                href="#"
                icon={<Icon.GitHub width={21} height={21} />}
              >
                GitHub
              </ExternalLink>
            </Stack>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

function Link(props: LinkProps & { children?: ReactNode }) {
  return <NextLink {...props} className="d-block" />;
}

function Vr() {
  return <div className="vr" />;
}

function ExternalLink({
  children,
  href,
  icon,
}: {
  children: ReactNode;
  href: string;
  icon: ReactNode;
}) {
  return (
    <a href={href} className="d-block">
      {icon}
      <span className="mx-2">{children}</span>
      <Icon.BoxArrowUpRight width={13.5} height={13.5} />
    </a>
  );
}
