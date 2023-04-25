import { ethers, getNamedAccounts, network } from "hardhat";
import { assert, expect } from "chai";

import {
    ChainMapping,
    DevelopmentChains,
    NetworkConfig
} from "../../helper-hardhat.config";
import { IpfsNFT } from "../../typechain-types";
import { nftTokenURIArr } from "../../deploy/deployIpfsNFT";

DevelopmentChains.includes(ChainMapping[network.config.chainId!])
    ? describe.skip
    : describe("ipfsNFT", () => {
          const networkCfg = NetworkConfig[network.config.chainId!];
          const mintRequestEvent = "MintRequested";
          const nftSendEvent = "NFTSend";

          let nft: IpfsNFT;
          let deployer: string;

          beforeEach(async () => {
              deployer = (await getNamedAccounts())["deployer"];
              nft = await ethers.getContract("IpfsNFT", deployer);
          });

          describe("request mint", () => {
              it("Should fail if not enough mint fee", async () => {
                  await expect(
                      nft.requestMint({ value: networkCfg.mintFee.div(10) })
                  ).to.be.reverted;
              });

              it("Should emit mint requested event when requested", async () => {
                  await new Promise<void>(async (resolve, reject) => {
                      try {
                          await expect(
                              nft.requestMint({ value: networkCfg.mintFee })
                          ).to.be.emit(nft, mintRequestEvent);
                      } catch (error) {
                          reject(error);
                      }
                      resolve();
                  });
              });

              it("Should emit nft send event after successful mint", async () => {
                  await new Promise<void>(async (resolve, reject) => {
                      try {
                          nft.once(nftSendEvent, () => resolve());
                      } catch (error) {
                          reject(error);
                      }

                      await nft.requestMint({
                          value: networkCfg.mintFee
                      });
                  });
              });

              it("Should increase tokenID after successful mint", async () => {
                  const previousTokenID = await nft.tokenID();

                  await new Promise<void>(async (resolve, reject) => {
                      nft.once(nftSendEvent, async () => {
                          try {
                              const newTokenID = await nft.tokenID();
                              assert.equal(
                                  newTokenID.toString(),
                                  previousTokenID.add(1).toString()
                              );
                              resolve();
                          } catch (error) {
                              reject(error);
                          }
                      });

                      await nft.requestMint({
                          value: networkCfg.mintFee
                      });
                  });
              });

              it("Should set token uri of given tokenID", async () => {
                  await new Promise<void>(async (resolve, reject) => {
                      nft.once(nftSendEvent, async () => {
                          try {
                              let tokenID = await nft.tokenID();
                              tokenID = tokenID
                                  .sub(1)
                                  .mod(nftTokenURIArr.length);

                              const tokenURI = await nft.tokenURI(tokenID);
                              expect(nftTokenURIArr).to.include.members([
                                  tokenURI
                              ]);
                              resolve();
                          } catch (error) {
                              reject(error);
                          }
                      });

                      await nft.requestMint({
                          value: networkCfg.mintFee
                      });
                  });
              });
          });
      });
