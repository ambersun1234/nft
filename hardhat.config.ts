import { HardhatUserConfig } from "hardhat/config";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "hardhat-contract-sizer";

import {
    EtherscanAPIKey,
    GoerliRPCUrl,
    PrivateKey,
    SepoliaRPCUrl
} from "./utils/env";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: "0.8.18" }]
    },
    networks: {
        goerli: {
            url: GoerliRPCUrl || "",
            accounts: [PrivateKey],
            chainId: 5,
            gasPrice: 200 * 1000000000
        },
        sepolia: {
            url: SepoliaRPCUrl || "",
            accounts: [PrivateKey],
            chainId: 11155111,
            gasPrice: 30 * 1000000000
        }
    },
    namedAccounts: {
        deployer: {
            default: 0
        }
    },
    etherscan: {
        apiKey: EtherscanAPIKey
    },
    mocha: {
        bail: true,
        timeout: 300000
    }
};

export default config;
