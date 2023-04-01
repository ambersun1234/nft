import { BigNumber, ContractTransaction } from "ethers";
import { VRFCoordinatorV2Mock } from "./../typechain-types/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock";
import { assert, expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployments, ethers, network } from "hardhat";

import {
    ChainMapping,
    DevelopmentChains,
    NetworkConfig
} from "./../helper-hardhat.config";
import { IpfsNFT } from "../typechain-types";

!DevelopmentChains.includes(ChainMapping[network.config.chainId!])
    ? describe.skip
    : describe("ipfsNFT", () => {
          const networkCfg = NetworkConfig[network.config.chainId!];

          let nft: IpfsNFT;
          let vrfCoordinator: VRFCoordinatorV2Mock;
          let deployer: SignerWithAddress;
          let deployer2: SignerWithAddress;

          beforeEach(async () => {
              const signers = await ethers.getSigners();
              await deployments.fixture(["mock", "ipfs"]);

              deployer = signers[0];
              deployer2 = signers[1];
              nft = await ethers.getContract("IpfsNFT", deployer);
              vrfCoordinator = await ethers.getContract(
                  "VRFCoordinatorV2Mock",
                  deployer2
              );
          });

          describe("constructor", () => {
              it("Should have the same mint fee", async () => {
                  assert.equal(
                      (await nft.mintFee()).toString(),
                      networkCfg.mintFee.toString()
                  );
              });

              it("Should have same nft amount", async () => {
                  assert.equal((await nft.nftAmount()).toString(), "1");
              });
          });

          describe("withdraw", () => {
              it("Should block other withdraw", async () => {
                  // start from 2 to bypass deployer
                  const signers = await ethers.getSigners();
                  const people = signers[2];
                  const peopleContract = nft.connect(people);
                  await expect(peopleContract.withdraw()).to.be.reverted;
              });

              it("Should withdraw 0 amount when no one mint", async () => {
                  const response = await nft.withdraw();
                  await response.wait(1);

                  assert.equal(response.value.toString(), "0");
              });

              describe("withdraw with people mint", () => {
                  const mint = async (num: number) => {
                      const signers = await ethers.getSigners();

                      // start from 2 to bypass deployer
                      for (let i = 2; i < num + 2; i++) {
                          const people = signers[i];
                          const peopleContract = nft.connect(people);
                          const response = await peopleContract.requestMint({
                              value: networkCfg.mintFee
                          });
                          const receipt = await response.wait(1);
                          const requestID = receipt.events![1].args!.requestID;

                          await vrfCoordinator.fulfillRandomWords(
                              requestID,
                              nft.address
                          );
                          // to simulate random number thus pass contract address
                      }
                  };

                  const gas = async (response: ContractTransaction) => {
                      const receipt = await response.wait(1);
                      const { gasUsed, effectiveGasPrice } = receipt;
                      return gasUsed.mul(effectiveGasPrice);
                  };

                  it("Should withdraw success if 1 people mint", async () => {
                      const num = 1;
                      const totalMintFee = networkCfg.mintFee.mul(num);
                      const oldDeployerBalance =
                          await ethers.provider.getBalance(deployer.address);

                      await mint(num);

                      assert.equal(
                          (
                              await ethers.provider.getBalance(nft.address)
                          ).toString(),
                          totalMintFee.toString()
                      );

                      const gasPrice = await gas(await nft.withdraw());

                      assert.equal(
                          (
                              await ethers.provider.getBalance(nft.address)
                          ).toString(),
                          "0"
                      );
                      assert.equal(
                          (await ethers.provider.getBalance(deployer.address))
                              .add(gasPrice)
                              .toString(),
                          oldDeployerBalance.add(totalMintFee).toString()
                      );
                  });

                  it("Should withdraw success if n people mint", async () => {
                      const num = 10;
                      const totalMintFee = networkCfg.mintFee.mul(num);
                      const oldDeployerBalance =
                          await ethers.provider.getBalance(deployer.address);

                      await mint(num);

                      assert.equal(
                          (
                              await ethers.provider.getBalance(nft.address)
                          ).toString(),
                          totalMintFee.toString()
                      );

                      const gasPrice = await gas(await nft.withdraw());

                      assert.equal(
                          (
                              await ethers.provider.getBalance(nft.address)
                          ).toString(),
                          "0"
                      );
                      assert.equal(
                          (await ethers.provider.getBalance(deployer.address))
                              .add(gasPrice)
                              .toString(),
                          oldDeployerBalance.add(totalMintFee).toString()
                      );
                  });
              });
          });

          describe("request mint", () => {
              it("Should revert if mint fee is not enough", async () => {
                  const people = (await ethers.getSigners())[1];
                  const peopleContract = nft.connect(people);

                  await expect(
                      peopleContract.requestMint({
                          value: ethers.utils.parseEther("0.0001")
                      })
                  ).to.be.reverted;
              });

              it("Should emit mint requested event", async () => {
                  await expect(
                      nft.requestMint({ value: networkCfg.mintFee })
                  ).to.be.emit(nft, "MintRequested");
              });
          });
      });
