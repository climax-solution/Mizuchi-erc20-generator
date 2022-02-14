import { useState } from "react";
import Switch from "react-switch";
import ReactTooltip from 'react-tooltip';

function App() {

  const [name, setTokenName] = useState('');
  const [symbol,setTokenSymbol] = useState('');
  const [decimal, setDecimal] = useState();
  const [taxPercentage, setTaxPercentage] = useState('');
  const [autoLiquify, setAutoLiquify] = useState(false);
  const [totalSupply, setTotalSupply] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const [taxWallet1, setTaxWallet1] = useState('');
  const [taxWallet2, setTaxWallet2] = useState('');
  const [taxWallet3, setTaxWallet3] = useState('');
  const [taxWallet4, setTaxWallet4] = useState('');

  return (
    <div className="App">
      <div className="container">
        <div className="text-center py-3">
          <img src="/assets/logo.png" className="w-100px"/>
        </div>
        <form className="d-grid box-layout mb-5">
          {/* <div className="col-md-6 col-sm-12 mx-auto d-flex justify-content-end"> */}
            <div className="detail-box p-5 h-100 rounded">
              <div className="form-group">
                <label htmlFor="token-name">Token Name</label>
                <input type="text" className="form-control" name="token-name" value={name} onChange={(e) => setTokenName(e.target.value)} required/>
                <small className="text-dark">Choose a name for your token.</small>
              </div>
              <div className="form-group mt-3">
                <label htmlFor="token-symbol">Token Symbol</label>
                <input type="text" className="form-control" name="token-symbol" value={symbol} onChange={(e) => setTokenSymbol(e.target.value)} required/>
                <small className="text-dark">Choose a symbol for your token.</small>
              </div>
              <div className="form-group mt-3">
                <label htmlFor="decimals">Decimals</label>
                <input type="number" className="form-control" name="decimals" value={decimal} onChange={(e) => setDecimal(e.target.value)} required/>
                <small className="text-dark">Insert the decimal precision of your token. If you don't know what to insert, use 18.</small>
              </div>

              <div className="form-group mt-3">
                <label htmlFor="supply">Total Supply</label>
                <input type="number" className="form-control" name="supply" value={totalSupply} onChange={(e) => setTotalSupply(e.target.value)} required/>
                <small className="text-dark">Insert the total suppy precision of your token.</small>
              </div>

              <div className="form-group mt-3">
                <label htmlFor="maxAmount">Max amount for wallet</label>
                <input type="number" className="form-control" name="maxAmount" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} required/>
                <small className="text-dark">Insert the total suppy precision of your token.</small>
              </div>

              <div className="form-group mt-3">
                <label htmlFor="auto-liquify" className="d-block">Allow auto liquify</label>
                <Switch name="auto-liquify" className="d-block my-2" checked={autoLiquify} onChange={() => setAutoLiquify(!autoLiquify)} required/>
                <small className="text-dark">Insert the tax percentage. Maximum is 15%.</small>
              </div>
            </div>
          {/* </div> */}
          {/* <div className="col-md-6 col-sm-12 mx-auto"> */}
            <div className="detail-box p-5 h-100 rounded">
              <div className="form-group mt-3">
                <label htmlFor="tax-percentage">Tax Percentage</label>
                <input type="number" className="form-control" name="tax-percentage" value={taxPercentage} onChange={(e) => setTaxPercentage(e.target.value)} required/>
                <small className="text-dark">Insert the tax percentage. Maximum is 15%.</small>
              </div>
              <div className="form-group mt-3">
                <label htmlFor="wallet">Wallets</label>
                <input type="text" className="form-control mt-3" name="wallet-1" value={taxWallet1} onChange={(e) => setTaxWallet1(e.target.value)} required/>
                <input type="text" className="form-control mt-3" name="wallet-2" value={taxWallet2} onChange={(e) => setTaxWallet2(e.target.value)} required/>
                <input type="text" className="form-control mt-3" name="wallet-3" value={taxWallet3} onChange={(e) => setTaxWallet3(e.target.value)} required/>
                <input type="text" className="form-control mt-3" name="wallet-4" value={taxWallet4} onChange={(e) => setTaxWallet4(e.target.value)} required/>
                <small className="text-dark">Insert your tax wallets.</small>
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
                <button type="submit" className="btn btn-success py-4 w-100 text-white">Generate</button>
              </div>
            </div>
          {/* </div> */}
        </form>
      </div>
    </div>
  );
}

export default App;
