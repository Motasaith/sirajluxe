"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface SectionData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  enabled: boolean;
}

interface SiteContentContextType {
  content: Record<string, SectionData>;
  isLoading: boolean;
}

const SiteContentContext = createContext<SiteContentContextType>({
  content: {},
  isLoading: true,
});

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, SectionData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/site-content", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, SectionData> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const item of data.sections || []) {
          map[item.key] = {
            data: item.data || {},
            enabled: item.enabled !== false,
          };
        }
        setContent(map);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, isLoading }}>
      {children}
    </SiteContentContext.Provider>
  );
}

/**
 * Hook to read CMS content for a section.
 * Returns { data, enabled } — components should use:
 *   const value = data?.fieldName || "hardcoded default";
 * If no CMS entry exists for this key, enabled defaults to true
 * and data is null (so all defaults are used).
 */
export function useSiteContent(key: string) {
  const { content } = useContext(SiteContentContext);
  const section = content[key];
  return {
    data: section?.data || null,
    enabled: section?.enabled ?? true,
  };
}
