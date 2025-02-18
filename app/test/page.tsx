"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const SlowComponent = dynamic(() => import("./SlowComponent"), {
  ssr: false,
  loading: () => <>Loading...</>,
});

export default function App() {
  const [value, setValue] = useState(0);
  return (
    <div style={{ width: 800, margin: "auto" }}>
      <Button label="Up" onClick={() => setValue(p => p + 1)} />
      <Button label="Down" onClick={() => setValue(p => p - 1)} />
      <SlowComponent value={value.toString()} />
    </div>
  );
}

function Button({ onClick, label }: { onClick: () => void, label: string }) {
  return (
    <>
      <a href="#" onClick={onClick}>{label}</a>
      <br />
    </>
  );
}
