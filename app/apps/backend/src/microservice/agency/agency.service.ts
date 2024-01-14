import { Injectable } from '@nestjs/common';
import { AgencyDbModel, AgencyInviteDbModel, CreatorDbModel, UserDbModel } from '@/db/model';
import { AgencyDbRepository } from '@/db/repository';
import { AgencyAdminService } from '@/microservice/agencyAdmin';
import { AgencyInviteService } from '@/microservice/agencyInvite';
import { TelegramService } from '@/microservice/telegram';
import { UserService } from '@/microservice/user';

@Injectable()
export class AgencyService {
  constructor(
    private readonly agencyDbRepository: AgencyDbRepository,
    private readonly agencyAdminService: AgencyAdminService,
    private readonly agencyInviteService: AgencyInviteService,
    private readonly telegramService: TelegramService,
    private readonly userService: UserService,
  ) {}

  public async find(user: UserDbModel, uuid: string): Promise<AgencyDbModel | undefined> {
    const agency = await this.agencyDbRepository.findByUuid(uuid);
    if (!agency) return;

    const isAdmin = await this.agencyAdminService.isUserAdmin(agency, user);
    if (!isAdmin) return;

    return agency;
  }

  public async findByUuid(uuid: string): Promise<AgencyDbModel> {
    return this.agencyDbRepository.findByUuid(uuid);
  }

  public async findByUuids(uuids: string[]): Promise<AgencyDbModel[]> {
    return this.agencyDbRepository.findByUuids(uuids);
  }

  public async create(user: UserDbModel, name: string): Promise<AgencyDbModel> {
    const agency = await this.agencyDbRepository.create(name);
    await this.agencyAdminService.create(agency, user);
    return agency;
  }

  public async edit(agency: AgencyDbModel): Promise<AgencyDbModel> {
    return this.agencyDbRepository.edit(agency);
  }

  public async checkInvite(agency: AgencyDbModel, creator: CreatorDbModel): Promise<boolean> {
    return this.agencyInviteService.isExisting(agency, creator);
  }

  public async addInvite(agency: AgencyDbModel, creator: CreatorDbModel): Promise<AgencyInviteDbModel> {
    const isExisting = await this.agencyInviteService.isExisting(agency, creator);
    if (isExisting) throw new Error('Invite had been sent before.');

    const invite= await this.agencyInviteService.create(agency, creator);
    const creatorUser = await this.userService.getByUuid(creator.userUuid);

    await this.telegramService.botCreator.sendMessage(creatorUser.userTgId, `Info. Profile: ${creator.login}\nNew invite from producer: '${agency.name}'`);

    return invite;
  }
}
