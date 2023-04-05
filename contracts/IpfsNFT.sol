// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error IpfsNFT__TransferFailed();

contract IpfsNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // chainlink
    VRFCoordinatorV2Interface private immutable vrfCoordinator;
    bytes32 private immutable gasLane;
    uint64 private immutable subscriptionID;
    uint32 private immutable gasLimits;
    uint16 private constant blockConfirmation = 3;
    uint32 private constant words = 1;

    uint256 public immutable mintFee;
    uint256 public tokenID;
    uint256 public nftAmount;
    mapping(uint256 => address) private requestID2Address;
    string[] private nftURIArr;

    event MintRequested(uint256 indexed requestID);
    event NFTSend(uint256 indexed tokenID);

    constructor(
        address _vrfCoordinator,
        bytes32 _gasLane,
        uint64 _subscriptionID,
        uint32 _gasLimits,
        uint256 _mintFee,
        uint256 _nftAmount,
        string[] memory _nftURIArr
    ) VRFConsumerBaseV2(_vrfCoordinator) ERC721("IpfsNFT", "iNFT") {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        gasLane = _gasLane;
        subscriptionID = _subscriptionID;
        gasLimits = _gasLimits;

        tokenID = 0;
        mintFee = _mintFee;
        nftAmount = _nftAmount;
        nftURIArr = _nftURIArr;
    }

    function withdraw() public payable onlyOwner {
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!success) {
            revert IpfsNFT__TransferFailed();
        }
    }

    function requestMint() public payable {
        require(msg.value >= mintFee, "Not enough ETH");

        uint256 requestID = vrfCoordinator.requestRandomWords(
            gasLane,
            subscriptionID,
            blockConfirmation,
            gasLimits,
            words
        );
        requestID2Address[requestID] = msg.sender;

        emit MintRequested(requestID);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        _setTokenURI(tokenID, nftURIArr[randomWords[0] % nftAmount]);
        _safeMint(requestID2Address[requestId], tokenID);
        emit NFTSend(tokenID);
        tokenID += 1;
    }
}
