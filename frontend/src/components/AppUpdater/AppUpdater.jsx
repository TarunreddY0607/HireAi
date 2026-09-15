import { useEffect } from "react";

// Dynamic app build version
export const CURRENT_APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.4";

function AppUpdater() {
    useEffect(() => {
        // Run silent background version check
        const timer = setTimeout(() => {
            silentVersionSync();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const silentVersionSync = async () => {
        try {
            const res = await fetch("https://api.github.com/repos/TarunreddY0607/HireAi/releases/latest", {
                headers: {
                    "Accept": "application/vnd.github.v3+json"
                }
            });

            if (!res.ok) return;

            const release = await res.json();
            const latestTag = release.tag_name || "";
            if (latestTag) {
                localStorage.setItem("latest_checked_version", latestTag);
                localStorage.setItem("latest_check_time", String(Date.now()));
            }
        } catch (err) {
            console.log("Background version sync skipped:", err.message);
        }
    };

    // Return null so no popup interrupts the user
    return null;
}

export default AppUpdater;
