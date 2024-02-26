import { PropsWithChildren } from 'react';
import LayoutMenu from '@/components/layout/menu.tsx';

const AppLayout = ({ children, whiteSpace = true }: PropsWithChildren & {whiteSpace?: boolean }) => {
// @ts-ignore
  import.meta.env.DEV && eruda.init();
  return <div className="w-full h-full">
    <div className="w-w-full h-full">{ children }</div>
    {whiteSpace && <div className="w-full h-16"></div>}
    <div className="fixed w-full py-2 bottom-0 left-0 flex justify-center z-50">
      <LayoutMenu />
    </div>
  </div>;
};

export default AppLayout;
