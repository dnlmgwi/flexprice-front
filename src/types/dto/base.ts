import { ENTITY_STATUS } from '@/models';

export interface QueryFilter {
	limit?: number | null;
	offset?: number;
	status?: ENTITY_STATUS;
	sort?: string;
	order?: string;
	expand?: string;
}

export interface TimeRangeFilter {
	start_time?: string;
	end_time?: string;
}
