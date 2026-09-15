import { useState, useEffect } from "react";
import { CURRENT_APP_VERSION } from "../components/AppUpdater/AppUpdater";

export function useAppVersion() {
    const [versionData, setVersionData] = useState({
        currentVersion: `v${CURRENT_APP_VERSION.replace(/^v/, "")}`,
        latestVersion: `v${CURRENT_APP_VERSION.replace(/^v/, "")}`,
        hasUpdate: false,
        downloadUrl: `https://github.com/TarunreddY0607/HireAi/releases/tag/v${CURRENT_APP_VERSION.replace(/^v/, "")}`,
        isChecking: true
    });

    useEffect(() => {
        fetch("https://api.github.com/repos/TarunreddY0607/HireAi/releases/latest", {
            headers: {
                "Accept": "application/vnd.github.v3+json"
            }
        })
        .then(res => res.ok ? res.json() : null)
        .then(release => {
            if (!release) {
                setVersionData(prev => ({ ...prev, isChecking: false }));
                return;
            }

            const latestTag = release.tag_name || `v${CURRENT_APP_VERSION}`;
            const cleanLatest = latestTag.replace(/^v/, "").trim();
            const cleanCurrent = CURRENT_APP_VERSION.replace(/^v/, "").trim();

            const p1 = cleanLatest.split(".").map(Number);
            const p2 = cleanCurrent.split(".").map(Number);
            let newer = false;
            for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
                const v1 = p1[i] || 0;
                const v2 = p2[i] || 0;
                if (v1 > v2) { newer = true; break; }
                if (v1 < v2) { newer = false; break; }
            }

            let downloadUrl = release.html_url;
            if (release.assets && release.assets.length > 0) {
                const apk = release.assets.find(a => a.name.endsWith(".apk"));
                if (apk) downloadUrl = apk.browser_download_url;
            }

            setVersionData({
                currentVersion: `v${cleanCurrent}`,
                latestVersion: latestTag.startsWith("v") ? latestTag : `v${latestTag}`,
                hasUpdate: newer,
                downloadUrl,
                isChecking: false
            });
        })
        .catch(() => {
            setVersionData(prev => ({ ...prev, isChecking: false }));
        });
    }, []);

    return versionData;
}
