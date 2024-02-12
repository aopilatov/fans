import { PropsWithChildren } from 'react';
import LayoutMenu from '@/components/layout/menu.tsx';

const AppLayout = ({ children }: PropsWithChildren) => {
  return <div className="w-full h-full">
    <div className="w-full h-full">{ children }</div>
    <div className="w-screen h-16"></div>
    <div className="fixed w-screen py-2 bottom-0 left-0 flex justify-center z-50">
      <LayoutMenu />
    </div>
  </div>;
};

export default AppLayout;
