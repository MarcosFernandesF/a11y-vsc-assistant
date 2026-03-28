export type TestCategory = "Conforme" | "Violacao" | "Inaplicavel";

export type TestCase<T = number> = {
  name: string;
  html: string;
  expected: T;
  category: TestCategory;
};
