import Image, { type ImageProps } from "next/image";
import IconToggler from "./IconToggler";

const ASSETS_PATH = "/assets/";

interface Props {
  className?: string | undefined;
}

type IconProps = Omit<ImageProps, "src" | "alt"> & { alt?: string | undefined };

function Logo({ className, alt }: Omit<ImageProps, "src">) {
  return (
    <Image
      src={ASSETS_PATH + "logo.png?20251115"}
      width={40}
      height={40}
      alt={alt}
      className={className}
      priority
    />
  );
}

function Icon1(props: IconProps) {
  return (
    <Image
      {...props}
      src={ASSETS_PATH + "icon1.png"}
      width={200}
      height={200}
      priority
      alt={props.alt ?? ""}
    />
  );
}

function Icon2(props: IconProps) {
  return (
    <Image
      {...props}
      src={ASSETS_PATH + "icon2.png"}
      width={200}
      height={200}
      priority
      alt={props.alt ?? ""}
    />
  );
}

function Loading({ className }: Props) {
  return <Icon1 className={className} alt="loading..." />;
}

function EmptyAlert({ className }: Props) {
  return <IconToggler className={className} />;
}

function NotFound({ className }: Props) {
  return <IconToggler className={className} />;
}

function OffCanvas({ className }: Props) {
  return <IconToggler className={className} />;
}

const Images = {
  Logo,
  Icon1,
  Icon2,
  Loading,
  EmptyAlert,
  NotFound,
  OffCanvas,
};

export default Images;
