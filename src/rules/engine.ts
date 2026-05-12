import { A11yRule, RuleContext, RuleError } from "./types";

export class RuleEngine {
  constructor(private readonly rules: A11yRule[]) {}

  run(text: string, context: RuleContext): RuleError[] {
    const errors: RuleError[] = [];

    for (const rule of this.rules) {
      if (!rule.languages.includes(context.languageId)) {
        continue;
      }

      const results = rule.evaluate(text, context);
      if (!results || results.length === 0) {
        continue;
      }

      for (const error of results) {
        errors.push({
          ...error,
          ruleId: error.ruleId ?? rule.id,
        });
      }
    }

    return errors;
  }
}
