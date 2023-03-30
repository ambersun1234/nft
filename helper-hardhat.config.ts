export interface ChainMappingInterface {
    [key: number]: string;
}

export const ChainMapping: ChainMappingInterface = {
    5: "goerli",
    31337: "hardhat",
}

export const DevelopmentChains = ["hardhat"]