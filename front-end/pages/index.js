import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { providers ,Contract} from "ethers";
import styles from "../styles/Home.module.css";
//import {NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS} from "../contants"

export default function Home() {
  const [isOwner, setIsOwner] = useState(false);
  const [isPresaleOngoing, setIsPresaleOngoing] = useState(false)
  const [presaleStarted, setPresaleStarted] = useState(false);
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
    }
    catch (error){
      console.error(error);
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

  useEffect(() => {
    if (!walletConnected) {
      //instantiate Web3Modal
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      checkIfPresaleStarted
    }
  });

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
        {walletConnected ? null : (
          <button onClick={connectWallet} className={styles.button}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
