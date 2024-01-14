import { OnQueueActive, OnQueueError, OnQueueStalled, Process, Processor } from '@nestjs/bull';
import { forwardRef, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreatorService } from '@/microservice/creator';
import { TelegramService } from '@/microservice/telegram';
import { UserService } from '@/microservice/user';
import { Job } from 'bull';
import { AgencyDbModel, UserDbModel } from '@/db/model';
import { AgencyDbRepository } from '@/db/repository';
import { AgencyService } from './agency.service';
import { AgencyAdminService } from '@/microservice/agencyAdmin';
import { AgencyInviteService } from '@/microservice/agencyInvite';
import * as _ from 'lodash';

import { AgencyInputCreate } from './agency.input.create';
import { AgencyInputEditName } from './agency.input.editName';
import { AgencyInputInvite } from './agency.input.invite';

@Processor('agency')
export class AgencyProcessor {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(forwardRef(() => CreatorService)) private readonly creatorService: CreatorService,
    private readonly agencyDbRepository: AgencyDbRepository,
    private readonly telegramService: TelegramService,
    private readonly userService: UserService,
    private readonly agencyService: AgencyService,
    private readonly agencyAdminService: AgencyAdminService,
    private readonly agencyInviteService: AgencyInviteService,

    private readonly agencyInputCreate: AgencyInputCreate,
    private readonly agencyInputEditName: AgencyInputEditName,
    private readonly agencyInputInvite: AgencyInputInvite,
  ) {}

  private async cleanAllProcesses(user: UserDbModel): Promise<void> {
    const keys = await this.cacheService.store.keys(`input:*:${user.uuid}`);
    for (const key of keys) {
      await this.cacheService.del(key);
    }
  }

  @OnQueueStalled()
  @OnQueueError()
  public async OnQueueError(job: Job): Promise<void> {
    try {
      console.error('stalled', job.id);
      await job.remove();
    } catch (e: unknown) {
      console.error(e);
    }
  }

  @OnQueueActive()
  public async onProgress(job: Job): Promise<void> {
    const userTgId = parseInt(_.get(job, 'data.from.id', ''));
    // if (userTgId) await this.telegramService.flushCallbacks(userTgId);
  }

  @Process('process')
  public async processHandler(job: Job): Promise<void> {
    try {
      const user: UserDbModel = _.get(job.data, 'user');

      const process = await this.cacheService.get<any>(`input:agency:${user.uuid}`);
      if (!process || !process?.type) return;

      switch (process.type) {
        case 'create':
          await this.agencyInputCreate.proceed(user, job.data, process);
          break;
        case 'edit_name':
          await this.agencyInputEditName.proceed(user, job.data, process);
          break;
        case 'invite':
          await this.agencyInputInvite.proceed(user, job.data, process);
          break;
      }

      return;
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('retrieve_creator_agency')
  public async retrieveCreatorAgency(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
      let agency!: AgencyDbModel;

      const keyboard = [
        [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_menu', { creator: creator.uuid }) }],
      ];

      let message = 'You don\'t have a producer. You could confirm producer in the invites';

    if (creator?.agencyUuid) {
      agency = await this.agencyDbRepository.findByUuid(creator.agencyUuid);
      keyboard.push([{
        text: 'Manage',
        callback_data: await this.telegramService.registerCallback(user, 'agency_creator_manage', { creator: creator.uuid, agency: agency.uuid }),
      }]);

        message = `Producer: ${agency.name}`;
      } else {
        keyboard[0].push({
          text: '👋🏼 Invites',
          callback_data: await this.telegramService.registerCallback(user, 'agency_fetch_creator_invites', { creator: creator.uuid }),
        });
      }

      await this.telegramService.botCreator.editMessageText(message, {
        chat_id: user.userTgId,
        message_id: _.get(job.data, 'message.message_id'),
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch (e: unknown) {
      console.error(e);
    }
  }

  @Process('creator_manage')
  public async retrieveAgency(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;

    const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
    const agency = await this.agencyDbRepository.findByUuid(creator.agencyUuid);

    const keyboard = [
      [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'agency_retrieve_creator_agency', { creator: creator.uuid }) }],
      [{ text: '❌ Delete producer', callback_data: await this.telegramService.registerCallback(user, 'agency_remove_by_creator', { creator: creator.uuid, agency: agency.uuid }) }],
    ];

    await this.telegramService.botCreator.editMessageText(`Manage producer: ${agency.name}`, {
      chat_id: user.userTgId,
      message_id: _.get(job.data, 'message.message_id'),
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Process('remove_by_creator')
  public async removeAgency(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;

    const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
    const keyboard = [
      [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'agency_retrieve_creator_agency', { creator: creator.uuid }) }],
    ];

    await this.creatorService.updateAgency(creator, null);

    await this.telegramService.botCreator.editMessageText(`Producer has been deleted`, {
      chat_id: user.userTgId,
      message_id: _.get(job.data, 'message.message_id'),
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Process('fetch_creator_invites')
  public async fetchCreatorInvites(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;

    const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
    const keyboard = [
      [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'agency_retrieve_creator_agency', { creator: creator.uuid }) }],
    ];

    const invites = await this.agencyInviteService.getListByCreator(creator);
    if (invites?.length) {
      const agencies = await this.agencyService.findByUuids(invites.map(item => item.agencyUuid));
      for (const invite of invites) {
        keyboard.push([{
          text: agencies.find(item => item.uuid === invite.agencyUuid).name,
          callback_data: await this.telegramService.registerCallback(user, 'agency_retrieve_creator_invite', { creator: creator.uuid, invite: invite.uuid })
        }]);
      }
    }

    let message = invites?.length > 0 ? 'Producers invites' : 'You do not have invites yet';

    await this.telegramService.botCreator.editMessageText(message, {
      chat_id: user.userTgId,
      message_id: _.get(job.data, 'message.message_id'),
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Process('retrieve_creator_invite')
  public async retrieveCreatorInvite(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;

    const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
    const invite = await this.agencyInviteService.getByUuidAndCreator(_.get(job.data, 'system.cmd.context.invite'), creator);
    const agency = await this.agencyService.findByUuid(invite.agencyUuid);

    const keyboard = [
      [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'agency_fetch_creator_invites', { creator: creator.uuid }) }],
      [
        { text: '✅ Accept', callback_data: await this.telegramService.registerCallback(user, 'agency_accept_invite_accept', { creator: creator.uuid, invite: invite.uuid }) },
        { text: '❌ Decline', callback_data: await this.telegramService.registerCallback(user, 'agency_accept_invite_decline', { creator: creator.uuid, invite: invite.uuid }) },
      ],
    ];

    let message = `Invite from '${agency.name}'`;
    await this.telegramService.botCreator.editMessageText(message, {
      chat_id: user.userTgId,
      message_id: _.get(job.data, 'message.message_id'),
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Process('accept_invite_accept')
  public async acceptInviteAccept(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;

    const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
    const invite = await this.agencyInviteService.getByUuidAndCreator(_.get(job.data, 'system.cmd.context.invite'), creator);
    const agency = await this.agencyService.findByUuid(invite.agencyUuid);

    await this.creatorService.updateAgency(creator, agency);
    await this.agencyInviteService.remove(invite);

    const keyboard = [
      [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'agency_retrieve_creator_agency', { creator: creator.uuid }) }],
    ];

    let message = `Invite from '${agency.name}' accepted`;
    await this.telegramService.botCreator.editMessageText(message, {
      chat_id: user.userTgId,
      message_id: _.get(job.data, 'message.message_id'),
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Process('accept_invite_decline')
  public async acceptInviteDecline(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;

    const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
    const invite = await this.agencyInviteService.getByUuidAndCreator(_.get(job.data, 'system.cmd.context.invite'), creator);
    const agency = await this.agencyService.findByUuid(invite.agencyUuid);

    await this.agencyInviteService.remove(invite);

    const keyboard = [
      [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'agency_retrieve_creator_agency', { creator: creator.uuid }) }],
    ];

    let message = `Invite from '${agency.name}' declined`;
    await this.telegramService.botCreator.editMessageText(message, {
      chat_id: user.userTgId,
      message_id: _.get(job.data, 'message.message_id'),
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Process('get_menu')
  public async getMenu(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.cleanAllProcesses(user);

      const keyboard = [
        [{ text: 'Agencies profiles', callback_data: await this.telegramService.registerCallback(user, 'agency_profiles') }],
        [{ text: 'Create', callback_data: await this.telegramService.registerCallback(user, 'agency_create') }],
      ];

      const messageId = _.get(job.data, 'message.message_id');
      if (!messageId) {
        await this.telegramService.botAgency.sendMessage(user.userTgId, 'Actions', {
          reply_markup: {
            inline_keyboard: keyboard,
          },
        });
      } else {
        await this.telegramService.botAgency.editMessageText('Actions', {
          chat_id: user.userTgId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: keyboard,
          },
        })
      }
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('create')
  public async create(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.agencyInputCreate.proceed(user, job.data);
    } catch (e: unknown) {
      console.error(e);
    }
  }

  @Process('profiles')
  public async fetchProfiles(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.cleanAllProcesses(user);

      const keyboard = [
        [{ text: 'Back', callback_data: await this.telegramService.registerCallback(user, 'start_back') }],
      ];

      let agencies = [];
      const agencyAdmins = await this.agencyAdminService.getListByUser(user);
      if (agencyAdmins?.length > 0) {
        agencies = await this.agencyDbRepository.findByUuids(agencyAdmins.map(item => item.agencyUuid));
        for (const agency of agencies) {
          keyboard.push([{
            text: agency.name,
            callback_data: await this.telegramService.registerCallback(user, 'agency_profile_menu', { agency: agency.uuid }),
          }]);
        }
      }

      await this.telegramService.botAgency.editMessageText(agencies.length > 0 ? 'Your agencies' : 'You do not have agency yet', {
        chat_id: user.userTgId,
        message_id: _.get(job.data, 'message.message_id'),
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch (e: unknown) {
      console.error(e);
    }
  }

  @Process('profile_menu')
  public async profileMenu(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.cleanAllProcesses(user);

      const contextAgencyUuid = _.get(job, 'data.system.cmd.context.agency');
      const agency = await this.agencyDbRepository.findByUuid(contextAgencyUuid);

      const keyboard = [
        [
          { text: 'Back', callback_data: await this.telegramService.registerCallback(user, 'agency_profiles') },
          { text: 'Rename', callback_data: await this.telegramService.registerCallback(user, 'agency_profile_edit_name', { agency: agency.uuid }) },
        ],
        [{ text: 'Associated creators', callback_data: await this.telegramService.registerCallback(user, 'agency_creators_fetch', { agency: agency.uuid }) }],
        [{ text: 'Invite creator', callback_data: await this.telegramService.registerCallback(user, 'agency_creator_invite', { agency: agency.uuid }) }],
      ];

      await this.telegramService.botAgency.editMessageText(agency.name, {
        chat_id: user.userTgId,
        message_id: _.get(job.data, 'message.message_id'),
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch (e: unknown) {
      console.error(e);
    }
  }

  @Process('creators_fetch')
  public async fetchCreators(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;

    await this.cleanAllProcesses(user);

    const contextAgencyUuid = _.get(job, 'data.system.cmd.context.agency');
    const agency = await this.agencyDbRepository.findByUuid(contextAgencyUuid);

    const keyboard = [
      [{ text: 'Back', callback_data: await this.telegramService.registerCallback(user, 'agency_profile_menu', { agency: agency.uuid }) }],
    ];

    const creators = await this.creatorService.getByAgency(agency);
    let message = `${agency.name} - Associated creators`;
    if (!creators?.length) {
      message += '\nThe list is empty';
    } else {
      for (const creator of creators) {
        message += `\n${creator.login}`;
      }
    }

    await this.telegramService.botAgency.editMessageText(message, {
      chat_id: user.userTgId,
      message_id: _.get(job.data, 'message.message_id'),
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Process('profile_edit_name')
  public async editName(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.agencyInputEditName.proceed(user, job.data);
    } catch (e: unknown) {
      console.error(e);
    }
  }

  @Process('creator_invite')
  public async inviteCreator(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.agencyInputInvite.proceed(user, job.data);
    } catch (e: unknown) {
      console.error(e);
    }
  }
}
