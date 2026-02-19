"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
exports.resetPrismaMock = resetPrismaMock;
const vitest_mock_extended_1 = require("vitest-mock-extended");
exports.prismaMock = (0, vitest_mock_extended_1.mockDeep)();
function resetPrismaMock() {
    (0, vitest_mock_extended_1.mockReset)(exports.prismaMock);
}
