"use client";

import dynamic from "next/dynamic";

const Yap = dynamic(() => import("./YapApp"), { ssr: false });

export function ClientOnly() {
  return <Yap />;
}
