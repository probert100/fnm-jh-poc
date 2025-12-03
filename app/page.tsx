import Image from "next/image";
import CustSrchComponent from "@/app/components/CustSrchComponent";
import CRMCustDspComponent from "@/app/components/CRMCustDspComponent";
import InfoBanner from "@/app/components/InfoBanner";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-start gap-8 py-32 px-16 bg-white dark:bg-black sm:items-start">


        <InfoBanner />

          <CustSrchComponent />

        <CRMCustDspComponent />

      </main>
    </div>
  );
}
