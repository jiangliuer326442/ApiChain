import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"

const config: HardhatUserConfig = {
  paths: {
    root: "./src/solidity",
  },
  solidity: "0.8.28",
}

export default config
