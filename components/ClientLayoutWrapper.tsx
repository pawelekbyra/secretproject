"use client";

import { usePathname } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import DesktopDeviceFrame from "@/components/layout/DesktopDeviceFrame";
import BMCWidget from "@/components/layout/BMCWidget";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/robert") || pathname.startsWith("/setup")) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <>
      <div className="hidden md:block h-full">
        <DesktopDeviceFrame>
          <AppLayout>{children}</AppLayout>
        </DesktopDeviceFrame>
      </div>
      <div className="block md:hidden h-full w-full">
         <AppLayout>{children}</AppLayout>
      </div>

      <BMCWidget />
    </>
  );
}
