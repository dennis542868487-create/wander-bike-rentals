"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  WebsiteContent,
  WebsiteFieldRenderBinding,
} from "@/lib/website-cms/definitions";
import { websiteCmsMessages } from "@/components/website-cms/content-runtime";

type GenericContentRuntimeProps = {
  initialContent: WebsiteContent;
  renderBindings: WebsiteFieldRenderBinding[];
  previewMode: boolean;
  children: ReactNode;
};

export function GenericContentRuntime({
  initialContent,
  renderBindings,
  previewMode,
  children,
}: GenericContentRuntimeProps) {
  const [content, setContent] = useState(initialContent);
  const originalTextNodes = useState(() => new Map<Text, string>())[0];

  useEffect(() => {
    if (!previewMode) return;
    document.documentElement.dataset.genericCmsMounted = "true";
    return () => {
      delete document.documentElement.dataset.genericCmsMounted;
    };
  }, [previewMode]);

  useEffect(() => {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          const value = node.textContent?.replace(/\s+/g, " ").trim();
          if (
            !parent ||
            !value ||
            ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName) ||
            parent.closest("[data-generic-cms-ignore]")
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );
    while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

    const exactOccurrences = new Map<string, number>();
    let orderedCursor = 0;
    for (const textNode of textNodes) {
      if (!originalTextNodes.has(textNode)) {
        originalTextNodes.set(textNode, textNode.textContent ?? "");
      }
      const value =
        originalTextNodes.get(textNode)?.replace(/\s+/g, " ").trim() ?? "";
      for (let index = 0; index < renderBindings.length; index += 1) {
        const binding = renderBindings[index];
        const key = binding.sourceKey ?? `content.${index + 1}`;
        if (binding.mode === "ordered") {
          if (orderedCursor !== index) continue;
          textNode.textContent = content[key] ?? textNode.textContent;
          orderedCursor += 1;
          break;
        }
        if (binding.value !== value) continue;
        const occurrence = exactOccurrences.get(value) ?? 0;
        exactOccurrences.set(value, occurrence + 1);
        if ((binding.occurrence ?? 0) !== occurrence) continue;
        textNode.textContent = content[key] ?? textNode.textContent;
        break;
      }
    }
  }, [content, originalTextNodes, renderBindings]);

  useEffect(() => {
    if (!previewMode) return;
    document.documentElement.dataset.websitePreview = "true";
    const receiveUpdate = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const message = event.data as {
        type?: string;
        content?: unknown;
      };
      if (
        message.type === websiteCmsMessages.update &&
        message.content &&
        typeof message.content === "object" &&
        !Array.isArray(message.content)
      ) {
        setContent(message.content as WebsiteContent);
      }
    };
    const stopPreviewNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button, form")) event.preventDefault();
    };
    window.addEventListener("message", receiveUpdate);
    document.addEventListener("click", stopPreviewNavigation);
    window.parent.postMessage(
      { type: websiteCmsMessages.ready },
      window.location.origin,
    );
    return () => {
      delete document.documentElement.dataset.websitePreview;
      window.removeEventListener("message", receiveUpdate);
      document.removeEventListener("click", stopPreviewNavigation);
    };
  }, [previewMode]);

  return children;
}
