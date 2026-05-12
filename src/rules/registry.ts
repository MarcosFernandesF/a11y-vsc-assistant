import { duplicateIdsRule } from "./duplicateIdsRules";
import { focusHtmlRule } from "./focusHtmlRules";
import { focusVisualRemovalCssRule } from "./focusRules";
import { headersHierarchyRule } from "./headersRules";
import { imageAltRule } from "./imageRules";
import { justifyTextRule } from "./justifyRules";
import { pageLanguageRule } from "./languageRules";
import { nonInteractiveClickableRule } from "./nonInteractiveClickableRules";
import { zoomCapabilityRule } from "./zoomRules";

export const allRules = [
  imageAltRule,
  headersHierarchyRule,
  zoomCapabilityRule,
  nonInteractiveClickableRule,
  focusHtmlRule,
  pageLanguageRule,
  duplicateIdsRule,
  justifyTextRule,
  focusVisualRemovalCssRule,
];
