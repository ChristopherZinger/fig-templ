import { testing } from "./magic-layout-builder";

describe("magic-layout-builders", () => {
  describe("getOuterMargins", () => {
    it(`should return no margins if bbox fill container `, () => {
      const info = {
        container: { width: 100, height: 100, origin: { x: 0, y: 0 } },
        bbox: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
      };
      const expectedResult = {
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
      };
      const result = testing.getOuterMargins(info);
      expect(result).toEqual(expectedResult);
    });

    it(`should return correct top and right margin.`, () => {
      const info = {
        container: { width: 110, height: 110, origin: { x: 0, y: 0 } },
        bbox: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
      };
      const expectedResult = {
        marginLeft: 0,
        marginRight: 10,
        marginTop: 0,
        marginBottom: 10,
      };
      const result = testing.getOuterMargins(info);
      expect(result).toEqual(expectedResult);
    });

    it(`should correctly handle origin offset`, () => {
      const info = {
        container: { width: 100, height: 100, origin: { x: 10, y: 10 } },
        bbox: { minX: 10, minY: 10, maxX: 110, maxY: 110 },
      };
      const expectedResult = {
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
      };
      const result = testing.getOuterMargins(info);
      expect(result).toEqual(expectedResult);
    });

    it(`should return non-0 margins if bbox does not fill container`, () => {
      const info = {
        container: { width: 100, height: 100, origin: { x: 0, y: 0 } },
        bbox: { minX: 10, minY: 20, maxX: 40, maxY: 60 },
      };
      const expectedResult = {
        marginLeft: 10,
        marginRight: 60,
        marginTop: 20,
        marginBottom: 40,
      };
      const result = testing.getOuterMargins(info);
      expect(result).toEqual(expectedResult);
    });

    it(`should return non-0 margins if bbox does not fill container and origin is not at 0,0`, () => {
      const info = {
        container: { width: 100, height: 100, origin: { x: 10, y: 20 } },
        bbox: { minX: 20, minY: 40, maxX: 50, maxY: 80 },
      };
      const expectedResult = {
        marginLeft: 10,
        marginRight: 60,
        marginTop: 20,
        marginBottom: 40,
      };
      const result = testing.getOuterMargins(info);
      expect(result).toEqual(expectedResult);
    });
  });
});
