import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"

const clientId = "BMSW75dweq-8JMeDOmHay76pMK1QJ2d_fz3xJ1pY9Nj9nqLNJokNEWCZoaWvZGAt2GZI0HIvGEyGNo60YeS5TsE";

function App() {
  const [web3auth, setWeb3auth] = useState(null);
  const [provider, setProvider] = useState(null);
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
  console.log(provider)
    const init = async () => {
      try {
        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: {
            chainConfig: {
              chainNamespace: "eip155",
              chainId: "0xaa36a7",
              rpcTarget: "https://rpc.ankr.com/eth_sepolia/83b88de74d44e0dcac059e54ec1bc8adf2d5fca174780c6ef1311e9e2d3cfca8",
            },
            loginConfig: {
              google: {
                verifier: "google-sepolia-login",
                typeOfLogin: "google",
                clientId: "593949437835-0ab1dmu486v2iikanahk0rb6mtdnp8v9.apps.googleusercontent.com",
              },
            },
          },
        });

        const web3auth = new Web3Auth({
          clientId,
          web3AuthNetwork: "sapphire_devnet",
          privateKeyProvider,
        });

        await web3auth.initModal();
        setWeb3auth(web3auth);

        if (web3auth.provider) {
          setProvider(web3auth.provider);
          const userInfo = await web3auth.getUserInfo();
          setUser(userInfo);

          const ethersProvider = new ethers.BrowserProvider(web3auth.provider);
          const signer = await ethersProvider.getSigner();
          const addr = await signer.getAddress();
          setAddress(addr);
        }
      } catch (err) {
        console.error("Web3Auth init failed:", err);
      }
    };
    init()
  });

  const login = async () => {
    if (!web3auth) return;

    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);

      const userInfo = await web3auth.getUserInfo();
      setUser(userInfo);

      const ethersProvider = new ethers.BrowserProvider(web3authProvider);
      const signer = await ethersProvider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
    } catch (err) {
      if (err.message === "User closed the modal") {
        console.log("User cancelled login");
      } else {
        console.error("Login failed:", err);
      }
    }
  };


  const logout = async () => {
    if (!web3auth) return;
    await web3auth.logout();
    setUser(null);
    setProvider(null);
    setAddress("");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🔐 Web3Auth + React Demo</h1>

      {user ? (
        <>
          <p>👤 Logged in as: {user.name || user.email}</p>
          <p>🪪 Wallet: {address}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Login with Web3Auth</button>
      )}
    </div>
  );
}

export default App;

