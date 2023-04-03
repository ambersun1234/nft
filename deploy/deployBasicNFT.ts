import { verify } from "../utils/verify";
import {
    ChainMapping,
    DevelopmentChains,
    NetworkConfig
} from "../helper-hardhat.config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";

const deployBasicNFT: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainID = network.config.chainId!;
    const networkCfg = NetworkConfig[chainID];

    const nft = await deploy("BasicNFT", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: networkCfg.blockConfirmation
    });

    if (!DevelopmentChains.includes(ChainMapping[chainID])) {
        console.log("Test network found, verify on etherscan");
        await verify(nft.address, []);
    }
};

deployBasicNFT.tags = ["basicNFT", "all"];

export default deployBasicNFT;
