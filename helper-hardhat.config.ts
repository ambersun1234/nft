import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export interface ChainMappingInterface {
    [key: number]: string;
}

export interface NetworkConfigItemInterface {
    subscriptionID: number;
    mintFee: BigNumber;
    gasLane: string;
    gasLimit: number;
    vrfCoordinatorAddress?: string;
}

export interface NetworkConfigInterface {
    [key: number]: NetworkConfigItemInterface;
}

export const NetworkConfig: NetworkConfigInterface = {
    31337: {
        subscriptionID: 0,
        mintFee: ethers.utils.parseEther("0.01"),
        gasLane:
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        gasLimit: 500000
    }
};

export const ChainMapping: ChainMappingInterface = {
    5: "goerli",
    31337: "hardhat"
};

export const DevelopmentChains = ["hardhat"];
