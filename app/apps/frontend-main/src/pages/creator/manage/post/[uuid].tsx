import { FC, useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom';
import { Dispatch, store } from '@/stores';
import { jwtDecode } from 'jwt-decode';
import * as FormData from 'form-data';
import ReactPlayer from 'react-player';
import api from '@/api';
import classnames from 'classnames';
import SVG from 'css.gg/icons/icons.svg';
import _ from 'lodash';

const PageCreatorManagePostNew: FC = () => {
  const prefix = _.get(window, 'prefix.value', '');
  const { uuid } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();
  const cdn = _.get(window, 'cdn.value', '');

  const inputImagesRef = useRef<HTMLInputElement>(null);
  const inputVideosRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Record<string, any>>(null);
  const [postUuid, setPostUuid] = useState<string>('');
  const [level, setLevel] = useState<number>(-1);
  const [text, setText] = useState<string>('');
  const [images, setImages] = useState<Record<string, any>[]>([]);
  const [videos, setVideos] = useState<Record<string, any>[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);
  const [isUploadingVideos, setIsUploadingVideos] = useState<boolean>(false);
  const [wasPublished, setWasPublished] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(() => true);
    Promise.all([loadProfile, loadPost].map(item => item()))
      .then(() => {
        setIsLoading(() => false);
      });
  }, [uuid]);

  const loadProfile = async () => {
    const encodedToken = store.getState().auth.token;
    const decodedToken = jwtDecode<any>(encodedToken);

    api.creator.get(decodedToken.login)
      .then(data => {
        setProfile(() => data);
      });
  };

  const loadPost = async () => {
    api.post.getFull(uuid)
      .then((data: any) => {
        setPostUuid(() => data.uuid);
        setLevel(() => data.level);
        setText(() => data.content.text);
        setImages(() => data.content.image.map(item => item[0]));
        setVideos(() => data.content.video.map(item => item[0]));
      });
  };

  const publish = async () => {
    if (level < 1) {
      dispatch.app.toast({ type: 'error', message: 'You have to select a subscription plan' });
      return;
    }

    if (!text && !images?.length && !videos?.length) {
      dispatch.app.toast({ type: 'error', message: 'At least text, or one images or one video should be added' });
      return;
    }

    setIsLoading(() => true);
    api.post.edit(postUuid, level, text, images.map(item => item.mediaUuid), videos.map(item => item.mediaUuid))
      .then(() => {
        setWasPublished(() => true);
        dispatch.app.toast({ type: 'success', message: 'Successfully saved' });
        navigate(`${prefix}/creator/manage/post`);
      })
      .finally(() => {
        setIsLoading(() => false);
      });
  };

  const removeImage = (mediaUuid: string) => {
    let current = _.clone<Record<string, any>[]>(images);
    current = current.filter(item => item.mediaUuid !== mediaUuid);
    setImages(() => current);
  };

  const removeVideo = (mediaUuid: string) => {
    let current = _.clone<Record<string, any>[]>(videos);
    current = current.filter(item => item.mediaUuid !== mediaUuid);
    setVideos(() => current);
  };

  const uploadImages = async (files: FileList) => {
    if (files?.length) {
      setIsUploadingImages(() => true);

      const payload = new FormData();
      for (const file of files) {
        payload.append('image', file, file.name);
      }

      api.media.image(payload)
        .then(data => {
          const current = _.clone<Record<string, any>[]>(images);
          current.push(..._.get(data, 'images', []));
          setImages(() => current);
        })
        .finally(() => {
          inputImagesRef.current.value = null;
          setIsUploadingImages(() => false);
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

      api.media.video(payload)
        .then(data => {
          const current = _.clone<Record<string, any>[]>(videos);
          current.push(..._.get(data, 'videos', []));
          setVideos(() => current);
        })
        .finally(() => {
          inputVideosRef.current.value = null;
          setIsUploadingVideos(() => false);
        });
    }
  };

  return <div className="p-4 flex flex-col gap-4">
    { (isLoading || !profile) && <div className="w-full flex justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div> }

    { !isLoading && profile && wasPublished && <div className="w-full flex justify-center">Post was successfully published</div>}

    {!isLoading && profile && !wasPublished && <>
      <div className="divider">For subscribers with plan</div>

      <label className="form-control">
        <select
          value={level}
          onChange={(val) => setLevel(() => parseInt(val.target.value))}
          className="select select-bordered w-full"
        >
          <option value={-1} disabled>Minimum subscription plan to see the post</option>
          {profile.levels.map(item => <option
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
              "file-input join-item w-full": true,
              disabled: isUploadingImages,
            })}
            placeholder="Select images to add them"
            onChange={(val) => uploadImages(val.target.files)}
          />
        </div>
      </label>

      {images?.length > 0 && <div className="carousel carousel-center max-w-md p-4 space-x-4 bg-neutral rounded-box">
        {images.map((item, index) => <div
          key={_.get(item, 'mediaUuid')}
          className="carousel-item flex flex-col gap-4 items-center justify-between"
        >
          {index + 1} / {images.length}
          <img
            src={`${cdn}${item.file}`}
            className="rounded-box max-w-80"
          />

          <button
            onClick={() => removeImage(item.mediaUuid)}
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
          key={_.get(item, 'mediaUuid')}
          className="carousel-item flex flex-col gap-4 items-center justify-between"
        >
          {index + 1} / {videos.length}
          <ReactPlayer
            url={`${cdn}${item.file}`}
            className="rounded-box max-w-80"
            muted={true}
            loop={false}
            playing={false}
            controls={true}
          />

          <button
            onClick={() => removeVideo(item.mediaUuid)}
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
        className="btn btn-block border-0 bg-gradient-to-r from-sky-500 to-indigo-500 text-neutral-100"
        onClick={() => publish()}
      >Save
      </button>

      <button
        className="btn btn-block border-0 text-neutral-100"
        onClick={() => navigate(`${prefix}/creator/manage/post`)}
      >Back</button>
    </>}
  </div>;
};

export default PageCreatorManagePostNew;
