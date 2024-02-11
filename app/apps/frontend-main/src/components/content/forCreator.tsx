import { FC } from 'react';
import { Post, PostType, Media } from '@fans/types';
import { DateTime } from 'luxon';
import SVG from 'css.gg/icons/icons.svg';
import classnames from 'classnames';
import _ from 'lodash';

import ContentMedia from '@/components/content/media.tsx';

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
  const media: Media[] = [ ...(data?.content?.video || []), ...(data?.content?.image || []) ];

  if (media?.length) {
    return <div className="w-full">
      {media.length === 1 && <ContentMedia data={media[0]} creator={true}/>}

      {media.length === 2 && <div className="grid grid-cols-2 gap-1">
        {media.map(item => <ContentMedia
          key={item.uuid}
          data={item}
          creator={true}
        />)}
      </div>}

      {media.length >= 3 && <div className="grid grid-cols-2 gap-1">
        <div className="col-span-2">
          <ContentMedia data={media[0]} creator={true}/>
        </div>

        {media.slice(1).map(item => <ContentMedia
          key={item.uuid}
          data={item}
          creator={true}
        />)}
      </div>}
    </div>;
  }

  return <></>;
};
