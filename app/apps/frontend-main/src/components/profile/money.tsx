import { FC } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';

interface Props {
  balances: Record<string, any>[];
}

const ProfileMoney: FC<Props> = ({ balances }: Props) => {
  const prefix = _.get(window, 'prefix.value', '');

  return <div className="stats shadow-2xl text-neutral-200 bg-gradient-to-r from-violet-500 to-fuchsia-500">
    <div className="stat">
      <div className="stat-title text-neutral-200">Account balance</div>
      {(balances || []).map(item => <div key={item?.currency} className="stat-value">{item?.amount || 0} {item?.currency || 'USDT'}</div>)}
      <div className="stat-actions">
        <Link
          to={`${prefix}/topup`}
          role="button"
          className="btn btn-md btn-block"
        >Add funds</Link>
      </div>
    </div>
  </div>;
};

export default ProfileMoney;
