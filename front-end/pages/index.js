import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { providers ,Contract} from "ethers";
import styles from "../styles/Home.module.css";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../../constants";


export default function Home() {
  const [isOwner, setIsOwner] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded]= useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();


  const getOwner= async ()=>{
    try{
      const signer =await getProviderOrSigner();

      // Get an instance of the contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const owner = nftContract.owner();
      const userAddress = signer.getAddress();
      
      if (owner.toLowerCase() === userAddress.toLowerCase()){
        setIsOwner(true)
      }
    }catch(error){
      console.error(error)
    }
  }

  const startPresale = async()=>{
    try{
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      const txn = await nftContract.startPresale();
      await txn.wait();

      setPresaleStarted(true);
    }catch(error){
      console.error(error)
    }
  }

const checkIfPresaleEnded = async ()=>{
  try{
    const provider = await getProviderOrSigner();

    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );
    //This will return a BigNumber because presaleEnded is a uint256
    // this will return a timestamp in seconds
    const presaleEndTime = await nftContract.presaleEnded();
    const currentTimeInSeconds = Date.now() / 1000;
    const hasPresaleEnded = presaleEndTime.lt(
      Math.floor(currentTimeInSeconds)
    );
    setPresaleEnded(hasPresaleEnded)
  }catch(error){
    console.error(error)
  }
}

  const checkIfPresaleStarted = async()=>{
    try{
      const provider = await getProviderOrSigner();

      //get instance of the NFT Contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);

      return isPresaleStarted;
    }
    catch (error){
      console.error(error);
      return false;
    }
  }

  const connectWallet = async () => {
    await getProviderOrSigner();
    setWalletConnected(true);
  };

  const getProviderOrSigner = async (needSigner = false) => {
    //Gaining access to the provider/ signer from metamask
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    //If the user is Not connected to Goerli, tell them to switch to Goerli
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Please switch to the Goerli network");
      throw new Error("Incorrect network");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const onPageLoad = async ()=>{
    await connectWallet();
    await getOwner();
    const presaleStarted = await checkIfPresaleStarted();
    if (presaleStarted){
      await checkIfPresaleEnded();
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      //instantiate Web3Modal
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    onPageLoad();
    }
  });

  function renderBody(){
    if (!walletConnected){
      return(
        <button onClick={connectWallet} className={styles.button}>
          Connect your Wallet
        </button>
      );
    }
    if (isOwner && !presaleStarted){
      //render a button to start the presale
    }
    if (!presaleStarted){
      //just say that presale has not started yet, come back later
    }
    if (presaleStarted && !presaleEnded){
      //allow users to mint in presale
      //they need to be in whitelist for this to work
    }
    if (presaleEnded){
      //allow users to mint in presale
    }
  }

  return (
    <div className="">
      <Head>
        <title>NFT Collection</title>
        <meta
          name="description"
          content="An nft collection website that only whitelisted addresses can mint"
        />
        <link rel="icon" href="" />
      </Head>
      <div className={styles.main}>
      
      </div>
    </div>
  );
}
