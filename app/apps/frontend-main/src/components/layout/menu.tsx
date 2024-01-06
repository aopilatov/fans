import { FC, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, store } from '@/stores';
import SVG from 'css.gg/icons/icons.svg';
import classnames from 'classnames';
import _ from 'lodash';

const MENU_ITEMS = [
  {
    key: 'home',
    name: 'Feed',
    icon: 'bolt',
    link: '',
  },

  {
    key: 'discover',
    name: 'Search',
    icon: 'search',
    link: '/creator',
  },

  {
    key: 'profile',
    name: 'Profile',
    icon: 'profile',
    link: '/profile',
  },
];

const LayoutMenu: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefix = _.get(window, 'prefix.value', '/');

  const [active, setActive] = useState<string>(null);
  const [menuBack, setMenuBack] = useState<boolean>(useSelector((state: RootState) => state.app.menuBack));

  const findActiveKey = (): string|null => {
    let index: number = MENU_ITEMS.findIndex(item => location.pathname.startsWith(`${prefix}${item.link}`.replaceAll('//', '/')) && item.link !== '');
    if (index === -1) {
      for (let i = 1; i < MENU_ITEMS.length; i++) {
        if (location.pathname.startsWith(MENU_ITEMS[i].link)) {
          index = i;
          break;
        }
      }

      if (index === -1 && location.pathname === '/') {
        index = 0;
      }
    }

    if (index === -1) return null;
    return MENU_ITEMS[index].key;
  };

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setMenuBack(store.getState().app.menuBack);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const activeKey = findActiveKey();
    if (!activeKey) {
      setActive(() => null);
    } else {
      setActive(() => activeKey);
    }
  }, [location]);

  return <ul className="menu menu-horizontal bg-base-200 rounded-box mt-6">
    { (!active || menuBack) && <li>
      <button onClick={ () => window.history.length > 2 ? window.history.go(-1) : navigate(`${prefix}/`) } className="tooltip" data-tio="Back">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
             stroke="currentColor">
          <use xlinkHref={SVG + `#gg-arrow-left`} />
        </svg>
      </button>
    </li>}

    { MENU_ITEMS.map(item => <li key={ item.key }>
      <Link
        className={ classnames({
          tooltip: true,
          active: active === item.key,
        }) }
        to={ item.link || '/' }
        data-tip={ item.name }
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
             stroke="currentColor">
          <use xlinkHref={ SVG + `#gg-${item.icon}` }/>
        </svg>
      </Link>
    </li>)}
  </ul>;
};

export default LayoutMenu;
