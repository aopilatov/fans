import { PropsWithChildren } from 'react';

const EmptyLayout = ({ children }: PropsWithChildren) => {
  return <div className="w-screen h-screen">
    <div>{children}</div>
  </div>;
};

export default EmptyLayout;
