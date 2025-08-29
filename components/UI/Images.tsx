import Image from "next/image";

interface Props {
  className?: string;
}

function Logo({ className, alt }: Props & { alt: string }) {
  return (
    <Image
      src={"/logo.png"}
      width={40}
      height={40}
      alt={alt}
      className={className}
      priority
    />
  );
}

function Loading({ className }: Props) {
  return (
    <Image
      src="/loading.png"
      width={200}
      height={200}
      alt="Loading..."
      priority
      className={className}
    />
  );
}

function EmptyAlert({ className }: Props) {
  return (
    <Image
      src="/loading.png" // TODO
      width={200}
      height={200}
      alt=""
      priority
      className={className}
    />
  );
}

function NotFound({ className }: Props) {
  return (
    <Image
      src="/loading.png" // TODO
      width={200}
      height={200}
      alt=""
      priority
      className={className}
    />
  );
}

function OffCanvas({ className }: Props) {
  return (
    <Image
      src="/loading.png" // TODO
      width={200}
      height={200}
      alt=""
      priority
      className={className}
    />
  );
}

const Images = {
  Logo,
  Loading,
  EmptyAlert,
  NotFound,
  OffCanvas,
};

export default Images;
