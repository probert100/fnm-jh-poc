
import InfoBanner from "@/app/components/InfoBanner";
import WebexIntegrationComponent from "@/app/components/WebexIntegrationComponent";
import UserPreferencesComponent from "@/app/components/UserPreferencesComponent";

export default function Webex() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-start gap-8 py-32 px-16 bg-white dark:bg-black sm:items-start">


                <InfoBanner />
                <UserPreferencesComponent />

                <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-200 text-center w-full">Webex Integration Testing</h2>

                <WebexIntegrationComponent />

            </main>
        </div>
    );
}
