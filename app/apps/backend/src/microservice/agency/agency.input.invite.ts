import { Process, Step } from '@/common/telegram';
import { Injectable } from '@nestjs/common';
import { AgencyInput } from './agency.input';
import { UserDbModel } from '@/db/model';
import { length, matches } from 'class-validator';

@Injectable()
export class AgencyInputInvite extends AgencyInput {
  protected processName = 'invite';
  protected backCallback = { name: 'agency_profile_menu' };
  protected steps = ['login'];

  protected async onSuccess(user: UserDbModel, process: Process) {
    const agency = await this.agencyService.find(user, process.context.agency);
    if (agency) {
      const creator = await this.creatorService.getByLogin(process.inputs.login);
      const isExisting = await this.agencyService.checkInvite(agency, creator);
      if (isExisting) {
        return 'Invite had been sent before!';
      }

      await this.agencyService.addInvite(agency, creator);
    }

    return `Invite was sent!`;
  }

  protected login(): Step {
    return {
      prop: 'login',
      rule: 'Nickname could not have less than 2 characters, and more than 20. No special characters and spaces, but \'-\', \'_\', and \'.\'',
      onStart: 'Ok! Send me the nickname of the creator',
      onFail: 'Can not search by this nickname :( Send me another one please!',
      transform: (input: string) => input.toLowerCase(),
      validate: async (input: string): Promise<boolean | string> => {
        input = input.toLowerCase();

        const lengthCheck = length(input, 2, 20);
        if (!lengthCheck) return false;

        const charsCheck = matches(input, RegExp('^[a-z0-9-_.]+$'));
        if (!charsCheck) return 'Value contains not allowed character(s)';

        if (input.startsWith('.') || input.endsWith('.')) {
          return 'Value can not start or finish with \'.\'';
        }

        const creator = await this.creatorService.getByLogin(input);
        if (!creator) return `Creator with nickname '${input}' is not found.`;

        return true;
      },
    };
  }
}
