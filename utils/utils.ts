import { DevelopmentChains, ChainMapping } from "../helper-hardhat.config";

export const isDevelopChain = (chainID: number) => {
    return DevelopmentChains.includes(ChainMapping[chainID]);
};
