import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { ethers } from "hardhat";

import {
    DevelopmentChains,
    ChainMapping,
    NetworkConfig
} from "./../helper-hardhat.config";
import { EtherscanAPIKey } from "./../utils/env";
import { verify } from "../utils/verify";

export const nftTokenURIArr: string[] = [
    "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
    "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
    "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm"
];

const deployIpfsNFT: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainID = network.config.chainId!;
    const networkCfg = NetworkConfig[chainID];

    let vrfCoordinatorAddress: string = "";
    let subscriptionID: number = 0;

    if (DevelopmentChains.includes(ChainMapping[chainID])) {
        const vrfCoordinator = await ethers.getContract("VRFCoordinatorV2Mock");
        const response = await vrfCoordinator.createSubscription();
        const receipt = await response.wait(1);

        vrfCoordinatorAddress = vrfCoordinator.address;
        subscriptionID = receipt.events[0].args.subId;

        await vrfCoordinator.fundSubscription(
            subscriptionID,
            "1000000000000000000000"
        );
    } else {
        vrfCoordinatorAddress = networkCfg.vrfCoordinatorAddress!;
        subscriptionID = networkCfg.subscriptionID;
    }

    const args: any[] = [
        vrfCoordinatorAddress,
        networkCfg.gasLane,
        subscriptionID,
        networkCfg.gasLimit,
        networkCfg.mintFee,
        nftTokenURIArr.length,
        nftTokenURIArr
    ];
    console.log(`deploying to ${ChainMapping[chainID]}(${chainID})...`);
    console.log(`deploying with argument ${args}`);

    const nft = await deploy("IpfsNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkCfg.blockConfirmation
    });

    if (
        !DevelopmentChains.includes(ChainMapping[chainID]) &&
        EtherscanAPIKey !== ""
    ) {
        await verify(nft.address, args);
    }
};

deployIpfsNFT.tags = ["all", "ipfs"];

export default deployIpfsNFT;
