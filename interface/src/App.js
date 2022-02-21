import { useState } from "react";
import Switch from "react-switch";
import ReactTooltip from 'react-tooltip';
import { Alert } from "react-bootstrap";
import Web3 from 'web3';
import { useMetaMask } from "metamask-react";
import { NotificationContainer, NotificationManager } from "react-notifications";
import Loading from "./Loading";
import "react-notifications/lib/notifications.css";

import data_common from "./data/common.json";
import data_entire from "./data/entire.json";
import data_blacklist from "./data/blacklist.json";
import data_liquidity from "./data/liquidity.json";
import axios from "axios";
import querystring from "querystring";

const txScan = {
  "1": "https://etherscan.io/tx/",
  "3": "https://ropsten.etherscan.io/tx",
  "4": "https://rinkeby.etherscan.io/tx",
  "5": "https://goerli.etherscan.io/tx",
  "42": "https://kovan.etherscan.io/tx"
}

const apiURI = {
  "1": "https://etherscan.io/api",
  "3": "https://api-ropsten.etherscan.io/api",
  "4": "https://api-rinkeby.etherscan.io/api",
  "5": "https://api-goerli.etherscan.io/api",
  "42": "https://api-kovan.etherscan.io/api"
}

function App() {

  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [txHash, setTxHash] = useState('');

  const [name, setTokenName] = useState('');
  const [symbol,setTokenSymbol] = useState('');
  const [decimal, setDecimal] = useState();
  const [taxPercentage, setTaxPercentage] = useState('');
  const [autoLiquify, setAutoLiquify] = useState(false);
  const [blackable, setBlackAble] = useState(false);
  const [totalSupply, setTotalSupply] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [liqDiv, setLiqDiv] = useState('');
  const { status, connect, account, chainId, ethereum } = useMetaMask();

  const [taxWallet1, setTaxWallet1] = useState('');
  const [taxWallet2, setTaxWallet2] = useState('');
  const [taxWallet3, setTaxWallet3] = useState('');
  const [taxWallet4, setTaxWallet4] = useState('');

  const [division1, setDivision1] = useState('');
  const [division2, setDivision2] = useState('');
  const [division3, setDivision3] = useState('');
  const [division4, setDivision4] = useState('');
  
  const [nameError, setNameError] = useState(false);
  const [symbolError, setSymbolError] = useState(false);
  const [decimalError, setDecimalError] = useState(false);
  const [supplyError, setSupplyError] = useState(false);
  const [maxAmountError, setMaxAmountError] = useState(false);
  const [liqDivError, setLiqDivError] = useState(false);
  const [taxError, setTaxError] = useState(false);
  const [walletError, setWalletError] = useState(false);

  const deploy = async() => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts"});
        let taxWallets = [];
        let allDivision = 0;

        if (taxWallet1 && division1 && division1 > 0) {
          if (web3.utils.isAddress(taxWallet1)) {
            allDivision += division1;
            taxWallets.push([taxWallet1, division1]);
          }
        }

        if (taxWallet2 && division2 && division2 > 0) {
          if (web3.utils.isAddress(taxWallet2)) {
            allDivision += division2;
            taxWallets.push([taxWallet2, division2]);
          }
        }
        
        if (taxWallet3 && division3 && division3 > 0) {
          if (web3.utils.isAddress(taxWallet3)) {
            allDivision += division3;
            taxWallets.push([taxWallet3, division3]);
          }
        }

        if (taxWallet4 && division4 && division4 > 0) {
          if (web3.utils.isAddress(taxWallet4)) {
            allDivision += division3;
            taxWallets.push([taxWallet4, division3]);
          }
        }
        let flag = 0;
        if (allDivision != 100) {
          setWalletError(true);
          flag = 1;
        }

        if (!name) {
          setNameError(true);
          flag = 1;
        }

        if (!symbol) {
          setSymbolError(true);
          flag = 1;
        }

        if (totalSupply <= 0 || maxAmount <= 0 || totalSupply < maxAmount) {
          setSupplyError(true);
          setMaxAmountError(true);
          flag = 1;
        }

        if (!decimal || decimal <= 0 || decimal > 18 ) {
          setDecimalError(true);
          flag = 1;
        }

        if (autoLiquify && liqDiv <= 0) {
          setLiqDivError(true);
          flag = 1;
        }

        if (taxPercentage <= 0) {
          setTaxError(true);
          flag = 1;
        }
        if (flag) {
          setLoading(false);
          return;
        }

        let activeData; let constructor = [];

        if (!autoLiquify && !blackable) {
          activeData = data_common;
          constructor = [
            name, symbol,decimal, totalSupply, maxAmount, taxPercentage, taxWallets
          ];
        }
        else if (autoLiquify && blackable) {
          activeData = data_entire;
          constructor = [
            name, symbol,decimal, totalSupply, maxAmount, taxPercentage, liqDiv, taxWallets
          ];
        }
        else if (autoLiquify  && !blackable) {
          activeData = data_liquidity;
          constructor = [
            name, symbol,decimal, totalSupply, maxAmount, taxPercentage, liqDiv, taxWallets
          ];
        }
        else if (!autoLiquify  && blackable) {
          activeData = data_blacklist;
          constructor = [
            name, symbol,decimal, totalSupply, maxAmount, taxPercentage, taxWallets
          ];
        }

        const commonContract = new web3.eth.Contract(activeData.abi);
        await commonContract.deploy({
          data: activeData.bytecode,
          arguments: constructor
        }).send({
          from: accounts[0],
          value: web3.utils.toWei("0.2", "ether")
        }, (err, hash) => {
          if (!err) setTxHash(hash);
        }).on("confirmation", () => {
          return 1;
        }).then(async(instance) => {
          const { options } = instance;
          console.log(options);
          const encodedConstructorArgs = await getContructorArgs(options.address, activeData.bytecode);
          const inputJSON = {
            language: 'Solidity',
            sources: {
              "/contracts/token.sol":{
                content: activeData.content
              }
            },
            settings: {
              remappings: [],
              optimizer: { enabled: false, runs: 200 },
              evmVersion: "istanbul",
              libraries: {}
            }
          }
          const postQueries = {
            apikey: "5Z1RRTM3R1VF8U9BS6DVBZZEACU5XUN59Q",
            module: 'contract',
            action: 'verifysourcecode',
            contractaddress: options.address,
            sourceCode: JSON.stringify(inputJSON),
            codeformat: 'solidity-standard-json-input',
            contractname: `/token.sol:MizuchiCommon`,
            compilerversion: "v0.6.6+commit.6c089d02",
            constructorArguements: encodedConstructorArgs
          }

          const { data } = await axios.post(apiURI[Number(chainId)], querystring.stringify(postQueries));
          if (data.status === "1") {
            NotificationManager.success("Deployed successfully");
            setLoading(false);
            setShow(true);
          } else {
            throw Error("Verify failure");
          }
        }).catch(err => {
          setLoading(false);
          setShow(false);
          NotificationManager.warning(err.message);
        })
        setLoading(false);
        } catch(err) {
          setLoading(false);
          setShow(false);
          NotificationManager.warning(err.message);
        }
    }
    else {
      NotificationManager.warning("Metamask is not installed");
    }
  }

  const getContructorArgs = async(contractAddress, bytecode) => {
    let res
    try {
      const qs = querystring.stringify({
        apiKey: "5Z1RRTM3R1VF8U9BS6DVBZZEACU5XUN59Q",
        module: 'account',
        action: 'txlist',
        address: contractAddress,
        page: 1,
        sort: 'asc',
        offset: 1
      })
      const url = `https://api-ropsten.etherscan.io/api?${qs}`;
      res = await axios.get(url)
    } catch (error) {
      throw new Error(`Failed to connect to Etherscan API at url https://api-ropsten.etherscan.io/api`)
    }
    if (res.data && res.data.status === "1" && res.data.result[0] !== undefined) {
      const constructorArgs = res.data.result[0].input.substring(bytecode.length)
      return constructorArgs
    } else {
      return ''
    }
  }

  return (
    <div className="App">
      <NotificationContainer/>
      { loading && <Loading/> }
      <div className="container">
        <div className="text-center py-3">
          <img src="/assets/logo.png" className="w-100px"/>
        </div>
        <div className="d-grid box-layout mb-5">
          {/* <div className="col-md-6 col-sm-12 mx-auto d-flex justify-content-end"> */}
            <div className="detail-box p-5 h-100 rounded">
              <div className="form-group">
                <label htmlFor="token-name">Token Name</label>
                <input
                  type="text"
                  className={`form-control ${ nameError && "border-danger"}`}
                  name="token-name"
                  value={name}
                  onChange={(e) => {setTokenName(e.target.value); setNameError(false)}}
                  required
                />
                <small className={`${ nameError ? "text-danger" : "text-dark"}`}>Choose a name for your token.</small>
              </div>
              <div className="form-group mt-3">
                <label htmlFor="token-symbol">Token Symbol</label>
                <input
                  type="text"
                  className={`form-control ${ symbolError && "border-danger"}`}
                  name="token-symbol"
                  value={symbol}
                  onChange={(e) => {setTokenSymbol(e.target.value); setSymbolError(false)}}
                  required
                />
                <small className={`${ symbolError ? "text-danger" : "text-dark"}`}>Choose a symbol for your token.</small>
              </div>
              <div className="form-group mt-3">
                <label htmlFor="decimals">Decimals</label>
                <input
                  type="number"
                  className={`form-control ${ decimalError && "border-danger"}`}
                  name="decimals"
                  value={decimal}
                  onChange={(e) => {setDecimal(Math.floor(e.target.value)); setDecimalError(false)}}
                  required
                />
                <small className={`${ decimalError ? "text-danger" : "text-dark"}`}>Insert the decimal precision of your token. If you don't know what to insert; use 18.</small>
              </div>

              <div className="form-group mt-3">
                <label htmlFor="supply">Total Supply</label>
                <input
                  type="number"
                  className={`form-control ${ supplyError && "border-danger"}`}
                  name="supply"
                  value={totalSupply}
                  onChange={(e) => {
                    setTotalSupply(Math.floor(e.target.value));
                    setSupplyError(false)
                  }}
                  required
                />
                <small className={`${ supplyError ? "text-danger" : "text-dark"}`}>Insert the total suppy precision of your token.</small>
              </div>

              <div className="form-group mt-3">
                <label htmlFor="maxAmount">Max amount per transaction</label>
                <input
                  type="number"
                  className={`form-control ${ maxAmountError && "border-danger"}`}
                  name="maxAmount"
                  value={maxAmount}
                  onChange={(e) => {
                    setMaxAmount(Math.floor(e.target.value));
                    setMaxAmountError(false);
                  }}
                  required
                />
                <small className={`${ maxAmountError ? "text-danger" : "text-dark"}`}>Insert the total supply precision of your token.</small>
              </div>

              <div className="form-group row mt-3">
                <div className="col-md-6">
                  <label htmlFor="auto-liquify" className="d-block">Allow auto liquify</label>
                  <Switch
                    name="auto-liquify"
                    className="d-block my-2"
                    checked={autoLiquify}
                    onChange={() => {
                      setAutoLiquify(!autoLiquify);
                      setLiqDivError(false);
                    }}
                  />
                  { autoLiquify &&
                    <input
                      type="number"
                      className={`form-control w-50 ${liqDivError && "border-danger"}`}
                      value={liqDiv}
                      onChange={(e) => {
                        setLiqDiv(Math.floor(e.target.value));
                        setLiqDivError(false);
                      }}
                    />
                  }
                  <small className={`${ liqDivError ? "text-danger" : "text-dark"}`}>Tax goes to token liquidity.</small>
                </div>

                <div className="col-md-6">
                  <label htmlFor="blacklist" className="d-block">Allow black list</label>
                  <Switch
                    name="blacklist"
                    className="d-block my-2"
                    checked={blackable}
                    onChange={() => setBlackAble(!blackable)}
                  />
                  <small className="text-dark">Black list users can't transfer and receive tokens.</small>
                </div>
              </div>
            </div>
          {/* </div> */}
          {/* <div className="col-md-6 col-sm-12 mx-auto"> */}
            <div className="detail-box p-5 h-100 rounded">
              <div className="form-group mt-3">
                <label htmlFor="tax-percentage">Tax Percentage</label>
                <input
                  type="number"
                  className={`form-control ${ taxError && "border-danger"}`}
                  name="tax-percentage"
                  value={taxPercentage}
                  onChange={(e) => {
                    setTaxPercentage(e.target.value);
                    setTaxError(false);
                  }}
                  required
                />
                <small className={`${ taxError ? "text-danger" : "text-dark"}`}>Insert the tax percentage. Maximum is 15%.</small>
              </div>
              <div className="form-group mt-3">
                <label htmlFor="wallet">Wallets</label>
                <div className="group-title d-flex justify-content-between mt-3">
                  <span>Address</span>
                  <span className="me-2">Division</span>
                </div>
                <div className="wallet-input-group d-flex">
                  <input
                    type="text"
                    className={`form-control ${ walletError && "border-danger"}`}
                    name="wallet-1"
                    value={taxWallet1}
                    onChange={(e) => {
                      setTaxWallet1(e.target.value);
                      setWalletError(false);
                    }}/>
                  <input
                    type="number"
                    className={`form-control ${ walletError && "border-danger"}`}
                    name="divison-1"
                    value={division1}
                    onChange={(e) => {
                      setDivision1(Math.floor(e.target.value));
                      setWalletError(false);
                    }}/>
                </div>
                <div className="wallet-input-group d-flex mt-3">
                  <input
                    type="text"
                    className={`form-control ${ walletError && "border-danger"}`}
                    name="wallet-2"
                    value={taxWallet2} onChange={(e) => {
                      setTaxWallet2(e.target.value);
                      setWalletError(false);
                    }}/>
                  <input
                    type="number"
                    className={`form-control ${ walletError && "border-danger"}`}
                    name="divison-2"
                    value={division2}
                    onChange={(e) => {
                      setDivision2(Math.floor(e.target.value));
                      setWalletError(false);
                    }}/>
                </div>
                <div className="wallet-input-group d-flex mt-3">
                  <input
                    type="text"
                    className={`form-control ${ walletError && "border-danger"}`}
                    name="wallet-3"
                    value={taxWallet3}
                    onChange={(e) => {
                      setTaxWallet3(e.target.value);
                      setWalletError(false);
                    }}/>
                  <input
                    type="number"
                    className={`form-control ${ walletError && "border-danger"}`}
                    name="divison-3"
                    value={division3}
                    onChange={(e) => {
                      setDivision3(Math.floor(e.target.value));
                      setWalletError(false);
                    }}/>
                </div>
                <div className="wallet-input-group d-flex mt-3">
                  <input
                    type="text"
                    className={`form-control ${ walletError && "border-danger"}`}
                    name="wallet-4"
                    value={taxWallet4}
                    onChange={(e) => {
                      setTaxWallet4(e.target.value);
                      setWalletError(false);
                    }}/>
                  <input
                    type="number"
                    className={`form-control ${ walletError && "border-danger"}`}
                    name="divison-4"
                    value={division4}
                    onChange={(e) => {
                      setDivision4(Math.floor(e.target.value));
                      setWalletError(false);
                    }}/>
                </div>
                <small className={`${ walletError ? "text-danger" : "text-dark"}`}>Insert your tax wallets.</small>
              </div>
              <div className="form-group mt-3">
                <label htmlFor="wallet">Transaction</label>
                <div className="p-2 rounded mt-1 border-dark-grey d-flex justify-content-between">
                  <div>
                    <span className="me-1">Commision Fee</span>
                    <small data-tip data-for={`commision-fee`}><i className="fal fa-info-circle"/></small>
                    <ReactTooltip id={`commision-fee`} type='info' effect="solid">
                        <span>Commission will be transferred directly to us through the Ethereum network as part of your payment. Commission will support Token Generator to keep it safe, running and constantly updated.</span>
                    </ReactTooltip>
                  </div>
                  <div>
                    <span className="badge bg-success">0.2ETH</span>
                  </div>
                </div>
                <div className="p-2 rounded mt-3 border-dark-grey d-flex justify-content-between">
                  <div>
                    <span className="me-1">Gas Fee</span>
                    <small data-tip data-for={`gas-fee`}><i className="fal fa-info-circle"/></small>
                    <ReactTooltip id={`gas-fee`} type='info' effect="solid">
                        <span>It depends on Gas Limit and on current Gas price average. MetaMask will suggest both. Do not decrease Gas Limit to avoid transaction to fail. If you want, you can decrease Gas Price but your transaction could remain pending for minutes/hours. Read how to calculate right value in our FAQ. Failed transaction can't be refunded.</span>
                    </ReactTooltip>
                  </div>
                  <div>
                    <span className="badge bg-info">Variable</span>
                  </div>
                </div>
              </div>
              <div className="form-group mt-3">
                <button type="submit" className="btn btn-success py-4 w-100 text-white" onClick={deploy}>Generate</button>
              </div>
            </div>
          {/* </div> */}
        </div>
        { show && (
          <Alert variant="success" onClose={() => setShow(false)} dismissible>
            <p><a href={txScan[Number(chainId)] + txHash} _target="blank">{txHash}</a></p>
          </Alert>
        )}
      </div>
    </div>
  );
}

export default App;
