const { ethers } = require("hardhat");

const ZERO_HASH = `0x${"11".repeat(32)}`;

async function main() {
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 31337n) {
    throw new Error(`Refusing to emit demo events on chain id ${network.chainId}; expected local Hardhat chain 31337.`);
  }

  const contractAddress = process.env.RELIEFTRAIL_CONTRACT_ADDRESS;
  if (!contractAddress || !ethers.isAddress(contractAddress)) {
    throw new Error("Set RELIEFTRAIL_CONTRACT_ADDRESS to the contract deployed on the local Hardhat node.");
  }

  const responseCode = process.env.RELIEFTRAIL_RESPONSE_CODE || "FLOOD-26-01";
  const [organizer, donorOne, donorTwo, recipient] = await ethers.getSigners();
  const contract = await ethers.getContractAt("ReliefTrail", contractAddress, organizer);

  const donationOne = await contract.connect(donorOne).donate(responseCode, {
    value: ethers.parseEther("1"),
  });
  await donationOne.wait();

  const donationTwo = await contract.connect(donorTwo).donate(responseCode, {
    value: ethers.parseEther("0.5"),
  });
  await donationTwo.wait();

  const payout = await contract.payRelief(
    recipient.address,
    responseCode,
    ethers.parseEther("0.4"),
    "sample emergency food kits",
    ZERO_HASH,
  );
  await payout.wait();

  console.log(JSON.stringify({
    chainId: Number(network.chainId),
    contractAddress,
    responseCode,
    demoEvents: 3,
    donationWei: "1500000000000000000",
    payoutWei: "400000000000000000",
    warning: "Local simulation only; these events do not represent real donations or aid delivery.",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
