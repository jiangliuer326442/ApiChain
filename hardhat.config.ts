import { HardhatUserConfig } from "hardhat/config"

const config: HardhatUserConfig = {
  paths: {
    root: "./src/solidity",
  },
  solidity: "0.8.28",
}

export default config
