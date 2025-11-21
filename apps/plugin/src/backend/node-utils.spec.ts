import { setupFigmaMock, clearFigmaMock } from "../__tests__/figma-mock";

describe("node-utils", () => {
  beforeEach(() => {
    setupFigmaMock();
  });

  afterEach(() => {
    clearFigmaMock();
  });

  describe("jest_test", () => {
    it("should pass", () => {
      expect(true).toBe(true);
    });
  });
});
