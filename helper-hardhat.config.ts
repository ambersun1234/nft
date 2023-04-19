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
    blockConfirmation: number;
    vrfCoordinatorAddress?: string;
    aggregatorAddress?: string;
}

export interface NetworkConfigInterface {
    [key: number]: NetworkConfigItemInterface;
}

export const NetworkConfig: NetworkConfigInterface = {
    31337: {
        subscriptionID: 0,
        mintFee: ethers.utils.parseEther("0.01"),
        gasLane:
            "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        gasLimit: 500000,
        blockConfirmation: 1
    },
    5: {
        subscriptionID: 9548,
        mintFee: ethers.utils.parseEther("0.001"),
        gasLane:
            "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        gasLimit: 500000,
        blockConfirmation: 10,
        vrfCoordinatorAddress: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        aggregatorAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    },
    11155111: {
        subscriptionID: 1010,
        mintFee: ethers.utils.parseEther("0.001"),
        gasLane:
            "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        gasLimit: 2500000,
        blockConfirmation: 10,
        vrfCoordinatorAddress: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        aggregatorAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
};

export const ChainMapping: ChainMappingInterface = {
    5: "goerli",
    11155111: "sepolia",
    31337: "hardhat"
};

export const DevelopmentChains = ["hardhat"];
