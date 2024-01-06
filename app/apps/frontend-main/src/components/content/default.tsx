import { FC, useRef } from 'react';
import { Post, PostType } from '@fans/types';
import SVG from 'css.gg/icons/icons.svg';
import classnames from 'classnames';

import CreatorTip from '@/components/creator/tip.tsx';
import ContentCreator from '@/components/content/creator.tsx';
import ContentUnavailableSubscribe from '@/components/content/unavailableSubscribe.tsx';
import ContentUnavailableLevel from '@/components/content/unavailableLevel.tsx';
import ContentPhoto from '@/components/content/photo.tsx';
import ContentVideo from '@/components/content/video.tsx';

interface Props {
  data: Post;
  showLinkToCreator?: boolean;
}

const ContentDefault: FC<Props> = ({ data, showLinkToCreator = true }: Props) => {
  const isButtonsInactive = !data.subscription.isSubscribed || data.level > data.subscription.level;
  const sendTipRef = useRef<HTMLDialogElement>(null);

  return <div className="w-full shadow-lg rounded-lg bg-base-100 antialiased">
    <div className="px-4 pt-4">
      <ContentCreator creator={data.creator} datePost={data.date} showLinkToCreator={showLinkToCreator} />
    </div>

    {data.content?.text && <div className="px-4 pt-4 text-sm font-medium text-slate-100">{data.content.text}</div>}

    { data.type !== PostType.TEXT && <div className="pt-4">
      <ContentDefaultRender data={ data } />
    </div> }

    <div className="p-4 flex gap-4">
      <button
        className={classnames({
          'btn btn-sm btn-square btn-neutral': true,
          'bg-gradient-to-r from-purple-500 to-pink-500': data.isLiked,
          'text-white': data.isLiked,
          'btn-disabled': isButtonsInactive,
        })}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none" viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <use xlinkHref={SVG + `#gg-heart`}/>
        </svg>
      </button>

      { data.type !== PostType.TEXT && <button className={classnames({
        'btn btn-sm btn-neutral': true,
        'btn-disabled': isButtonsInactive,
      })}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
             stroke="currentColor">
          <use xlinkHref={SVG + `#gg-export`}/>
        </svg>
      </button> }

      {!isButtonsInactive && <>
        <button
          onClick={() => sendTipRef.current.showModal()}
          className={classnames({
            'btn btn-sm btn-neutral': true,
          })}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <use xlinkHref={SVG + `#gg-dollar`}/>
          </svg>
          Send tip
        </button>

        <dialog ref={ sendTipRef } className="modal">
          <CreatorTip selfRef={ sendTipRef } />
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </>}
    </div>
  </div>;
};

export default ContentDefault;

interface PropsRender {
  data: Post;
}

const ContentDefaultRender: FC<PropsRender> = ({ data }: PropsRender) => {
  if (!data.subscription.isSubscribed) {
    return <ContentUnavailableSubscribe data={data}/>;
  }

  if (data.level > data.subscription.level) {
    return <ContentUnavailableLevel data={data}/>;
  }

  switch (data.type) {
    case PostType.IMAGE:
      return <ContentPhoto data={data}/>
    case PostType.VIDEO:
      return <ContentVideo data={data}/>
    default:
      return <></>;
  }
};
