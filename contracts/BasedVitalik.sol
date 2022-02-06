// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";


contract BasedVitalik is ERC721, ERC721URIStorage, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenSupply;

    // Define starting contract state
    bytes32 public merkleRoot;
    bool public merkleSet = false;
    bool public earlyAccessMode = true;
    bool public mintingIsActive = false;
    bool public reservedVitaliks = false;
    string public baseURI = "";
    uint256 public salePrice = 0.10 ether;
    uint256 public constant maxSupply = 4962;
    uint256 public constant maxMints = 5;

    constructor() ERC721("Based Vitalik", "BV") {}

    // Get total supply based upon counter
    function totalSupply() public view returns (uint256) {
        return _tokenSupply.current();
    }

    // Withdraw contract balance to creator (mnemonic seed address 0)
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    // Flip the minting from active or pause
    function toggleMinting() external onlyOwner {
        if (mintingIsActive) {
            mintingIsActive = false;
        } else {
            mintingIsActive = true;
        }
    }

    // Flip the early access mode to allow/disallow public minting vs whitelist minting
    function toggleEarlyAccessMode() external onlyOwner {
        if (earlyAccessMode) {
            earlyAccessMode = false;
        } else {
            earlyAccessMode = true;
        }
    }

    // Specify a new IPFS URI for metadata
    function setBaseURI(string memory URI) public onlyOwner {
        baseURI = URI;
    }

    // Update sale price if needed
    function setSalePrice(uint256 _newPrice) external onlyOwner {
        salePrice = _newPrice;
    }

    // Specify a merkle root hash from the gathered k/v dictionary of
    // addresses and their claimable amount of tokens - thanks Kiwi!
    // https://github.com/0xKiwi/go-merkle-distributor
    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;
        merkleSet = true;
    }

    // Reserve some vitaliks for giveaways
    function reserveVitaliks() public onlyOwner {
        // Only allow one-time reservation of 40 tokens
        if (!reservedVitaliks) {
            _mintVitaliks(40);
            reservedVitaliks = true;
        }
    }

    // Internal mint function
    function _mintVitaliks(uint256 numberOfTokens) private {
        require(numberOfTokens > 0, "Must mint at least 1 token");

        // Mint i tokens where i is specified by function invoker
        for(uint256 i = 0; i < numberOfTokens; i++) {
            uint256 tokenId = totalSupply() + 1; // Start at 1
            _safeMint(msg.sender, tokenId);
            _tokenSupply.increment();
        }

        // Disable minting if max supply of tokens is reached
        if (totalSupply() == maxSupply) {
            mintingIsActive = false;
        }
    }

    // Purchase and mint
    function mintVitaliks(
      uint256 index,
      address account,
      uint256 whitelistedAmount,
      bytes32[] calldata merkleProof,
      uint256 numberOfTokens
    ) public payable {
        require(mintingIsActive, "Minting is not active.");
        require(msg.value == numberOfTokens.mul(salePrice), "Incorrect Ether supplied for the number of tokens requested.");
        require(totalSupply().add(numberOfTokens) <= maxSupply, "Minting would exceed max supply.");

        if (earlyAccessMode) {
            require(merkleSet, "Merkle root not set by contract owner.");
            require(msg.sender == account, "Can only be claimed by the whitelisted address.");
            // Verify merkle proof
            bytes32 node = keccak256(abi.encodePacked(index, account, whitelistedAmount));
            require(MerkleProof.verify(merkleProof, merkleRoot, node), "Invalid merkle proof.");
            require(balanceOf(msg.sender).add(numberOfTokens) <= whitelistedAmount, "Cannot exceed amount whitelisted during early access mode.");
        } else {
            require(numberOfTokens <= maxMints, "Cannot mint more than 5 per tx during public sale.");
        }

        _mintVitaliks(numberOfTokens);
    }

    // Override the below functions from parent contracts

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return string(abi.encodePacked(baseURI, Strings.toString(tokenId)));
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }
}
