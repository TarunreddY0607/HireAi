import { useState, useEffect } from "react";
import "./AppUpdater.css";
import { HiSparkles } from "react-icons/hi2";
import { FiDownloadCloud, FiArrowRight } from "react-icons/fi";

// Dynamic app build version
export const CURRENT_APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.4";

function AppUpdater() {
    const [updateInfo, setUpdateInfo] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Run check 3s after app mount
        const timer = setTimeout(() => {
            checkForUpdate();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const checkForUpdate = async () => {
        try {
            const res = await fetch("https://api.github.com/repos/TarunreddY0607/HireAi/releases/latest", {
                headers: {
                    "Accept": "application/vnd.github.v3+json"
                }
            });

            if (!res.ok) return;

            const release = await res.json();
            const latestTag = release.tag_name || "";
            const cleanLatest = latestTag.replace(/^v/, "").trim();
            const cleanCurrent = CURRENT_APP_VERSION.replace(/^v/, "").trim();

            // Check if user already updated or snoozed this version
            const snoozedTime = localStorage.getItem(`snoozed_update_${latestTag}`);
            if (snoozedTime && Date.now() - Number(snoozedTime) < 24 * 60 * 60 * 1000) {
                return; // Don't prompt again for 24 hours if snoozed
            }

            const installed = localStorage.getItem("updated_to_version");
            if (installed === cleanLatest) {
                return;
            }

            // Compare versions (semver style)
            if (isNewerVersion(cleanLatest, cleanCurrent)) {
                let downloadUrl = release.html_url;
                if (release.assets && release.assets.length > 0) {
                    const apkAsset = release.assets.find(a => a.name.endsWith(".apk"));
                    if (apkAsset) {
                        downloadUrl = apkAsset.browser_download_url;
                    }
                }

                setUpdateInfo({
                    version: latestTag,
                    cleanVersion: cleanLatest,
                    notes: release.body || "New features, performance enhancements, and UI design improvements.",
                    downloadUrl: downloadUrl
                });
                setIsOpen(true);
            }
        } catch (err) {
            console.log("App update check skipped:", err.message);
        }
    };

    const isNewerVersion = (latest, current) => {
        const p1 = latest.split(".").map(Number);
        const p2 = current.split(".").map(Number);
        for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
            const v1 = p1[i] || 0;
            const v2 = p2[i] || 0;
            if (v1 > v2) return true;
            if (v1 < v2) return false;
        }
        return false;
    };

    const handleUpdateNow = () => {
        if (updateInfo?.cleanVersion) {
            localStorage.setItem("updated_to_version", updateInfo.cleanVersion);
        }
        if (updateInfo?.downloadUrl) {
            window.open(updateInfo.downloadUrl, "_system");
        }
        setIsOpen(false);
    };

    const handleLater = () => {
        if (updateInfo?.version) {
            localStorage.setItem(`snoozed_update_${updateInfo.version}`, String(Date.now()));
        }
        setIsOpen(false);
    };

    if (!isOpen || !updateInfo) return null;

    return (
        <div className="updater-overlay" role="dialog" aria-modal="true">
            <div className="updater-modal">
                <div className="updater-header">
                    <div className="updater-icon-badge">
                        <HiSparkles />
                    </div>
                    <h3>Update Available</h3>
                    <p>A new version of HireAI is ready to install</p>
                </div>

                <div className="updater-body">
                    <div className="version-pill-row">
                        <span className="version-current">Current: v{CURRENT_APP_VERSION}</span>
                        <FiArrowRight className="version-arrow" />
                        <span className="version-new">Latest: {updateInfo.version}</span>
                    </div>

                    <div className="updater-notes-box">
                        <h5>What's New:</h5>
                        <p>{updateInfo.notes}</p>
                    </div>

                    <div className="updater-footer">
                        <button className="btn-update-later" onClick={handleLater}>
                            Later
                        </button>
                        <button className="btn-update-now" onClick={handleUpdateNow}>
                            <FiDownloadCloud />
                            <span>Update Now</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppUpdater;
