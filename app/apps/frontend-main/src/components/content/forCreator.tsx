import { FC } from 'react';
import { Post, PostType } from '@fans/types';
import { DateTime } from 'luxon';
import SVG from 'css.gg/icons/icons.svg';
import classnames from 'classnames';
import _ from 'lodash';

import ContentPhoto from '@/components/content/photo.tsx';
import ContentVideo from '@/components/content/video.tsx';

interface Props {
  data: Post;
  showLinkToCreator?: boolean;
}

const ContentForCreator: FC<Props> = ({ data }: Props) => {
  const prefix = _.get(window, 'prefix.value', '');

  return <div className="w-full shadow-lg rounded-lg bg-base-100 antialiased">
    <div className="px-4 pt-4 flex items-center gap-2">
      <a
        href={`${prefix}/creator/manage/post/${data.uuid}`}
        className={classnames({
          'btn btn-sm btn-square btn-neutral': true,
          'bg-gradient-to-r from-purple-500 to-pink-500': true,
          'text-white': true,
        })}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none" viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <use xlinkHref={SVG + `#gg-pen`}/>
        </svg>
      </a>

      <a href={`${prefix}/creator/manage/post/${data.uuid}`}>Edit post</a>
    </div>

    {data.content?.text && <div className="px-4 pt-4 text-sm font-medium text-slate-100">{data.content.text}</div>}

    {data.type !== PostType.TEXT && <div className="pt-4">
      <ContentDefaultRender data={data}/>
    </div>}

    <div className="p-4 flex gap-4">
      <div className="flex gap-2 items-center text-sm font-medium text-slate-100">
        Post added on {DateTime.fromISO(data.date).toFormat('LLL dd \'at\' HH:mm')}
      </div>
    </div>
  </div>;
};

export default ContentForCreator;

interface PropsRender {
  data: Post;
}

const ContentDefaultRender: FC<PropsRender> = ({ data }: PropsRender) => {
  switch (data.type) {
    case PostType.IMAGE:
      return <ContentPhoto data={data}/>
    case PostType.VIDEO:
      return <ContentVideo data={data}/>
    default:
      return <></>;
  }
};
