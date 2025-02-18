import { memo, useDeferredValue } from "react";

export default function SlowComponent({ value }: { value: string }) {
  const deferredValue = useDeferredValue(value);
  const isPending = value !== deferredValue;
  return (
    <span style={{ opacity: isPending ? 0.5 : 1 }}>
      <Item value={deferredValue} />
    </span>
  );
}

const Item = memo(function Item({ value }: { value: string }) {
  const startTime = performance.now();
  while (performance.now() - startTime < 500) {
  }
  return <>Value:{value}</>;
});
