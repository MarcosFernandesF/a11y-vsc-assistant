import type { RuleContext, RuleLanguage } from "../../rules/types";

export type TestCategory = "Conforme" | "Violacao" | "Inaplicavel";

export type TestCase<T = number> = {
  name: string;
  html: string;
  expected: T;
  category: TestCategory;
};

export function buildRuleContext(languageId: RuleLanguage): RuleContext {
  return {
    languageId,
    uri: "test://fixture",
  };
}
