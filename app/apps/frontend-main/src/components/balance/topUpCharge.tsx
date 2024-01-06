import { FC, useState } from 'react';
import { RegularCurrency } from '@fans/types';

const DEFAULT_AMOUNT: number = 10;

const BalanceTopUpCharge: FC = () => {
  const [currency, setCurrency] = useState<RegularCurrency>(RegularCurrency.USD);
  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT);

  return <div className="flex flex-col gap-4">
    <p>Select currency</p>
    <select
      value={currency}
      className="select select-bordered w-full"
      onChange={(event) => setCurrency(() => event.target.value as RegularCurrency)}
    >
      {Object.keys(RegularCurrency).map(key => <option
        key={RegularCurrency[key]}
        value={RegularCurrency[key]}
      >{RegularCurrency[key].toUpperCase()}</option>)}
    </select>

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

    <table className="table">
      <tbody>
      <tr>
        <th>Method</th>
        <td>Visa</td>
      </tr>

      <tr>
        <th>Provider</th>
        <td>Tonkeeper</td>
      </tr>
      </tbody>
    </table>

    <button className="btn btn-success text-white">Buy crypto</button>
  </div>
    ;
};

export default BalanceTopUpCharge;
