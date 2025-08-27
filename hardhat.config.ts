import { HardhatUserConfig } from "hardhat/config"
import "hardhat-deploy"
import "@nomicfoundation/hardhat-toolbox"
import "dotenv/config"

const config: HardhatUserConfig = {
  defaultNetwork: "ganache",
  networks: {
    ganache: {
      url: "http://192.168.1.3:7545",
      chainId: 1337,
      accounts: [process.env.GANACHE_ACCOUNT!]
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/ZNgnhTTA2JO77B7gk6vQU",
      chainId: 11155111,
      accounts: [process.env.SEPOLIA_ACCOUNT!],
    }
  },
  paths: {
    root: "./src/solidity",
  },
  solidity: "0.8.28",
  namedAccounts: {
    deployer: {
        default: 0,
    },
  }
}

export default config
