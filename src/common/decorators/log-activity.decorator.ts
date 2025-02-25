import { SetMetadata } from '@nestjs/common';

export const LOG_ACTIVITY = 'logActivity';
export const LogActivity = () => SetMetadata(LOG_ACTIVITY, true);
