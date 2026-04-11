export type WcagReferenceKey =
  | "duplicateIds"
  | "focusVisualRemovalCss"
  | "focusVisualRemovalHtml"
  | "headersHierarchy"
  | "imageAlt"
  | "justifyText"
  | "pageLanguage"
  | "nonInteractiveClickable"
  | "zoomCapability";

type WcagReference = {
  criterion: string;
  title: string;
  url: string;
};

export type { WcagReference };

// Catalogo oficial de referencias WCAG 2.2 para cada regra da extensao.
export const WCAG_REFERENCES: Record<WcagReferenceKey, WcagReference> = {
  duplicateIds: {
    criterion: "4.1.1",
    title: "Parsing",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/parsing",
  },
  focusVisualRemovalCss: {
    criterion: "2.4.7",
    title: "Focus Visible",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible",
  },
  focusVisualRemovalHtml: {
    criterion: "2.4.7",
    title: "Focus Visible",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible",
  },
  headersHierarchy: {
    criterion: "1.3.1",
    title: "Info and Relationships",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships",
  },
  imageAlt: {
    criterion: "1.1.1",
    title: "Non-text Content",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content",
  },
  justifyText: {
    criterion: "1.4.8",
    title: "Visual Presentation",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation",
  },
  pageLanguage: {
    criterion: "3.1.1",
    title: "Language of Page",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/language-of-page",
  },
  nonInteractiveClickable: {
    criterion: "2.1.1",
    title: "Keyboard",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard",
  },
  zoomCapability: {
    criterion: "1.4.4",
    title: "Resize Text",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/resize-text",
  },
};

export function getWcagReference(referenceKey: WcagReferenceKey): WcagReference {
  return WCAG_REFERENCES[referenceKey];
}