import { network, deployments, ethers, getNamedAccounts } from "hardhat";
import { assert, expect } from "chai";

import { isDevelopChain } from "../utils/utils";
import { DynamicNFT, MockV3Aggregator } from "../typechain-types";
import { svgDefinitionArr } from "../deploy/deployDynamicNFT";

!isDevelopChain(network.config.chainId!)
    ? describe.skip
    : describe("DynamicNFT", () => {
          const svgEncodedPrefix = "data:image/svg+xml;base64,";
          const frownEncodedURI =
              "PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8c3ZnIHdpZHRoPSIxMDI0cHgiIGhlaWdodD0iMTAyNHB4IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik01MTIgNjRDMjY0LjYgNjQgNjQgMjY0LjYgNjQgNTEyczIwMC42IDQ0OCA0NDggNDQ4IDQ0OC0yMDAuNiA0NDgtNDQ4Uzc1OS40IDY0IDUxMiA2NHptMCA4MjBjLTIwNS40IDAtMzcyLTE2Ni42LTM3Mi0zNzJzMTY2LjYtMzcyIDM3Mi0zNzIgMzcyIDE2Ni42IDM3MiAzNzItMTY2LjYgMzcyLTM3MiAzNzJ6Ii8+CiAgPHBhdGggZmlsbD0iI0U2RTZFNiIgZD0iTTUxMiAxNDBjLTIwNS40IDAtMzcyIDE2Ni42LTM3MiAzNzJzMTY2LjYgMzcyIDM3MiAzNzIgMzcyLTE2Ni42IDM3Mi0zNzItMTY2LjYtMzcyLTM3Mi0zNzJ6TTI4OCA0MjFhNDguMDEgNDguMDEgMCAwIDEgOTYgMCA0OC4wMSA0OC4wMSAwIDAgMS05NiAwem0zNzYgMjcyaC00OC4xYy00LjIgMC03LjgtMy4yLTguMS03LjRDNjA0IDYzNi4xIDU2Mi41IDU5NyA1MTIgNTk3cy05Mi4xIDM5LjEtOTUuOCA4OC42Yy0uMyA0LjItMy45IDcuNC04LjEgNy40SDM2MGE4IDggMCAwIDEtOC04LjRjNC40LTg0LjMgNzQuNS0xNTEuNiAxNjAtMTUxLjZzMTU1LjYgNjcuMyAxNjAgMTUxLjZhOCA4IDAgMCAxLTggOC40em0yNC0yMjRhNDguMDEgNDguMDEgMCAwIDEgMC05NiA0OC4wMSA0OC4wMSAwIDAgMSAwIDk2eiIvPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0yODggNDIxYTQ4IDQ4IDAgMSAwIDk2IDAgNDggNDggMCAxIDAtOTYgMHptMjI0IDExMmMtODUuNSAwLTE1NS42IDY3LjMtMTYwIDE1MS42YTggOCAwIDAgMCA4IDguNGg0OC4xYzQuMiAwIDcuOC0zLjIgOC4xLTcuNCAzLjctNDkuNSA0NS4zLTg4LjYgOTUuOC04OC42czkyIDM5LjEgOTUuOCA4OC42Yy4zIDQuMiAzLjkgNy40IDguMSA3LjRINjY0YTggOCAwIDAgMCA4LTguNEM2NjcuNiA2MDAuMyA1OTcuNSA1MzMgNTEyIDUzM3ptMTI4LTExMmE0OCA0OCAwIDEgMCA5NiAwIDQ4IDQ4IDAgMSAwLTk2IDB6Ii8+Cjwvc3ZnPgo=";
          const happyEncodedURI =
              "PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjQwMCIgIGhlaWdodD0iNDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgZmlsbD0ieWVsbG93IiByPSI3OCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGcgY2xhc3M9ImV5ZXMiPgogICAgPGNpcmNsZSBjeD0iNjEiIGN5PSI4MiIgcj0iMTIiLz4KICAgIDxjaXJjbGUgY3g9IjEyNyIgY3k9IjgyIiByPSIxMiIvPgogIDwvZz4KICA8cGF0aCBkPSJtMTM2LjgxIDExNi41M2MuNjkgMjYuMTctNjQuMTEgNDItODEuNTItLjczIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IGJsYWNrOyBzdHJva2Utd2lkdGg6IDM7Ii8+Cjwvc3ZnPg==";

          const tokenMetadataEncodedPrefix = "data:application/json;base64,";
          const frownTokenEncodedMetadata =
              "eyJuYW1lIjoiZHluYW1pY05GVCIiZGVzY3JpcHRpb24iOiJBIE5GVCB0aGF0IHdpbGwgY2hhbmdlIGJhc2VkIG9uIGlucHV0IiwiYXR0cmlidXRlcyI6W3sidHJhaXRfdHlwZSI6ImNvb2xuZXNzIiwidmFsdWUiOjEwMH1dLCJpbWFnZSI6ImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEQ5NGJXd2dkbVZ5YzJsdmJqMGlNUzR3SWlCemRHRnVaR0ZzYjI1bFBTSnVieUkvUGdvOGMzWm5JSGRwWkhSb1BTSXhNREkwY0hnaUlHaGxhV2RvZEQwaU1UQXlOSEI0SWlCMmFXVjNRbTk0UFNJd0lEQWdNVEF5TkNBeE1ESTBJaUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lQZ29nSUR4d1lYUm9JR1pwYkd3OUlpTXpNek1pSUdROUlrMDFNVElnTmpSRE1qWTBMallnTmpRZ05qUWdNalkwTGpZZ05qUWdOVEV5Y3pJd01DNDJJRFEwT0NBME5EZ2dORFE0SURRME9DMHlNREF1TmlBME5EZ3RORFE0VXpjMU9TNDBJRFkwSURVeE1pQTJOSHB0TUNBNE1qQmpMVEl3TlM0MElEQXRNemN5TFRFMk5pNDJMVE0zTWkwek56SnpNVFkyTGpZdE16Y3lJRE0zTWkwek56SWdNemN5SURFMk5pNDJJRE0zTWlBek56SXRNVFkyTGpZZ016Y3lMVE0zTWlBek56SjZJaTgrQ2lBZ1BIQmhkR2dnWm1sc2JEMGlJMFUyUlRaRk5pSWdaRDBpVFRVeE1pQXhOREJqTFRJd05TNDBJREF0TXpjeUlERTJOaTQyTFRNM01pQXpOekp6TVRZMkxqWWdNemN5SURNM01pQXpOeklnTXpjeUxURTJOaTQySURNM01pMHpOekl0TVRZMkxqWXRNemN5TFRNM01pMHpOeko2VFRJNE9DQTBNakZoTkRndU1ERWdORGd1TURFZ01DQXdJREVnT1RZZ01DQTBPQzR3TVNBME9DNHdNU0F3SURBZ01TMDVOaUF3ZW0wek56WWdNamN5YUMwME9DNHhZeTAwTGpJZ01DMDNMamd0TXk0eUxUZ3VNUzAzTGpSRE5qQTBJRFl6Tmk0eElEVTJNaTQxSURVNU55QTFNVElnTlRrM2N5MDVNaTR4SURNNUxqRXRPVFV1T0NBNE9DNDJZeTB1TXlBMExqSXRNeTQ1SURjdU5DMDRMakVnTnk0MFNETTJNR0U0SURnZ01DQXdJREV0T0MwNExqUmpOQzQwTFRnMExqTWdOelF1TlMweE5URXVOaUF4TmpBdE1UVXhMalp6TVRVMUxqWWdOamN1TXlBeE5qQWdNVFV4TGpaaE9DQTRJREFnTUNBeExUZ2dPQzQwZW0weU5DMHlNalJoTkRndU1ERWdORGd1TURFZ01DQXdJREVnTUMwNU5pQTBPQzR3TVNBME9DNHdNU0F3SURBZ01TQXdJRGsyZWlJdlBnb2dJRHh3WVhSb0lHWnBiR3c5SWlNek16TWlJR1E5SWsweU9EZ2dOREl4WVRRNElEUTRJREFnTVNBd0lEazJJREFnTkRnZ05EZ2dNQ0F4SURBdE9UWWdNSHB0TWpJMElERXhNbU10T0RVdU5TQXdMVEUxTlM0MklEWTNMak10TVRZd0lERTFNUzQyWVRnZ09DQXdJREFnTUNBNElEZ3VOR2cwT0M0eFl6UXVNaUF3SURjdU9DMHpMaklnT0M0eExUY3VOQ0F6TGpjdE5Ea3VOU0EwTlM0ekxUZzRMallnT1RVdU9DMDRPQzQyY3preUlETTVMakVnT1RVdU9DQTRPQzQyWXk0eklEUXVNaUF6TGprZ055NDBJRGd1TVNBM0xqUklOalkwWVRnZ09DQXdJREFnTUNBNExUZ3VORU0yTmpjdU5pQTJNREF1TXlBMU9UY3VOU0ExTXpNZ05URXlJRFV6TTNwdE1USTRMVEV4TW1FME9DQTBPQ0F3SURFZ01DQTVOaUF3SURRNElEUTRJREFnTVNBd0xUazJJREI2SWk4K0Nqd3ZjM1puUGdvPSJ9";
          const happyEncodedMetadata =
              "eyJuYW1lIjoiZHluYW1pY05GVCIiZGVzY3JpcHRpb24iOiJBIE5GVCB0aGF0IHdpbGwgY2hhbmdlIGJhc2VkIG9uIGlucHV0IiwiYXR0cmlidXRlcyI6W3sidHJhaXRfdHlwZSI6ImNvb2xuZXNzIiwidmFsdWUiOjEwMH1dLCJpbWFnZSI6ImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjJhV1YzUW05NFBTSXdJREFnTWpBd0lESXdNQ0lnZDJsa2RHZzlJalF3TUNJZ0lHaGxhV2RvZEQwaU5EQXdJaUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lQZ29nSUR4amFYSmpiR1VnWTNnOUlqRXdNQ0lnWTNrOUlqRXdNQ0lnWm1sc2JEMGllV1ZzYkc5M0lpQnlQU0kzT0NJZ2MzUnliMnRsUFNKaWJHRmpheUlnYzNSeWIydGxMWGRwWkhSb1BTSXpJaTgrQ2lBZ1BHY2dZMnhoYzNNOUltVjVaWE1pUGdvZ0lDQWdQR05wY21Oc1pTQmplRDBpTmpFaUlHTjVQU0k0TWlJZ2NqMGlNVElpTHo0S0lDQWdJRHhqYVhKamJHVWdZM2c5SWpFeU55SWdZM2s5SWpneUlpQnlQU0l4TWlJdlBnb2dJRHd2Wno0S0lDQThjR0YwYUNCa1BTSnRNVE0yTGpneElERXhOaTQxTTJNdU5qa2dNall1TVRjdE5qUXVNVEVnTkRJdE9ERXVOVEl0TGpjeklpQnpkSGxzWlQwaVptbHNiRHB1YjI1bE95QnpkSEp2YTJVNklHSnNZV05yT3lCemRISnZhMlV0ZDJsa2RHZzZJRE03SWk4K0Nqd3ZjM1puUGc9PSJ9";

          let nft: DynamicNFT;
          let mockAggregator: MockV3Aggregator;
          let deployer: string;

          beforeEach(async () => {
              await deployments.fixture(["mock", "dynamic"]);

              deployer = (await getNamedAccounts())[0];
              nft = await ethers.getContract("DynamicNFT", deployer);
              mockAggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("constructor", () => {
              it("Should set tokenID to 0", async () => {
                  assert.equal((await nft.tokenID()).toString(), "0");
              });

              it("Should have same size of svg arr", async () => {
                  assert.equal(
                      (await nft.svgArrLength()).toString(),
                      svgDefinitionArr.length.toString()
                  );
              });

              it("Should have correct base64 encoded svg uri", async () => {
                  const encodedSVGURIArr0 = await nft.svgArr(0);
                  const encodedSVGURIArr1 = await nft.svgArr(1);
                  assert.equal(
                      encodedSVGURIArr0,
                      `${svgEncodedPrefix}${frownEncodedURI}`
                  );
                  assert.equal(
                      encodedSVGURIArr1,
                      `${svgEncodedPrefix}${happyEncodedURI}`
                  );
              });
          });

          describe("mint", () => {
              it("Should mint successfully without any fee", async () => {
                  const response = await nft.mint();
                  const reciept = await response.wait(1);

                  assert.equal(reciept.status!.toString(), "1");
              });

              it("Other people should be able to mint", async () => {
                  const people = (await ethers.getSigners())[1];
                  const peopleContract = await nft.connect(people);
                  const response = await peopleContract.mint();
                  const reciept = await response.wait(1);

                  assert.equal(reciept.status!.toString(), "1");
              });

              it("Should increase tokenID after mint", async () => {
                  const oldTokenID = await nft.tokenID();
                  await nft.mint();
                  assert.equal(
                      (await nft.tokenID()).toString(),
                      oldTokenID.add(1).toString()
                  );
              });

              it("Should emit transfer event when mint", async () => {
                  await expect(nft.mint()).to.be.emit(nft, "Transfer");
              });
          });

          describe("getImageURI", () => {
              it("Should return the first svg uri in array", async () => {
                  await mockAggregator.updateAnswer(20);

                  assert.equal(
                      await nft.getImageURI(),
                      `${svgEncodedPrefix}${frownEncodedURI}`
                  );
              });

              it("Should return the second svg uri in array", async () => {
                  await mockAggregator.updateAnswer(3);

                  assert.equal(
                      await nft.getImageURI(),
                      `${svgEncodedPrefix}${happyEncodedURI}`
                  );
              });
          });

          describe("tokenURI", () => {
              it("Should revert when no one mint", async () => {
                  await expect(nft.tokenURI(0)).to.be.revertedWith(
                      "TokenID not exists"
                  );
              });

              it("Should return base64 json", async () => {
                  await mockAggregator.updateAnswer(2);
                  await nft.mint();

                  const tokenMetadata = await nft.tokenURI(0);
                  const expectedTokenMetadata = `${tokenMetadataEncodedPrefix}${frownTokenEncodedMetadata}`;
                  assert.equal(tokenMetadata, expectedTokenMetadata);
              });

              it("Should return dynamic nft", async () => {
                  await mockAggregator.updateAnswer(2);
                  await nft.mint();

                  let tokenMetadata = await nft.tokenURI(0);
                  assert.equal(
                      tokenMetadata,
                      `${tokenMetadataEncodedPrefix}${frownTokenEncodedMetadata}`
                  );

                  await mockAggregator.updateAnswer(3);
                  tokenMetadata = await nft.tokenURI(0);
                  assert.equal(
                      tokenMetadata,
                      `${tokenMetadataEncodedPrefix}${happyEncodedMetadata}`
                  );
              });
          });
      });
