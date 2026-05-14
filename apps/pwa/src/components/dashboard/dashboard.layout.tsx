import { Navbar } from "./dashboard.component.navbar";
import { Sidebar } from "./dashboard.component.sidebar";
import { BottomNavBar } from "./dashboard.component.bottom-navbar";
import { RestrictedBanner } from "../subscription/RestrictedBanner";
import { useAuth } from "../auth/auth.context.provider";
import { useCurrentSubscription } from "../subscription/subscription.hooks";

interface RootLayoutProps {
    children: React.ReactNode;
    showSidebar?: boolean;
}

export function RootLayout({ children, showSidebar = true }: RootLayoutProps) {

    const { selectedRole } = useAuth();
    const orgId = selectedRole?.organization || null;
    const { data: currentSubscription } = useCurrentSubscription(orgId ?? undefined);

    // Check if we have restricted mode banner to show
    const showRestrictedBanner = currentSubscription?.restricted && currentSubscription?.overages && currentSubscription.overages.length > 0;

    return (
        <div className="bg-slate-50 p-4 gap-6 h-screen flex flex-col max-w-6xl mx-auto overflow-hidden relative">
            <Navbar />
            <div className="grow gap-6 flex flex-col lg:flex-row overflow-hidden pb-20 lg:pb-0">
                {showSidebar && <Sidebar className="hidden lg:flex col-span-1" />}
                <main className="col-span-4 flex flex-col grow overflow-hidden">
                    {showRestrictedBanner && (
                        <RestrictedBanner
                            overages={currentSubscription.overages}
                            restrictedSince={currentSubscription.subscription?.restrictedSince}
                        />
                    )}
                    {children}
                </main>
            </div>
            <div className="hidden lg:block">
                <p className="text-sm text-neutral-400 text-center">نسخه آزمایشی . انتشار عمومی</p>
            </div>
            <BottomNavBar />
        </div>
    );
}
