const { ethers } = require("hardhat");

async function main() {
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 31337n) {
    throw new Error(`Refusing local demo deployment on chain id ${network.chainId}; expected 31337.`);
  }
  const [organizer] = await ethers.getSigners();
  const ReliefTrail = await ethers.getContractFactory("ReliefTrail", organizer);
  const contract = await ReliefTrail.deploy();
  const receipt = await contract.deploymentTransaction().wait();
  console.log(JSON.stringify({
    chainId: Number(network.chainId),
    contractAddress: await contract.getAddress(),
    organizer: organizer.address,
    startBlock: receipt.blockNumber,
    warning: "Local Hardhat demo only. Do not use this address or key for real funds."
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
