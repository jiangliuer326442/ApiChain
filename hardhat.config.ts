import { HardhatUserConfig } from "hardhat/config"
import "hardhat-deploy"
import "@nomicfoundation/hardhat-toolbox"

const config: HardhatUserConfig = {
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
