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

        vrfCoordinator.fundSubscription(
            subscriptionID,
            "1000000000000000000000"
        );
    }

    const args: any[] = [
        vrfCoordinatorAddress,
        networkCfg.gasLane,
        subscriptionID,
        networkCfg.gasLimit,
        networkCfg.mintFee,
        2,
        ["abc", "def"]
    ];

    const nft = await deploy("IpfsNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1
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
