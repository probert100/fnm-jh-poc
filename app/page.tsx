import Image from "next/image";
import CustSrchComponent from "@/app/components/CustSrchComponent";
import CRMCustDspComponent from "@/app/components/CRMCustDspComponent";
import InfoBanner from "@/app/components/InfoBanner";
import CustSrchByPhoneComponent from "@/app/components/CustSrchByPhoneComponent";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-start gap-8 py-32 px-16 bg-white dark:bg-black sm:items-start">


        <InfoBanner />

        <div className="flex gap-6 w-full">
          <div className="flex-1">
            <CustSrchComponent />
          </div>
          <div className="flex-1">
            <CustSrchByPhoneComponent />
          </div>
        </div>

        <div className="flex justify-center w-full">
          <CRMCustDspComponent />
        </div>

      </main>
    </div>
  );
}
