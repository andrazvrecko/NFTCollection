// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import { Base64 } from "./libraries/Base64.sol";

contract MyEpicNFT is ERC721URIStorage {
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string baseSvg = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    string[] firstWords = ["Lucario", "Jolteon", "Glaceon", "Pikachu"];
    string[] secondWords = ["Mega", "Ultra", "Super"];
    string[] thirdWords = ["Combo", "Slide", "Punch", "Kick"];

    event NewNFTMinted(address sender, uint256 tokenId);

    constructor() ERC721 ("LucarioNFT" , "LUCA") {
        console.log("This is my NFT contract!");
    }

    modifier validWordNumber(uint256 number) {
        require(number > 0 && number < 4);
        _;
    }
    
    modifier canMintNewNFT(){
        require(_tokenIds.current() < 50);
        _;
    }

    function random(string memory input) internal pure returns(uint256){
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function numberOfMintedNFTS() public view returns(uint256){
        return(_tokenIds.current());
    }

    function pickRandomWord(uint256 tokenId, uint256 wordNumber) public view validWordNumber(wordNumber) returns (string memory){
        if(wordNumber == 1){
            uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));
            rand = rand % firstWords.length;
            return firstWords[rand];
        }
        else if(wordNumber == 2){
            uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
            rand = rand % secondWords.length;
            return secondWords[rand];
        }
        else{
            uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
            rand = rand % thirdWords.length;
            return thirdWords[rand];
        }
    }

    function makeNFT() public canMintNewNFT {
        uint256 newItemId = _tokenIds.current();

        string memory first = pickRandomWord(newItemId, 1);
        string memory second = pickRandomWord(newItemId, 2);
        string memory third = pickRandomWord(newItemId, 3);
        string memory combinedWord = string(abi.encodePacked(first, second, third));

        string memory finalSvg = string(abi.encodePacked(baseSvg, combinedWord, "</text></svg>"));
        
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        combinedWord,
                        '", "description": "A highly acclaimed collection of squares.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(finalSvg)),
                        '"}'
                    )
                )
            )
        );

        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        console.log("\n--------------------");
        console.log(finalTokenUri);
        console.log("--------------------\n");

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, finalTokenUri);
        console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
        _tokenIds.increment();
        emit NewNFTMinted(msg.sender, newItemId);
    }
}
