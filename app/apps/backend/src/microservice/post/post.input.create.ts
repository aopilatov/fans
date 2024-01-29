import { Process, Step } from '@/common/telegram';
import { Injectable } from '@nestjs/common';
import { PostInput } from './post.input';
import { UserDbModel } from '@/db/model';
import * as _ from 'lodash';

@Injectable()
export class PostInputCreate extends PostInput {
  protected processName = 'create';
  protected backCallback = { name: 'post_get_menu' };
  protected steps = ['post'];

  protected async onSuccess(user: UserDbModel, process: Process) {
    return `Post has been successfully added!`;
  }

  protected post(): Step {
    return {
      prop: 'media',
      rule: 'You could send text, or image(s), or video(s).',
      onStart: 'Send me your post.',
      onFail: 'Oh, something is wrong :( Send me another one, please!',
      validate: async (input: unknown): Promise<boolean | string> => {
        if (_.get(input, 'type') === 'file') {
          const mimeType: string = _.get(input, 'cmd.mime_type');
          if (mimeType.startsWith('image/')) {
            if (!['image/jpeg', 'image/png'].includes(mimeType)) {
              return 'Only jpeg and png images are allowed';
            }

            return true;
          }

          if (mimeType.startsWith('video/')) {
            if (!['video/mp4', 'video/quicktime'].includes(mimeType)) {
              return 'Only mp4 and mov videos are allowed';
            }

            return true;
          }

          return false;
        }

        if (_.get(input, 'type') === 'media_group') {
          console.log(input);
        }

        return true;
      },
    };
  }
}
