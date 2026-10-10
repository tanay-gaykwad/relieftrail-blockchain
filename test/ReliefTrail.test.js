const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReliefTrail", function () {
  let contract;
  let organizer;
  let donor;
  let recipient;
  const evidenceHash = `0x${"11".repeat(32)}`;

  beforeEach(async function () {
    [organizer, donor, recipient] = await ethers.getSigners();
    const ReliefTrail = await ethers.getContractFactory("ReliefTrail", organizer);
    contract = await ReliefTrail.deploy();
    await contract.waitForDeployment();
  });

  it("assigns payout authority to the deploying account", async function () {
    expect(await contract.reliefOrganizer()).to.equal(organizer.address);
    expect(await contract.totalDonated()).to.equal(0n);
    expect(await contract.availableBalance()).to.equal(0n);
  });

  it("records a donation and emits the updated balance", async function () {
    const donation = ethers.parseEther("1.5");
    await expect(contract.connect(donor).donate({ value: donation }))
      .to.emit(contract, "DonationReceived")
      .withArgs(donor.address, donation, donation);

    expect(await contract.totalDonated()).to.equal(donation);
    expect(await contract.donationCount()).to.equal(1n);
    expect(await contract.availableBalance()).to.equal(donation);
  });

  it("rejects a zero-value donation", async function () {
    await expect(contract.connect(donor).donate()).to.be.revertedWithCustomError(contract, "ZeroDonation");
    expect(await contract.donationCount()).to.equal(0n);
  });

  it("allows the organizer to pay a recipient and updates the remaining balance", async function () {
    const donation = ethers.parseEther("1.5");
    const payout = ethers.parseEther("0.4");
    await contract.connect(donor).donate({ value: donation });

    await expect(contract.connect(organizer).payRelief(recipient.address, payout, "emergency food kits", evidenceHash))
      .to.emit(contract, "ReliefPaid")
      .withArgs(recipient.address, payout, "emergency food kits", evidenceHash);

    expect(await contract.totalDonated()).to.equal(donation);
    expect(await contract.totalPaidOut()).to.equal(payout);
    expect(await contract.payoutCount()).to.equal(1n);
    expect(await contract.availableBalance()).to.equal(donation - payout);
  });

  it("rejects payouts from anyone other than the organizer", async function () {
    await contract.connect(donor).donate({ value: ethers.parseEther("1") });
    await expect(contract.connect(donor).payRelief(recipient.address, 1n, "supplies", evidenceHash))
      .to.be.revertedWithCustomError(contract, "OrganizerOnly");
    expect(await contract.totalPaidOut()).to.equal(0n);
  });

  it("rejects a zero recipient", async function () {
    await contract.connect(donor).donate({ value: ethers.parseEther("1") });
    await expect(contract.payRelief(ethers.ZeroAddress, 1n, "supplies", evidenceHash))
      .to.be.revertedWithCustomError(contract, "ZeroAddress");
  });

  it("rejects zero and over-balance payout amounts", async function () {
    await contract.connect(donor).donate({ value: ethers.parseEther("1") });
    await expect(contract.payRelief(recipient.address, 0n, "supplies", evidenceHash))
      .to.be.revertedWithCustomError(contract, "InvalidPayoutAmount");
    await expect(contract.payRelief(recipient.address, ethers.parseEther("1.01"), "supplies", evidenceHash))
      .to.be.revertedWithCustomError(contract, "InvalidPayoutAmount");
  });

  it("rejects a missing evidence fingerprint", async function () {
    await contract.connect(donor).donate({ value: ethers.parseEther("1") });
    await expect(contract.payRelief(recipient.address, 1n, "supplies", ethers.ZeroHash))
      .to.be.revertedWithCustomError(contract, "MissingEvidenceHash");
  });

  it("rejects an empty or oversized public purpose", async function () {
    await contract.connect(donor).donate({ value: ethers.parseEther("1") });
    await expect(contract.payRelief(recipient.address, 1n, "", evidenceHash))
      .to.be.revertedWithCustomError(contract, "InvalidPurpose");
    await expect(contract.payRelief(recipient.address, 1n, "x".repeat(161), evidenceHash))
      .to.be.revertedWithCustomError(contract, "InvalidPurpose");
  });

  it("accepts a purpose at the documented byte limit", async function () {
    await contract.connect(donor).donate({ value: ethers.parseEther("1") });
    const purpose = "x".repeat(160);
    await expect(contract.payRelief(recipient.address, 1n, purpose, evidenceHash))
      .to.emit(contract, "ReliefPaid")
      .withArgs(recipient.address, 1n, purpose, evidenceHash);
  });

  it("rolls back accounting when the recipient rejects payment", async function () {
    const RevertingRecipient = await ethers.getContractFactory("RevertingRecipient");
    const rejecting = await RevertingRecipient.deploy();
    await rejecting.waitForDeployment();
    const donation = ethers.parseEther("0.2");
    await contract.connect(donor).donate({ value: donation });

    await expect(contract.payRelief(await rejecting.getAddress(), donation, "supplies", evidenceHash))
      .to.be.revertedWithCustomError(contract, "PayoutFailed");
    expect(await contract.totalPaidOut()).to.equal(0n);
    expect(await contract.payoutCount()).to.equal(0n);
    expect(await contract.availableBalance()).to.equal(donation);
  });
});
