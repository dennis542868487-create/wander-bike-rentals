"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

const CHATBASE_ID = "WqLC1J0pcU0oSFy2BCPcT";
const NATIVE_BUTTON_ID = "chatbase-bubble-button";
const NATIVE_WINDOW_ID = "chatbase-bubble-window";

export default function ChatbaseWidget() {
  const pathname = usePathname();
  const isPrivatePage = ["/auth", "/account", "/admin", "/operations"].some(
    (path) => pathname.startsWith(path),
  );
  const [ready, setReady] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (isPrivatePage) return;
    let tries = 0;
    const interval = window.setInterval(() => {
      if (document.getElementById(NATIVE_BUTTON_ID)) {
        document.documentElement.classList.add("wbr-custom-launcher");
        setReady(true);
        window.clearInterval(interval);
      } else if (++tries > 60) {
        window.clearInterval(interval);
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, [isPrivatePage]);

  useEffect(() => {
    if (!ready || isPrivatePage) return;
    const chatWindow = document.getElementById(NATIVE_WINDOW_ID);
    if (!chatWindow) return;
    const sync = () => {
      const open = window.getComputedStyle(chatWindow).display !== "none";
      setChatOpen(open);
      if (open) setTeaser(false);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(chatWindow, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    return () => observer.disconnect();
  }, [ready, isPrivatePage]);

  useEffect(() => {
    if (!ready || isPrivatePage) return;
    try {
      if (sessionStorage.getItem("wbr-teaser-seen")) return;
    } catch {
      // The launcher still works when session storage is unavailable.
    }
    const timeout = window.setTimeout(() => setTeaser(true), 4500);
    return () => window.clearTimeout(timeout);
  }, [ready, isPrivatePage]);

  const closeTeaser = () => {
    setTeaser(false);
    try {
      sessionStorage.setItem("wbr-teaser-seen", "1");
    } catch {
      // A storage failure should not prevent chat from opening.
    }
  };

  const toggleChat = () => {
    closeTeaser();
    document.getElementById(NATIVE_BUTTON_ID)?.click();
  };

  if (isPrivatePage) return null;

  return (
    <>
      <Script id="chatbase-embed" strategy="afterInteractive">
        {`(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="${CHATBASE_ID}";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`}
      </Script>

      {ready ? (
        <div className="wbr-launcher" hidden={chatOpen}>
          {teaser ? (
            <div className="wbr-teaser" role="status">
              <button
                type="button"
                className="wbr-teaser-close"
                aria-label="Dismiss"
                onClick={closeTeaser}
              >
                ×
              </button>
              <button
                type="button"
                className="wbr-teaser-body"
                onClick={toggleChat}
              >
                Need a bike? Ask me 🚲
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className="wbr-fab"
            aria-label="Open chat with Wander Bike Rentals"
            onClick={toggleChat}
          >
            <span className="wbr-fab-ring" aria-hidden="true" />
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7.5 8.5h9M7.5 12h6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.4A1 1 0 0 1 4 18.6V5.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : null}
    </>
  );
}
