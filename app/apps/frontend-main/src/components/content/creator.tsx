import { FC } from 'react';
import { DateTime } from 'luxon';
import { Link } from 'react-router-dom';
import SVG from 'css.gg/icons/icons.svg';
import _ from 'lodash';

interface Props {
  creator: Record<string, any>;
  datePost: string;
  showLinkToCreator?: boolean;
}

const ContentCreator: FC<Props> = ({ creator, datePost, showLinkToCreator = true }: Props) => {
  const prefix = _.get(window, 'prefix.value', '');

  return <>{ creator && <div className="w-full flex justify-between">
    { showLinkToCreator
      ? <Link to={ `${prefix}/creator/${creator.login}` }>{ <ContentCreatorData creator={ creator } /> }</Link>
      : <ContentCreatorData creator={ creator } />
    }

    <div className="text-xs font-light text-slate-300">{ DateTime.fromISO(datePost).toFormat('LLL dd') }</div>
  </div> }</>;
};

export default ContentCreator;

interface PropsData {
  creator: Record<string, any>;
}

const ContentCreatorData: FC<PropsData> = ({ creator }: PropsData) => {
  const cdn = _.get(window, 'cdn.value', '');

  return <>{ creator && <div className="flex items-center gap-4">
    <div className="avatar">
      <div className="rounded-full w-12">
        <img src={ creator?.image?.length > 0 ? `${cdn}${creator.image.find(item => item.width === 100)}` : '/creator-noimg.png' } />
      </div>
    </div>
    <div>
      <div className="flex gap-2 items-center text-sm font-medium text-slate-100">
        {creator.name}
        {creator.isVerified &&
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
            <use xlinkHref={SVG + `#gg-check-o`}/>
          </svg>}
      </div>
      <div className="text-xs font-light text-slate-300">@{creator.login}</div>
    </div>
  </div> }</>;
};
