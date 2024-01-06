import { FC, useState } from 'react';
import { CryptoCurrency, CryptoCharger } from '@fans/types';
// import classnames from 'classnames';

const DEFAULT_AMOUNT: number = 10;

const BalanceTopUpDeposit: FC = () => {
  const [currency, setCurrency] = useState<CryptoCurrency>(CryptoCurrency.TON);
  const [wallet, setWallet] = useState<CryptoCharger>(CryptoCharger.WALLET);
  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT);

  return <div className="flex flex-col gap-4">
    <p>Select currency</p>
    <select
      value={currency}
      className="select select-bordered w-full"
      onChange={(event) => setCurrency(() => event.target.value as CryptoCurrency)}
    >
      {Object.keys(CryptoCurrency).map(key => <option
        key={CryptoCurrency[key]}
        value={CryptoCurrency[key]}
      >{CryptoCurrency[key].toUpperCase()}</option>)}
    </select>

    <p>Use</p>
    <div className="join">
      {Object.keys(CryptoCharger).map(key => <input
        key={key}
        value={CryptoCharger[key]}
        checked={wallet === CryptoCharger[key]}
        onChange={(event) => setWallet(() => event.target.value as CryptoCharger)}
        className="join-item btn"
        type="radio"
        name="wallet"
        aria-label={`@${CryptoCharger[key]}`}
      />)}
    </div>

    <p>Amount</p>
    <input
      value={amount}
      onChange={(event) => setAmount(() => {
        const value = event.target.value.replaceAll(/\D/g, '');
        if (value) {
          const parsedValue = parseInt(value);
          if (parsedValue && parsedValue > 0) {
            return parsedValue;
          }
        }

        return DEFAULT_AMOUNT;
      })}
      type="number"
      className="input input-bordered w-full"
    />

    <button className="btn btn-success text-white">Top up balance</button>
  </div>;
};

export default BalanceTopUpDeposit;
