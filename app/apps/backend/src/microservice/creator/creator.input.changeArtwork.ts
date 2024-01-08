import { Process, Step } from '@/common/telegram';
import { Injectable } from '@nestjs/common';
import { CreatorInput } from './creator.input';
import { UserDbModel } from '@/db/model';
import * as _ from 'lodash';

@Injectable()
export class CreatorInputChangeArtwork extends CreatorInput {
  protected processName = 'profile_edit_artwork';
  protected backCallback = { name: 'creator_profile_menu' };
  protected steps = ['artwork'];

  protected async onSuccess(user: UserDbModel, process: Process) {
    const creator = await this.creatorDbRepository.findByUserAndUuid(user, process.context.creator);
    await this.creatorDbRepository.update({ ...creator, artwork: process.inputs.artwork });
    return `Banner successfully updated!`;
  }

  protected artwork(): Step {
    return {
      prop: 'artwork',
      rule: 'Width must be 562px, height must be 180px',
      onStart: 'Ok! Send me the banner image!',
      onFail: 'Can not use this image :( Send me another one, please!',
      validate: async (input: unknown): Promise<boolean | string> => {
        if (_.get(input, 'type') === 'file') {
          if (!['image/jpeg', 'image/png'].includes(_.get(input, 'cmd.mime_type'))) {
            return 'Only jpeg and png images are allowed';
          }
        }

        return true;
      },
      transform: async (input: unknown): Promise<string> => {
        let fileId!: string;

        if (_.get(input, 'type') === 'file') {
          fileId = _.get(input, 'cmd.file_id');
        }

        if (_.get(input, 'type') === 'media') {
          const index = _.get(input, 'cmd.length', 1) - 1;
          fileId = _.get(input, `cmd[${index}].file_id`);
        }

        if (!fileId) return;
        const url = await this.telegramService.botCreator.getFileLink(fileId);
        return this.mediaService.imageFromUrl(url, false, false, (image) => {
          if (image.getWidth() !== 562 || image.getHeight() !== 180) {
            throw new Error(`Your banner size is ${image.getWidth()}px x ${image.getHeight()}px`);
          }
        });
      },
    };
  }
}
