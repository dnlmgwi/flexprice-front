import { BaseModel, Metadata } from './base';

export interface Plan extends BaseModel {
	readonly description: string;
	readonly lookup_key: string;
	readonly name: string;
	readonly metadata?: Metadata;
	readonly display_order?: number;
}
