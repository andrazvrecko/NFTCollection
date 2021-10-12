import './styles/App.css';
import React, {useEffect, useState} from "react";
import { ethers } from 'ethers';
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const rinkebyChainId = "0x4";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [openseaLink, setOpenseaLink] = useState("");
  const [nftsMinted, setNftsMinted] = useState(-1);
  const CONTRACT_ADDRESS = "0xC6D0e7e0f2cEd6c04F460478FB6EE52319cEb61C";

  // Render Methods
  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;
    if (!ethereum) {
      console.log("Install MetaMask!");
      return;
    }
    else {
      console.log("Ethereum: ", ethereum);
      setupEventListener();
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if (accounts.length !== 0){
      const account = accounts[0];
      console.log("Account: ", account);
      setCurrentAccount(account);
    }
    else{
      console.log("No accounts found!");
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum){
        alert("Install MetaMask!");
        return
      }
      const accounts = await ethereum.request({method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error){
      console.log(error)
    }
  }

  const getNumberOfNFTs = async () => {
    try {
      const {ethereum} = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, provider);
        let numberOfNfts = await connectedContract.numberOfMintedNFTS();
        console.log("NFTs: ",parseInt(numberOfNfts));
        setNftsMinted(parseInt(numberOfNfts));

      }
    } catch (error){
      console.log(error)
    }
  }

  const mintNft = async () => {
    if(nftsMinted === -1 || nftsMinted >= 50){
      alert("Maximum number already minted!");
      return;
    }
    try{
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        let nftTxn = await connectedContract.makeNFT();
        await nftTxn.wait();

        console.log(`Mined @ https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)
      }
      else{
        console.log("Ether object doesnt exist")
      }
    }catch(error){
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setOpenseaLink(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
          setNftsMinted(tokenId.toNumber());

        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getNumberOfNFTs();
  }, [])

  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect to Wallet
    </button>
  );

  const renderMintContainer = () => (
    <button className="cta-button mint-button" onClick={mintNft}>
      Mint
    </button>
  );

  const renderOpenseaLinkContainer = () => (
    <button className="cta-button opensea-button" onClick={(e) => {     
      window.open(openseaLink, "_blank")
      }}>
      OpenSea
    </button>
  );
  
  const renderCollectionLinkContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={(e) => {
      window.open("https://testnets.opensea.io/collection/lucarionft-v4", "_blank")
      }}>
      Collection
    </button>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p><p className="sub-text">
            {nftsMinted}/50 already minted!
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintContainer()}
          {openseaLink === "" ? "<br>" : renderOpenseaLinkContainer()}
          <br />
          <br />
          {renderCollectionLinkContainer()}
          
        </div>
        <div className="footer-container">
        </div>
      </div>
    </div>
  );
};

export default App;