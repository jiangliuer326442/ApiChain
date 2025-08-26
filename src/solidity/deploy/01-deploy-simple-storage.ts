import {DeployFunction} from "hardhat-deploy/types"
import {HardhatRuntimeEnvironment} from "hardhat/types"

const deploySimpleStorage: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
  ) {
    const { deployments, getNamedAccounts, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    await deploy("SimpleStorage", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1,
    })
}

export default deploySimpleStorage
deploySimpleStorage.tags = ["all", "simpleStorage"]