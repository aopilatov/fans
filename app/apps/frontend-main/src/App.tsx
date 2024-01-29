import { FC, Suspense, useEffect, useState } from 'react';
import { useRoutes } from 'react-router-dom';
import { RootState, store } from '@/stores';
import { Toast } from '@/stores/app.model';
import { useSelector } from 'react-redux';
import routes from '~react-pages';
import classnames from 'classnames';

import '@/assets/scss/_main.scss';

const App: FC = () => {
  const [toasts, setToasts] = useState<Toast[]>(useSelector((state: RootState) => state.app.toasts));
  const [toastsState, setToastsState] = useState<string | null>(useSelector((state: RootState) => state.app._toastState));

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const appState = store.getState().app;
      setToasts(appState.toasts);
      setToastsState(appState._toastState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <Suspense fallback={<div className="w-screen h-screen flex justify-center items-center">
    <span className="loading loading-spinner text-info"></span>
  </div>}>
    {toasts?.length > 0 && <div className="fixed top-0 left-0 z-50" key={ toastsState }>
      <div className="toast toast-top toast-center min-w-full whitespace-normal">
        { toasts.map(toast => <div
          key={toast.uuid}
          className={classnames({
            alert: true,
            'alert-info': toast.type === 'info',
            'alert-success': toast.type === 'success',
            'alert-error': toast.type === 'error',
          })}
        >
          <span>{ toast.message }</span>
        </div>) }
      </div>
    </div> }

    {useRoutes(routes)}
  </Suspense>;
};

export default App;
