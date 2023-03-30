// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNFT is ERC721 {
    uint256 private tokenCounter;
    string public constant TOKEN_URI =
        "ipfs.io/ipfs/bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    constructor() ERC721("Doggy", "Dog") {
        tokenCounter = 0;
    }

    function getTokenCounter() public view returns (uint256) {
        return tokenCounter;
    }

    function tokenURI(
        uint256
    ) public view override returns (string memory) {
        return TOKEN_URI;
    }

    function mint() public returns (uint256) {
        _safeMint(msg.sender, tokenCounter);
        return tokenCounter++;
    }
}
