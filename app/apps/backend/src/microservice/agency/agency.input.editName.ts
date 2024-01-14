import { Process, Step } from '@/common/telegram';
import { Injectable } from '@nestjs/common';
import { AgencyInput } from './agency.input';
import { UserDbModel } from '@/db/model';
import { length } from 'class-validator';

@Injectable()
export class AgencyInputEditName extends AgencyInput {
  protected processName = 'edit_name';
  protected backCallback = { name: 'agency_profile_menu' };
  protected steps = ['name'];

  protected async onSuccess(user: UserDbModel, process: Process) {
    const agency = await this.agencyService.find(user, process.context.agency);
    if (agency) await this.agencyService.edit({ ...agency, name: process.inputs.name });
    return `Name has been successfully changed!`;
  }

  protected name(): Step {
    return {
      prop: 'name',
      rule: 'Name could not have less than 2 characters, and more than 20.',
      onStart: 'Ok! Send me the agency name.',
      onFail: 'Can not use this name :( Send me another preferred name, please!',
      validate: async (input: string): Promise<boolean | string> => {
        return length(input, 2, 20);
      },
    };
  }
}
