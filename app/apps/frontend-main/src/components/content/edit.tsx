import { FC, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dispatch, store } from '@/stores';
import { Media } from '@fans/types';
import { jwtDecode } from 'jwt-decode';
import _ from 'lodash';
import FormData from 'form-data';
import classnames from 'classnames';
import SVG from 'css.gg/icons/icons.svg';
import ReactPlayer from 'react-player';
import { useCreatorGet } from '@/api/queries/creator';
import { useMediaImage, useMediaVideo } from '@/api/queries/media';
import { usePostCreate, usePostEdit, usePostGetFull } from '@/api/queries/post';

interface Props {
  uuid?: string;
}

const ContentEdit: FC<Props> = ({ uuid }: Props) => {
  const prefix = _.get(window, 'prefix.value', '');

  const inputImagesRef = useRef<HTMLInputElement>(null);
  const inputVideosRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();

  const [postUuid, setPostUuid] = useState<string>('');
  const [level, setLevel] = useState<number>(-1);
  const [text, setText] = useState<string>('');
  const [images, setImages] = useState<Media[]>([]);
  const [videos, setVideos] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);
  const [isUploadingVideos, setIsUploadingVideos] = useState<boolean>(false);
  const [wasPublished, setWasPublished] = useState<boolean>(false);

  const encodedToken = store.getState().auth.token;
  const decodedToken = jwtDecode<any>(encodedToken);
  const login = decodedToken?.login;
  const { data: creator, isLoading: isCreatorLoading } = useCreatorGet(login);
  const { data, isLoading: isGetFullLoading } = usePostGetFull(uuid);
  const videoMutation = useMediaVideo();
  const imageMutation = useMediaImage();
  const createMutation = usePostCreate();
  const editMutation = usePostEdit();

  useEffect(() => {
    if(isCreatorLoading || isGetFullLoading){
      setIsLoading(() => true);
    } else setIsLoading(() => false);
  }, [isCreatorLoading, isGetFullLoading]);

  useEffect(() => {
    if(data){
      setPostUuid(() => data?.uuid);
      setLevel(() => data?.level);
      setText(() => data?.content.text);
      setImages(() => data?.content?.image);
      setVideos(() => data?.content?.video);
    }
  }, [data]);

  const publish = async () => {
    if (level < 1) {
      dispatch.app.toast({ type: 'error', message: 'You have to select a subscription plan' });
      return;
    }

    if (!text && !Object.keys(images)?.length && !Object.keys(videos)?.length) {
      dispatch.app.toast({ type: 'error', message: 'At least text, or one images or one video should be added' });
      return;
    }

    setIsLoading(() => true);
    (!uuid
        ? createMutation.mutate({
          data: {
            level,
            text,
            images: images.map(item => item.uuid),
            videos: videos.map(item => item.uuid),
          },
          onSuccess: () => setWasPublished(() => true),
          onSettled: () => setIsLoading(() => false),
        })
        : editMutation.mutate({
          data: {
            uuid: postUuid,
            level,
            text,
            images: images.map(item => item.uuid),
            videos: videos.map(item => item.uuid),
          },
          onSuccess: () => setWasPublished(() => true),
          onSettled: () => setIsLoading(() => false),
        })
    );
  };

  const removeImage = (mediaUuid: string) => {
    let current = _.clone<Media[]>(images);
    current = current.filter(item => item.uuid !== mediaUuid);
    setImages(() => current);
  };

  const removeVideo = (mediaUuid: string) => {
    let current = _.clone<Media[]>(videos);
    current = current.filter(item => item.uuid !== mediaUuid);
    setVideos(() => current);
  };

  const uploadImages = async (files: FileList) => {
    if (files?.length) {
      setIsUploadingImages(() => true);

      const payload = new FormData();
      for (const file of files) {
        payload.append('image', file, file.name);
      }
      imageMutation.mutate({
        data: payload,
        onSuccess: setImages,
        onSettled: () => {
          inputImagesRef.current.value = null;
          setIsUploadingImages(() => false);
        },
        images,
      });
    }
  };

  const uploadVideos = async (files: FileList) => {
    if (files?.length) {
      setIsUploadingVideos(() => true);

      const payload = new FormData();
      for (const file of files) {
        payload.append('video', file, file.name);
      }
      videoMutation.mutate({
        data: payload,
        onSuccess: setVideos,
        onSettled: () => {
          inputVideosRef.current.value = null;
          setIsUploadingVideos(() => false);
        },
        videos,
      });
    }
  };

  return <div className="p-4 flex flex-col gap-4">
    { (isLoading || !creator) && <div className="w-full flex justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div> }

    { !isLoading && creator && wasPublished && <div className="w-full flex justify-center">Post was successfully published</div> }

    { !isLoading && creator && !wasPublished && <>
      <div className="divider">For subscribers with plan</div>

      <label className="form-control">
        <select
          value={level}
          onChange={(val) => setLevel(() => parseInt(val.target.value))}
          className="select select-bordered w-full"
        >
          <option value={-1} disabled>Minimum subscription plan to see the post</option>
          {creator.levels.map(item => <option
            key={item.level}
            value={item.level}
          >{item.price > 0 ? `${item.price} USDT` : 'Free'}</option>)}
        </select>
      </label>

      <div className="divider">Add text. It's not required</div>

      <label className="form-control">
        <textarea
          className="textarea textarea-bordered h-48"
          placeholder="You could write your message here"
          value={text}
          onChange={(val) => setText(() => val.target.value)}
        ></textarea>
      </label>

      <div className="divider">Images. They are not required</div>

      {isUploadingImages && <div className="w-full flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>}

      <label className="form-control">
        <div className="label">
          <span className="label-text-alt">Select 1-20 files.</span>
        </div>

        <div className="join">
          <input
            ref={inputImagesRef}
            type="file"
            multiple={true}
            max={20}
            disabled={isUploadingImages}
            accept="image/png, image/jpeg"
            className={classnames({
              'file-input join-item w-full': true,
              disabled: isUploadingImages,
            })}
            placeholder="Select images to add them"
            onChange={(val) => uploadImages(val.target.files)}
          />
        </div>
      </label>

      {images.length > 0 && <div className="carousel carousel-center max-w-md p-4 space-x-4 bg-neutral rounded-box">
        {images.map((item, index) => <div
          key={item.uuid}
          className="carousel-item flex flex-col gap-4 items-center justify-between"
        >
          {index + 1} / {images.length}

          <img
            src={item.none200}
            className="rounded-box max-w-80"
            alt={ item.uuid }
          />

          <button
            onClick={() => removeImage(item.uuid)}
            className="btn btn-square btn-outline btn-error"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <use xlinkHref={SVG + `#gg-trash`}/>
            </svg>
          </button>
        </div>)}
      </div>}

      <div className="divider">Videos. They are not required</div>

      {isUploadingVideos && <div className="w-full flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>}

      <label className="form-control">
        <div className="label">
          <span className="label-text-alt">Select 1-20 files.</span>
        </div>

        <div className="join">
          <input
            ref={inputVideosRef}
            type="file"
            multiple={true}
            max={20}
            disabled={isUploadingVideos}
            accept="video/mp4, video/quicktime"
            className={classnames({
              'file-input join-item w-full': true,
              disabled: isUploadingVideos,
            })}
            placeholder="Select videos to add them"
            onChange={(val) => uploadVideos(val.target.files)}
          />
        </div>
      </label>

      {videos.length > 0 && <div className="carousel carousel-center max-w-md p-4 space-x-4 bg-neutral rounded-box">
        {videos.map((item, index) => <div
          key={item.uuid}
          className="carousel-item flex flex-col gap-4 items-center justify-between"
        >
          {index + 1} / {videos.length}

          <ReactPlayer
            url={item.origin}
            light={item.none200}
            className="rounded-box max-w-80"
            muted={true}
            loop={false}
            playing={false}
            controls={true}
          />

          <button
            onClick={() => removeVideo(item.uuid)}
            className="btn btn-square btn-outline btn-error"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <use xlinkHref={SVG + `#gg-trash`}/>
            </svg>
          </button>
        </div>)}
      </div>}

      <div className="divider">And</div>

      <button
        className={`btn btn-block border-0 text-neutral-100
        ${(isUploadingImages || isUploadingVideos) ? 'bg-slate-300' : 'bg-gradient-to-r from-sky-500 to-indigo-500'}`}
        onClick={() => publish()}
        disabled={(isUploadingImages || isUploadingVideos)}
      >Save
      </button>

      <button
        className="btn btn-block border-0 text-neutral-100"
        onClick={() => navigate(`${prefix}/creator/manage/post`)}
      >Back
      </button>
    </>}
  </div>;
};

export default ContentEdit;
