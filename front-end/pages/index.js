import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { providers } from "ethers";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();

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
