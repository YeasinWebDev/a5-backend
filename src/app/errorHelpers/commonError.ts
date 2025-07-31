import { IWallet } from "../modules/wallet/wallet.interface";

/**
 * commonError
 * 
 * @description Common error function to check if wallet exists and if it is blocked
 */
export const commonError = (wallet: IWallet | null, label: string) => {
  if (!wallet) {
    throw new Error(`${label} wallet not found`);
  }
  if (wallet.isBlocked) {
    throw new Error(`${label} wallet is blocked`);
  }
};
