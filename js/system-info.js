async function getSystemInfo() {
    const info = {
        browserName: "Unknown",
        browserVersion: "Unknown",
        browserEngine: "Unknown",
        browserCore: "Unknown",
        osName: "Unknown",
        osVersion: "Unknown",
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        isRetina: window.devicePixelRatio > 1,
    };

    // --- Screen Info ---
    info.screenInfo = `${info.screenWidth} x ${info.screenHeight}`;
    if (info.isRetina) {
        info.screenInfo += " (Retina/High-DPI)";
    }

    // --- OS Info ---
    // Try modern userAgentData first (more reliable)
    if (navigator.userAgentData) {
        try {
            const uaData = navigator.userAgentData;
            const highEntropyValues = await uaData.getHighEntropyValues([
                "platform",
                "platformVersion",
                "architecture", // Optional, but can be useful
                "model", // Optional
                "uaFullVersion" // Deprecated but fallback
            ]);

            info.osName = highEntropyValues.platform || "Unknown";
            info.osVersion = highEntropyValues.platformVersion || "";

            // Refine OS Name (optional)
            if (info.osName === "Windows") info.osName = "Windows"; // Consistent casing
            else if (info.osName === "macOS") info.osName = "OS X"; // Match user request format

        } catch (error) {
            console.warn("Could not get high entropy User-Agent data:", error);
            // Fallback to userAgent string parsing if high entropy fails
            parseUserAgentString(info);
        }
    } else {
        // Fallback for browsers without userAgentData
       parseUserAgentString(info);
    }


    // --- Browser Info ---
     // Try modern userAgentData first
    if (navigator.userAgentData) {
         try {
             const uaData = navigator.userAgentData;
             const brands = uaData.brands;
             // Attempt to get full version list for more accuracy
             const highEntropyValues = await uaData.getHighEntropyValues(["fullVersionList"]);
             const detailedBrands = highEntropyValues.fullVersionList || brands;

             // Find the most significant brand (usually not "Chromium" or "Google Chrome" if others exist)
             let primaryBrand = detailedBrands.find(b => !/^(Chromium|Google Chrome|Not.*A.*Brand)$/i.test(b.brand));
             if (!primaryBrand && detailedBrands.length > 0) {
                // Fallback to the first brand if no "better" one is found
                primaryBrand = detailedBrands[0];
             }

             if(primaryBrand) {
                 info.browserName = primaryBrand.brand;
                 info.browserVersion = primaryBrand.version;
             } else if (brands.length > 0) {
                 // Basic fallback if fullVersionList fails
                 info.browserName = brands[brands.length - 1].brand; // Often the last one is most specific
                 info.browserVersion = brands[brands.length - 1].version;
             }

             // Determine Engine/Core
             if (brands.some(b => /Chromium/i.test(b.brand))) {
                 info.browserEngine = "Blink";
                 info.browserCore = "Chromium";
             } else if (brands.some(b => /WebKit/i.test(b.brand))) {
                 info.browserEngine = "WebKit";
                 info.browserCore = "WebKit"; // Safari's core
             } else if (navigator.userAgent.includes("Firefox")) { // Firefox doesn't expose Gecko via userAgentData brands well yet
                 info.browserEngine = "Gecko";
                 info.browserCore = "Gecko";
             }
             // Add more engine checks if needed (e.g., specific Opera versions)


         } catch (error) {
              console.warn("Could not get detailed browser User-Agent data:", error);
              // Fallback to userAgent string parsing if high entropy fails
              parseUserAgentString(info); // Call again to ensure browser info is parsed if needed
         }

    } else {
         // Fallback for browsers without userAgentData (already called for OS, ensure browser part runs)
         parseUserAgentString(info);
    }


    // --- Helper for User Agent String Parsing (Fallback) ---
    function parseUserAgentString(targetInfo) {
        const ua = navigator.userAgent;

        // OS Parsing (if not already found via userAgentData)
        if (targetInfo.osName === "Unknown") {
            if (/Windows NT 10.0/.test(ua)) targetInfo.osName = "Windows 10/11";
            else if (/Windows NT 6.3/.test(ua)) targetInfo.osName = "Windows 8.1";
            else if (/Windows NT 6.2/.test(ua)) targetInfo.osName = "Windows 8";
            else if (/Windows NT 6.1/.test(ua)) targetInfo.osName = "Windows 7";
            else if (/Windows NT 6.0/.test(ua)) targetInfo.osName = "Windows Vista";
            else if (/Windows NT 5.1/.test(ua)) targetInfo.osName = "Windows XP";
            else if (/Mac OS X ([0-9_]+)/.test(ua)) {
                 targetInfo.osName = "OS X";
                 targetInfo.osVersion = RegExp.$1.replace(/_/g, '.');
            } else if (/Linux/.test(ua)) targetInfo.osName = "Linux";
            else if (/iPhone OS ([0-9_]+)/.test(ua)) {
                targetInfo.osName = "iOS";
                targetInfo.osVersion = RegExp.$1.replace(/_/g, '.');
            } else if (/iPad;.* CPU OS ([0-9_]+)/.test(ua)){
                 targetInfo.osName = "iPadOS";
                 targetInfo.osVersion = RegExp.$1.replace(/_/g, '.');
            } else if (/Android ([0-9.]+)/.test(ua)) {
                targetInfo.osName = "Android";
                targetInfo.osVersion = RegExp.$1;
            }
        }

        // Browser Parsing (if not already found via userAgentData)
         if (targetInfo.browserName === "Unknown") {
             let match;
             if ((match = ua.match(/(Edg|Edge)\/([\d.]+)/))) { // Edge (Chromium) or Edge (Legacy)
                 targetInfo.browserName = "Edge";
                 targetInfo.browserVersion = match[2];
                 targetInfo.browserEngine = "Blink"; // Modern Edge
                 targetInfo.browserCore = "Chromium";
                 if(match[1] === "Edge") { // Legacy EdgeHTML
                    targetInfo.browserEngine = "EdgeHTML";
                    targetInfo.browserCore = "EdgeHTML";
                 }
             } else if ((match = ua.match(/Firefox\/([\d.]+)/))) {
                 targetInfo.browserName = "Firefox";
                 targetInfo.browserVersion = match[1];
                 targetInfo.browserEngine = "Gecko";
                 targetInfo.browserCore = "Gecko";
             } else if ((match = ua.match(/OPR\/([\d.]+)/))) { // Opera (Blink)
                 targetInfo.browserName = "Opera";
                 targetInfo.browserVersion = match[1];
                 targetInfo.browserEngine = "Blink";
                 targetInfo.browserCore = "Chromium";
             } else if ((match = ua.match(/Chrome\/([\d.]+)/)) && !ua.includes("Edg")) { // Chrome (make sure not Edge)
                 targetInfo.browserName = "Chrome";
                 targetInfo.browserVersion = match[1];
                 targetInfo.browserEngine = "Blink";
                 targetInfo.browserCore = "Chromium";
             } else if ((match = ua.match(/Safari\/([\d.]+)/)) && ua.includes("Version/")) { // Safari
                  // Extract version from 'Version/' part
                 let versionMatch = ua.match(/Version\/([\d.]+)/);
                 targetInfo.browserName = "Safari";
                 targetInfo.browserVersion = versionMatch ? versionMatch[1] : match[1]; // Prefer Version/ if available
                 targetInfo.browserEngine = "WebKit";
                 targetInfo.browserCore = "WebKit";
             } else if ((match = ua.match(/MSIE ([\d.]+)/)) || (match = ua.match(/Trident.*rv:([\d.]+)/))) { // IE
                 targetInfo.browserName = "Internet Explorer";
                 targetInfo.browserVersion = match[1];
                 targetInfo.browserEngine = "Trident";
                 targetInfo.browserCore = "Trident";
             }
         }
    }

    return info;
}

