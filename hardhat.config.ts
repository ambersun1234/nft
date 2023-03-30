import { HardhatUserConfig } from "hardhat/config";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

import { EtherscanAPIKey, GoerliRPCUrl, PrivateKey } from "./utils/env";

const config: HardhatUserConfig = {
    solidity: "0.8.18",
    networks: {
        goerli: {
            url: GoerliRPCUrl,
            accounts: [PrivateKey],
            chainId: 5
        }
    },
    namedAccounts: {
        deployer: {
            default: 0
        }
    },
    etherscan: {
        apiKey: EtherscanAPIKey
    }
};

export default config;
