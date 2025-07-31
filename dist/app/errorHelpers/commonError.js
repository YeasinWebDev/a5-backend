"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonError = void 0;
/**
 * commonError
 *
 * @description Common error function to check if wallet exists and if it is blocked
 */
const commonError = (wallet, label) => {
    if (!wallet) {
        throw new Error(`${label} wallet not found`);
    }
    if (wallet.isBlocked) {
        throw new Error(`${label} wallet is blocked`);
    }
};
exports.commonError = commonError;
