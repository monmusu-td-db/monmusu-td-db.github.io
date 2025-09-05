import { Col, Container, Row } from "react-bootstrap";
import "./Footer.css";
import Icon from "@/components/UI/Icon";
import type { ReactNode } from "react";
import NextLink, { type LinkProps } from "next/link";

export default function Footer() {
  return (
    <footer className="bd-footer bg-body-secondary pt-4 pb-3">
      <Container className="text-body-secondary">
        <Row>
          <Col md={8}>
            <div className="bd-footer-text mb-3">
              <Link href="/">メインページ</Link>
              <Link href="/unit">ユニット</Link>
              <Link href="/buff">バフ</Link>
              <Link href="https://forms.gle/G33dyiF9kU5hXm3k8">
                お問い合わせ
              </Link>
            </div>
          </Col>
          <Col md={4}>
            <div className="bd-footer-text mb-3">
              <ExternalLink
                href="https://x.com/kd1042"
                icon={<Icon.TwitterX width={21} height={21} />}
              >
                X
              </ExternalLink>
              <ExternalLink
                href="https://github.com/monmusu-td-db/monmusu-td-db.github.io"
                icon={<Icon.GitHub width={21} height={21} />}
              >
                GitHub
              </ExternalLink>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

function Link(props: LinkProps & { children?: ReactNode }) {
  return (
    <div>
      <NextLink {...props} />
    </div>
  );
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
    <div>
      <a href={href}>
        {icon}
        <span className="mx-2">{children}</span>
        <Icon.BoxArrowUpRight width={14} height={14} />
      </a>
    </div>
  );
}
