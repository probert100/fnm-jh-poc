import Image from "next/image";
import CustSrchComponent from "@/app/components/CustSrchComponent";
import CRMCustDspComponent from "@/app/components/CRMCustDspComponent";
import InfoBanner from "@/app/components/InfoBanner";
import CustSrchByPhoneComponent from "@/app/components/CustSrchByPhoneComponent";
import StartCallComponent from "@/app/components/StartCallComponent";
import UserPreferencesComponent from "@/app/components/UserPreferencesComponent";
import AboutComponent from "@/app/components/AboutComponent";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-start gap-8 py-32 px-16 bg-white dark:bg-black sm:items-start">


        <InfoBanner /><AboutComponent/>
          <UserPreferencesComponent />

        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-200 text-center w-full">Phone based test searches</h2>

        <div className="flex gap-6 w-full">

          <div className="flex-1">
              <StartCallComponent />

          </div>
          <div className="flex-1">
            <CustSrchByPhoneComponent />
          </div>
        </div>

        <hr className="w-full border-t border-gray-300" />

        <div className="flex gap-6 w-full">
            <div className="flex-1">
                 <CRMCustDspComponent />
            </div>
            <div className="flex-1">
                <CustSrchComponent />
            </div>
        </div>

      </main>
    </div>
  );
}
