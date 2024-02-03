import { FC } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';

interface Props {
  subscriptions: Record<string, any>;
}

const ProfileStats: FC<Props> = ({ subscriptions }: Props) => {
  const prefix = _.get(window, 'prefix.value', '');
  return <div className="stats shadow-2xl text-neutral-200 bg-gradient-to-r from-cyan-500 to-blue-500">
    <div className="stat">
      <div className="stat-title text-neutral-200">Subscriptions</div>
      <div className="stat-value">{ subscriptions?.count || 0 } authors</div>
      <div className="stat-actions">
        <Link to={ `${prefix}/subscriptions` }>
          <button className="btn btn-md btn-block">Manage</button>
        </Link>
      </div>
    </div>
  </div>;
};

export default ProfileStats;
