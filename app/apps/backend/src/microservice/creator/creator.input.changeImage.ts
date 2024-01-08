import { Process, Step } from '@/common/telegram';
import { Injectable } from '@nestjs/common';
import { CreatorInput } from './creator.input';
import { UserDbModel } from '@/db/model';
import * as _ from 'lodash';

@Injectable()
export class CreatorInputChangeImage extends CreatorInput {
  protected processName = 'profile_edit_image';
  protected backCallback = { name: 'creator_profile_menu' };
  protected steps = ['image'];

  protected async onSuccess(user: UserDbModel, process: Process) {
    const creator = await this.creatorDbRepository.findByUserAndUuid(user, process.context.creator);
    await this.creatorDbRepository.update({ ...creator, image: process.inputs.image });
    return `Image successfully updated!`;
  }

  protected image(): Step {
    return {
      prop: 'image',
      rule: 'It must have same width and height!',
      onStart: 'Ok! Send me the profile image!',
      onFail: 'Can not use this image :( Send me another one, please!',
      validate: async (input: unknown): Promise<boolean | string> => {
        if (_.get(input, 'type') === 'file') {
          if (!['image/jpeg', 'image/png'].includes(_.get(input, 'cmd.mime_type'))) {
            return 'Only jpeg and png images are allowed';
          }

          if (!_.has(input, 'cmd.thumb') || _.get(input, 'cmd.thumb.width') !== _.get(input, 'cmd.thumb.height')) {
            return 'Profile image must be squared (Width = Height).';
          }
        }

        if (_.get(input, 'type') === 'media') {
          if (!_.has(input, 'cmd[0]') || _.get(input, 'cmd[0].width') !== _.get(input, 'cmd[0].height')) {
            return 'Profile image must be squared (Width = Height).';
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
          if (!_.has(input, `cmd[${index}]`) || _.get(input, `cmd[${index}].width`) !== _.get(input, `cmd[${index}].height`)) {
            return 'Profile image must be squared (Width = Height).';
          }

          fileId = _.get(input, `cmd[${index}].file_id`);
        }

        if (!fileId) return;
        const url = await this.telegramService.botCreator.getFileLink(fileId);
        return this.mediaService.imageFromUrl(url);
      },
    };
  }
}
