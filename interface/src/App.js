import { useState } from "react";
import Switch from "react-switch";
import ReactTooltip from 'react-tooltip';
import Web3 from 'web3';

import abi_common from "./abi/common.json";
import abi_entire from "./abi/entire.json";
import abi_blacklist from "./abi/blacklist.json";
import abi_liquidity from "./abi/liquidity.json";

import bytecode_common from "./bytecode/common";
import bytecode_entire from "./bytecode/entire";
import bytecode_blacklist from "./bytecode/blacklist";
import bytecode_liquidity from "./bytecode/liquidity";

function App() {

  const [name, setTokenName] = useState('');
  const [symbol,setTokenSymbol] = useState('');
  const [decimal, setDecimal] = useState();
  const [taxPercentage, setTaxPercentage] = useState('');
  const [autoLiquify, setAutoLiquify] = useState(false);
  const [blackable, setBlackAble] = useState(false);
  const [totalSupply, setTotalSupply] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [liqDiv, setLiqDiv] = useState('');

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
        const web3 = new Web3(window.ethereum);
        const commonContract = new web3.eth.Contract(abi_common);
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
        if (flag) return;
        commonContract.deploy({
          data: bytecode_common,
          arguments: ["name", "symbol", 18, 100000000, 1000, 12, [["0x8bD154D7b5ADbDab1d45D5C59512F2e9EbBcF219", 50],["0x2f1e0ffCC0CcAeEDAD34Ff26767488C67f98B41f",50]]]
        }).send({
          from: accounts[0],
          value: web3.utils.toWei("0.2", "ether")
        }, (err, txHash) => {
          console.log(err, txHash);
        }).on("confirmation", () => {
          return 1;
        }).then((instance) => {
          console.log(instance);
        }).catch(err => {
          console.log("ERRR", err);
        })
        } catch(err) {
          console.log(err);
        }
    }
  }

  console.log(nameError);
  return (
    <div className="App">
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
                <small className={`${ maxAmountError ? "text-danger" : "text-dark"}`}>Insert the total suppy precision of your token.</small>
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
      </div>
    </div>
  );
}

export default App;
