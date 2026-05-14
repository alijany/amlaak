import { EntityRepository } from '@mikro-orm/postgresql';
import { NotificationPreferenceEntity } from '../notification-preference.entity';

export class NotificationPreferenceRepository extends EntityRepository<NotificationPreferenceEntity> {}
