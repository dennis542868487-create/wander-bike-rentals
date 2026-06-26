"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

// Chatbase chatbot id — dashboard URL /chatbot/<ID>/deploy
const CHATBASE_ID = "WqLC1J0pcU0oSFy2BCPcT";
// The launcher button Chatbase injects into the page. We hide it and drive it
// from our own branded button so we control the look and the animation.
const NATIVE_BUTTON_ID = "chatbase-bubble-button";

export default function ChatbaseWidget() {
  const [ready, setReady] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const dismissed = useRef(false);

  // Wait for Chatbase's native launcher to mount, hide it, then reveal ours.
  // If it never appears we leave Chatbase's own button alone so chat is never
  // unreachable.
  useEffect(() => {
    let tries = 0;
    const id = window.setInterval(() => {
      if (document.getElementById(NATIVE_BUTTON_ID)) {
        document.documentElement.classList.add("wbr-custom-launcher");
        setReady(true);
        window.clearInterval(id);
      } else if (++tries > 60) {
        window.clearInterval(id); // give up after ~30s
      }
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  // Nudge the visitor once per session, a few seconds after the launcher is live.
  useEffect(() => {
    if (!ready) return;
    try {
      if (sessionStorage.getItem("wbr-teaser-seen")) return;
    } catch {}
    const t = window.setTimeout(() => setTeaser(true), 4500);
    return () => window.clearTimeout(t);
  }, [ready]);

  const closeTeaser = () => {
    setTeaser(false);
    dismissed.current = true;
    try {
      sessionStorage.setItem("wbr-teaser-seen", "1");
    } catch {}
  };

  const toggleChat = () => {
    closeTeaser();
    document.getElementById(NATIVE_BUTTON_ID)?.click();
  };

  return (
    <>
      <Script id="chatbase-embed" strategy="afterInteractive">
        {`(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="${CHATBASE_ID}";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`}
      </Script>

      {ready && (
        <div className="wbr-launcher">
          {teaser && (
            <div className="wbr-teaser" role="status">
              <button
                type="button"
                className="wbr-teaser-close"
                aria-label="Dismiss"
                onClick={closeTeaser}
              >
                ×
              </button>
              <button type="button" className="wbr-teaser-body" onClick={toggleChat}>
                Need a bike? Ask me 🚲
              </button>
            </div>
          )}

          <button
            type="button"
            className="wbr-fab"
            aria-label="Open chat with Wander Bike Rentals"
            onClick={toggleChat}
          >
            <span className="wbr-fab-ring" aria-hidden="true" />
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
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
      )}
    </>
  );
}
