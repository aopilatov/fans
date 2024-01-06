import { FC, MutableRefObject, useState } from 'react';
import { useDispatch } from 'react-redux'
import { Dispatch } from '@/stores';

interface Props {
  selfRef: MutableRefObject<HTMLDialogElement>;
}

const DEFAULT_AMOUNT: number = 10;

const CreatorTip: FC<Props> = ({ selfRef }: Props) => {
  const dispatch = useDispatch<Dispatch>();
  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT);

  function sendTip() {
    dispatch.app.toast({ type: 'success', message: 'sax' });
    selfRef.current.close();
  }

  return <>{ selfRef && <div className="modal-box w-11/12 flex flex-col gap-4">
    <form method="dialog">
      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>

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

    <p>Message</p>
    <textarea
      className="textarea textarea-bordered"
      placeholder="Write here your message"
    ></textarea>

    <button
      onClick={() => sendTip()}
      className="btn btn-success text-white"
    >Send a tip
    </button>
  </div> }</>;
};

export default CreatorTip;
