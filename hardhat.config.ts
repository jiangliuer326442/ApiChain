import "hardhat-deploy"
import "@nomicfoundation/hardhat-toolbox"
import "dotenv/config"

import contractConfig from './src/config/contract.json';
const { supportedChains } = contractConfig;

const config = {
  defaultNetwork: "ganache",
  networks: {
    ganache: {
      url: supportedChains["1337"].rpc,
      chainId: 1337,
      accounts: [process.env.GANACHE_ACCOUNT!],
    },
    // sepolia: {
    //   url: supportedChains["11155111"].rpc,
    //   chainId: 11155111,
    //   accounts: [process.env.EVM_ACCOUNT!],
    // },
    arbitrumTestnet: {
      url: supportedChains["421614"].rpc,
      chainId: 421614,
      accounts: [process.env.EVM_ACCOUNT!],
      linkToken: process.env.ARBITRUM_SEPOLIA_LINK_TOKEN!,
      functionsRouter: process.env.ARBITRUM_SEPOLIA_FUNCTION_ROUTER!,
      donIdName: process.env.ARBITRUM_SEPOLIA_DONID_NAME!,
      donIdAddress: process.env.ARBITRUM_SEPOLIA_DONID_ADDRESS!
    },
    arbitrum: {
      url: supportedChains["42161"].rpc,
      chainId: 42161,
      accounts: [process.env.EVM_ACCOUNT!],
      linkToken: process.env.ARBITRUM_LINK_TOKEN!,
      functionsRouter: process.env.ARBITRUM_FUNCTION_ROUTER!,
      donIdName: process.env.ARBITRUM_DONID_NAME!,
      donIdAddress: process.env.ARBITRUM_DONID_ADDRESS!
    }
  },
  paths: {
    root: "./src/solidity",
  },
  solidity: "0.8.30",
  namedAccounts: {
    deployer: {
        default: 0,
    },
  }
}

export default config
