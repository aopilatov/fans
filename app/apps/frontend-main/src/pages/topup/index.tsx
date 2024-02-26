import { FC /* useEffect, useState*/ } from 'react';
// import { store } from '@/stores';
// import classnames from 'classnames';

import AppLayout from '@/layouts/app.layout.tsx';
// import BalanceTopUpDeposit from '@/components/balance/topUpDeposit.tsx';
// import BalanceTopUpCharge from '@/components/balance/topUpCharge.tsx';

// type Tabs = 'deposit' | 'charge';

const PageTopUp: FC = () => {
  // const [activeTab, setActiveTab] = useState<Tabs>('deposit');
  //
  // useEffect(() => {
  //   store.dispatch({ type: 'app/setMenuBack', payload: false });
  // }, []);

  return <AppLayout>
    <div className="p-4 flex flex-col gap-4 items-center">
      Coming next week
      {/*<div role="tablist" className="tabs tabs-boxed">*/}
      {/*  <a*/}
      {/*    role="tab"*/}
      {/*    onClick={() => setActiveTab('deposit')}*/}
      {/*    className={classnames({ tab: true, 'tab-active': activeTab === 'deposit' })}*/}
      {/*  >Deposit</a>*/}

      {/*  <a*/}
      {/*    role="tab"*/}
      {/*    onClick={() => setActiveTab('charge')}*/}
      {/*    className={classnames({ tab: true, 'tab-active': activeTab === 'charge' })}*/}
      {/*  >Buy crypto</a>*/}
      {/*</div>*/}

      {/*{ activeTab === 'deposit' && <BalanceTopUpDeposit /> }*/}
      {/*{ activeTab === 'charge' && <BalanceTopUpCharge /> }*/}
    </div>
  </AppLayout>;
};

export default PageTopUp;
