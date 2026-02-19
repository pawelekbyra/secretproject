import { headers } from "next/headers";
import AppLayout from "@/components/AppLayout";
import DesktopDeviceFrame from "@/components/layout/DesktopDeviceFrame";
import BMCWidget from "@/components/layout/BMCWidget";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || "";

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