function displaySystemInfo() {
    getSystemInfo().then(info => {
        const browserEl = document.getElementById('browser-info');
        const coreEl = document.getElementById('core-info');
        const osEl = document.getElementById('os-info');
        const screenEl = document.getElementById('screen-info');

        if (browserEl) {
            browserEl.textContent = `Your browser: ${info.browserName} version ${info.browserVersion} (Engine: ${info.browserEngine})`;
        }
        if (coreEl) {
            coreEl.textContent = `Your true browser core: ${info.browserCore}`;
        }
        if (osEl) {
             // Combine OS name and version, handling cases where version might be empty
             let osText = `Your Operating system: ${info.osName}`;
             if (info.osVersion) {
                 osText += ` ${info.osVersion}`;
             }
            osEl.textContent = osText;
        }
        if (screenEl) {
            screenEl.textContent = `Your Screen size: ${info.screenInfo}`;
        }

    }).catch(error => {
        console.error("Error getting system info:", error);
        // Optionally display an error message on the page
        const errorEl = document.getElementById('system-info-error'); // Add an element with this ID if desired
        if (errorEl) {
            errorEl.textContent = "Could not retrieve system details.";
        }
    });
}

// Run the function when the DOM is ready
document.addEventListener('DOMContentLoaded', displaySystemInfo);