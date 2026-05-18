import { duplicateIdsRule } from '../html/duplicateIdsRules';
import { focusHtmlRule } from '../html/focusHtmlRules';
import { focusVisualRemovalCssRule } from '../css/focusRules';
import { headersHierarchyRule } from '../html/headersRules';
import { imageAltRule } from '../html/imageRules';
import { justifyTextRule } from '../css/justifyRules';
import { pageLanguageRule } from '../html/languageRules';
import { nonInteractiveClickableRule } from '../html/nonInteractiveClickableRules';
import { zoomCapabilityRule } from '../html/zoomRules';

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
