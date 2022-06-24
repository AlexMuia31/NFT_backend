//SPDX-Lincese_Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    /**
     * @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`.
     */
    string _baseTokenURI;

    // max number of CryptoDevs
    uint256 public maxTokenIds = 20;

    // total number of tokenIds minted
    uint256 public tokenIds;

    uint256 public _price = 0.01 ether;

    // Whitelist contract instance
    IWhitelist whitelist;

    /**
     * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
     * name in our case is `Crypto Devs` and symbol is `CD`.
     * Constructor for Crypto Devs takes in the baseURI to set _baseTokenURI for the collection.
     * It also initializes an instance of whitelist interface.
     */

    bool public presaleStarted;

    uint256 presaleEnded;

    constructor(string memory _baseURI, address whitelistContract)
        ERC721("Crypto Devs", "CD")
    {
        _baseTokenURI = _baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    /**
     * @dev startPresale starts a presale for the whitelisted addresses
     */
    function startPresale() public onlyOwner {
        presaleStarted = true;
        // Set presaleEnded time as current timestamp + 5 minutes
        // Solidity has cool syntax for timestamps (seconds, minutes, hours, days, years)
        presaleEnded = block.timestamp + 5 minutes;
    }

    /**
     * @dev presaleMint allows a user to mint one NFT per transaction during the presale.
     */
    function presaleMint() public payable {
        require(
            presaleStarted && block.timestamp < presaleEnded,
            "Presale ended"
        );
        require(
            whitelist.whitelistedAddresses(msg.sender),
            "You are not whitelisted"
        );
        require(tokenIds < maxTokenIds, "Exceeded the limit");
        require(msg.value >= _price, "Ether sent is not correct");

        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable {
        require(
            presaleStarted && block.timestamp >= presaleEnded,
            "Presale has not ended yet"
        );
        require(tokenIds < maxTokens, "Exceeded the limit");
        require(msg.value >= _price, "Ether sent is not correct");

        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }
}
