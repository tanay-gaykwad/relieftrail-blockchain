const { ethers } = require("hardhat");

async function main() {
  if (!process.env.SEPOLIA_RPC_URL || !process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error("Set SEPOLIA_RPC_URL and DEPLOYER_PRIVATE_KEY in a local .env file first.");
  }

  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 11155111n) {
    throw new Error(`Refusing deployment on unexpected chain id ${network.chainId}; expected Sepolia (11155111).`);
  }

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying ReliefTrail from ${deployer.address} to Sepolia...`);
  const ReliefTrail = await ethers.getContractFactory("ReliefTrail", deployer);
  const contract = await ReliefTrail.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`ReliefTrail deployed at ${address}`);
  console.log(`Organizer: ${await contract.reliefOrganizer()}`);
  console.log(`Verify after explorer indexing: npx hardhat verify --network sepolia ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
