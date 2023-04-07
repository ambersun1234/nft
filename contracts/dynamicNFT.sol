// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract DynamicNFT is ERC721 {
    string public constant base64SVGPrefix = "data:image/svg+xml;base64,";

    uint256 public tokenID;
    uint256 public immutable svgArrLength;
    string[] public svgArr;

    AggregatorV3Interface internal immutable priceFeed;

    constructor(
        address priceFeedAddress,
        string[] memory _svgs
    ) ERC721("dynamicNFT", "dNFT") {
        priceFeed = AggregatorV3Interface(priceFeedAddress);
        tokenID = 0;
        svgArrLength = _svgs.length;

        for (uint256 i = 0; i < _svgs.length; i++) {
            svgArr.push(svg2ImageURI(_svgs[i]));
        }
    }

    function svg2ImageURI(
        string memory svg
    ) public pure returns (string memory) {
        string memory encodedSvg = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return string(abi.encodePacked(base64SVGPrefix, encodedSvg));
    }

    function mint() public {
        // we don't need to set token uri, the token uri will dynamically changed when price goes up and down
        // because we override the tokenURI function
        _safeMint(msg.sender, tokenID);
        tokenID += 1;
    }

    function getImageURI() public view returns (string memory) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        uint256 price = uint256(answer);
        return svgArr[price % svgArrLength];
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 tokenID
    ) public view override returns (string memory) {
        require(_exists(tokenID), "TokenID not exists");

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '"',
                                '"description": "A NFT that will change based on input", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], ',
                                '"image":"',
                                getImageURI(),
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
