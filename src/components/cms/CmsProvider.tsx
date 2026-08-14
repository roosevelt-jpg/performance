"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_CMS } from "@/lib/cms/defaults";
import type { CmsContent } from "@/lib/cms/types";

const CmsContext = createContext<CmsContent>(DEFAULT_CMS);

export function CmsProvider({
  initial,
  children,
}: {
  initial?: CmsContent;
  children: ReactNode;
}) {
  const [content, setContent] = useState<CmsContent>(initial ?? DEFAULT_CMS);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/public-cms")
      .then((r) => r.json())
      .then((data: CmsContent) => {
        if (!cancelled && data?.site) setContent(data);
      })
      .catch(() => {
        /* keep initial/defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => content, [content]);
  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms(): CmsContent {
  return useContext(CmsContext);
}
