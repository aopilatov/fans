import { FC, useEffect, useState/*, useRef*/ } from 'react';
// import { useDispatch } from 'react-redux'
// import { Dispatch } from '@/stores';
import { Media, Post, PostType } from '@fans/types';
import SVG from 'css.gg/icons/icons.svg';
import classnames from 'classnames';

// import CreatorTip from '@/components/creator/tip.tsx';
import ContentCreator from '@/components/content/creator.tsx';
import ContentUnavailableSubscribe from '@/components/content/unavailableSubscribe.tsx';
import ContentUnavailableLevel from '@/components/content/unavailableLevel.tsx';
import ContentMedia from '@/components/content/media.tsx';
import api from '@/api';

interface Props {
  data: Post;
  showLinkToCreator?: boolean;
  subscribeCallback?: Function;
  zoomable?: boolean;
}

const ContentDefault: FC<Props> = ({ data, showLinkToCreator = true, subscribeCallback, zoomable }: Props) => {
  // const dispatch = useDispatch<Dispatch>();

  const isButtonsInactive = !data.subscription.isSubscribed || data.level > data.subscription.level;
  // const sendTipRef = useRef<HTMLDialogElement>(null);

  const [isLiked, setIsLiked] = useState<boolean>(data.isLiked);

  useEffect(() => {
    if (data) setIsLiked(() => data.isLiked);
  }, [data]);

  const like = () => {
    const newIsLiked = !isLiked;
    setIsLiked(() => newIsLiked);

    api.like.set(data.uuid).then((response: any) => {
      if (response?.postUuid === data.uuid && response.isLiked !== newIsLiked) {
        setIsLiked(() => response.isLiked);
      }
    });
  };

  // const exportPost = () => {
  //   api.post.export(data.creator.login, data.uuid).then((response: any) => {
  //     if (response?.success) dispatch.app.toast({ type: 'success', message: 'Post was sent to you as telegram message' });
  //   });
  // };

  return <div className="w-full shadow-lg rounded-lg bg-base-100 antialiased">
    <div className="px-4 pt-4">
      <ContentCreator creator={data.creator} datePost={data.date} showLinkToCreator={showLinkToCreator} />
    </div>

    {data.content?.text && <div className="px-4 pt-4 text-sm font-medium text-slate-100">{data.content.text}</div>}

    { data.type !== PostType.TEXT && <div className="pt-4">
      <ContentDefaultRender data={ data } subscribeCallback={ subscribeCallback } zoomable={ zoomable } />
    </div> }

    <div className="p-4 flex gap-4">
      <button
        onClick={ () => like() }
        className={classnames({
          'btn btn-sm btn-square btn-neutral': true,
          'bg-gradient-to-r from-purple-500 to-pink-500': isLiked && !isButtonsInactive,
          'text-white': true,
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

      {/*{ data.type !== PostType.TEXT && <button*/}
      {/*  onClick={ () => exportPost() }*/}
      {/*  className={classnames({*/}
      {/*    'btn btn-sm btn-neutral': true,*/}
      {/*    'btn-disabled': isButtonsInactive,*/}
      {/*  })}>*/}
      {/*    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"*/}
      {/*         stroke="currentColor">*/}
      {/*      <use xlinkHref={SVG + `#gg-export`}/>*/}
      {/*    </svg>*/}
      {/*</button> }*/}

      {/*{!isButtonsInactive && <>*/}
      {/*  <button*/}
      {/*    onClick={() => sendTipRef.current.showModal()}*/}
      {/*    className={classnames({*/}
      {/*      'btn btn-sm btn-neutral': true,*/}
      {/*    })}*/}
      {/*  >*/}
      {/*    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"*/}
      {/*         stroke="currentColor">*/}
      {/*      <use xlinkHref={SVG + `#gg-dollar`}/>*/}
      {/*    </svg>*/}
      {/*    Send tip*/}
      {/*  </button>*/}

      {/*  <dialog ref={ sendTipRef } className="modal">*/}
      {/*    <CreatorTip selfRef={ sendTipRef } />*/}
      {/*    <form method="dialog" className="modal-backdrop">*/}
      {/*      <button>close</button>*/}
      {/*    </form>*/}
      {/*  </dialog>*/}
      {/*</>}*/}
    </div>
  </div>;
};

export default ContentDefault;

interface PropsRender {
  data: Post;
  subscribeCallback?: Function;
  zoomable?: boolean;
}

const ContentDefaultRender: FC<PropsRender> = ({ data, subscribeCallback, zoomable }: PropsRender) => {
  if (!data.subscription.isSubscribed) {
    return <ContentUnavailableSubscribe data={data} subscribeCallback={subscribeCallback} />;
  }

  if (data.level > data.subscription.level) {
    return <ContentUnavailableLevel data={data}/>;
  }

  const media: Media[] = [ ...(data?.content?.video || []), ...(data?.content?.image || []) ];

  if (media) {
    return <div className="w-full">
      {media.length === 1 && <ContentMedia data={media[0]} zoomable={ zoomable }/>}

      {media.length === 2 && <div className="grid grid-cols-2 gap-1">
        {media.map(item => <ContentMedia
          key={item.uuid}
          data={item}
          zoomable={ zoomable }
        />)}
      </div>}

      {media.length >= 3 && <div className="grid grid-cols-2 gap-1">
        <div className="col-span-2">
          <ContentMedia data={media[0]} zoomable={ zoomable }/>
        </div>

        {media.slice(1).map(item => <ContentMedia
          key={item.uuid}
          data={item}
          zoomable={ zoomable }
        />)}
      </div>}
    </div>;
  }

  return <></>;
};
