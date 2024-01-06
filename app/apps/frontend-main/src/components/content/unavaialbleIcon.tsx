import { FC } from 'react';
import { PostType } from '@fans/types';
import SVG from 'css.gg/icons/icons.svg';

interface Props {
  type: PostType;
}

const ContentUnavailableIcon: FC<Props> = ({ type }: Props) => {
  return <div className="flex gap-4 items-center">
    {type === PostType.IMAGE && <>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24"
           stroke="currentColor">
        <use xlinkHref={SVG + `#gg-image`}/>
      </svg>
      Photo content
    </>}

    {type === PostType.VIDEO && <>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24"
           stroke="currentColor">
        <use xlinkHref={SVG + `#gg-camera`}/>
        Video content
      </svg>
      Video content
    </>}
  </div>;
};

export default ContentUnavailableIcon;

