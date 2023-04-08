import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";

import { isDevelopChain, readSVGs } from "../utils/utils";
import { ChainMapping, NetworkConfig } from "../helper-hardhat.config";
import { verify } from "../utils/verify";

export const svgDefinitionArr = readSVGs("./images/dynamic")

const deployDynamicNFT: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { deployments, network, getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;
    const chainID = network.config.chainId!;
    const networkCfg = NetworkConfig[chainID];

    let aggregatorAddress: string = "";

    if (isDevelopChain(chainID)) {
        const mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
        aggregatorAddress = mockV3Aggregator.address;
    } else {
        aggregatorAddress = networkCfg.aggregatorAddress!;
    }

    const args: any[] = [aggregatorAddress, svgDefinitionArr];

    if (!isDevelopChain(chainID)) {
        console.log(`deploying to ${ChainMapping[chainID]}(${chainID})...`);
        console.log(`deploying with argument ${args}`);
    }

    const nft = await deploy("DynamicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkCfg.blockConfirmation
    });

    if (!isDevelopChain(chainID)) {
        await verify(nft.address, args);
    }
};

deployDynamicNFT.tags = ["all", "dynamic"];

export default deployDynamicNFT;
