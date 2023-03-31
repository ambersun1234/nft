import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";

import { BasicNFT } from "./../typechain-types/contracts/BasicNFT";

describe("BasicNFT", () => {
    const tokenURI =
        "ipfs.io/ipfs/bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    let nft: BasicNFT;
    let deployer: SignerWithAddress;

    beforeEach(async () => {
        await deployments.fixture(["basicNFT"]);
        deployer = (await ethers.getSigners())[0];
        nft = await ethers.getContract("BasicNFT", deployer);
    });

    describe("constructor", () => {
        it("Should successfully initialize", async () => {
            assert.equal((await nft.getTokenCounter()).toString(), "0");
        });
    });

    describe("tokenURI", () => {
        it("Should return constant uri", async () => {
            assert.equal(await nft.tokenURI(1), tokenURI);
            assert.equal(await nft.tokenURI(2), tokenURI);
        });
    });

    describe("mint", () => {
        it("Should mint the first token", async () => {
            const txResponse = await nft.mint();
            const txReceipt = await txResponse.wait(1);
            assert.equal(
                parseInt(txReceipt.logs[0].topics[3]).toString(),
                "0"
            );
            assert.equal((await nft.getTokenCounter()).toString(), "1");
        });

        it("Should mint n token", async () => {
            for (let i = 0; i < 10; i++) {
                const response = await nft.mint();
                const receipt = await response.wait(1);
                assert.equal(
                    parseInt(receipt.logs[0].topics[3]).toString(),
                    i.toString()
                );
                assert.equal(
                    (await nft.getTokenCounter()).toString(),
                    (i + 1).toString()
                );
            }
            assert.equal((await nft.getTokenCounter()).toString(), "10");
        });

        it("Others should be able to mint", async () => {
            const people = (await ethers.getSigners())[1];

            const peopleContract = nft.connect(people);
            const receipt = await peopleContract.mint();
            await receipt.wait(1);
            assert.equal(receipt.value.toString(), "0");
        });

        it("Should emit transfer event", async () => {
            await expect(nft.mint()).to.emit(nft, "Transfer")
        })
    });
});
