import type { FilterField, SortOption } from '@/types/common/QueryBuilder';
import { DataType, FilterFieldType, FilterOperator, SortDirection } from '@/types/common/QueryBuilder';
import { BILLING_MODEL, BILLING_PERIOD, PRICE_TYPE } from '@/models/Price';
import { INVOICE_CADENCE } from '@/models/Invoice';
import { SUBSCRIPTION_LINE_ITEM_ENTITY_TYPE } from '@/models/Subscription';
import { toSentenceCase } from '@/utils/common/helper_functions';

export const SUBSCRIPTION_EDIT_LINE_ITEM_FILTER_OPTIONS: FilterField[] = [
	{
		field: 'display_name',
		label: 'Name',
		fieldType: FilterFieldType.INPUT,
		operators: [FilterOperator.CONTAINS, FilterOperator.NOT_CONTAINS, FilterOperator.EQUAL],
		dataType: DataType.STRING,
	},
	{
		field: 'plan_display_name',
		label: 'Plan name',
		fieldType: FilterFieldType.INPUT,
		operators: [FilterOperator.CONTAINS, FilterOperator.NOT_CONTAINS, FilterOperator.EQUAL],
		dataType: DataType.STRING,
	},
	{
		field: 'meter_display_name',
		label: 'Meter name',
		fieldType: FilterFieldType.INPUT,
		operators: [FilterOperator.CONTAINS, FilterOperator.NOT_CONTAINS, FilterOperator.EQUAL],
		dataType: DataType.STRING,
	},
	{
		field: 'price_type',
		label: 'Price type',
		fieldType: FilterFieldType.MULTI_SELECT,
		operators: [FilterOperator.IN, FilterOperator.NOT_IN],
		dataType: DataType.ARRAY,
		options: [
			{ value: PRICE_TYPE.USAGE, label: 'Usage' },
			{ value: PRICE_TYPE.FIXED, label: 'Fixed' },
		],
	},
	{
		field: 'billing_period',
		label: 'Billing period',
		fieldType: FilterFieldType.MULTI_SELECT,
		operators: [FilterOperator.IN, FilterOperator.NOT_IN],
		dataType: DataType.ARRAY,
		options: Object.values(BILLING_PERIOD).map((v) => ({
			value: v,
			label: toSentenceCase(String(v).replace(/_/g, ' ')),
		})),
	},
	{
		field: 'billing_model',
		label: 'Billing model',
		fieldType: FilterFieldType.MULTI_SELECT,
		operators: [FilterOperator.IN, FilterOperator.NOT_IN],
		dataType: DataType.ARRAY,
		options: [
			{ value: BILLING_MODEL.FLAT_FEE, label: 'Flat fee' },
			{ value: BILLING_MODEL.PACKAGE, label: 'Package' },
			{ value: BILLING_MODEL.TIERED, label: 'Tiered' },
		],
	},
	{
		field: 'invoice_cadence',
		label: 'Invoice cadence',
		fieldType: FilterFieldType.MULTI_SELECT,
		operators: [FilterOperator.IN, FilterOperator.NOT_IN],
		dataType: DataType.ARRAY,
		options: [
			{ value: INVOICE_CADENCE.ARREAR, label: 'Arrear' },
			{ value: INVOICE_CADENCE.ADVANCE, label: 'Advance' },
		],
	},
	{
		field: 'quantity',
		label: 'Quantity',
		fieldType: FilterFieldType.INPUT,
		operators: [FilterOperator.EQUAL, FilterOperator.GREATER_THAN, FilterOperator.LESS_THAN],
		dataType: DataType.NUMBER,
	},
	{
		field: 'entity_type',
		label: 'Source',
		fieldType: FilterFieldType.MULTI_SELECT,
		operators: [FilterOperator.IN, FilterOperator.NOT_IN],
		dataType: DataType.ARRAY,
		options: [
			{ value: SUBSCRIPTION_LINE_ITEM_ENTITY_TYPE.PLAN, label: 'Plan' },
			{ value: SUBSCRIPTION_LINE_ITEM_ENTITY_TYPE.ADDON, label: 'Add-on' },
			{ value: SUBSCRIPTION_LINE_ITEM_ENTITY_TYPE.SUBSCRIPTION, label: 'Subscription' },
		],
	},
];

export const SUBSCRIPTION_EDIT_LINE_ITEM_SORT_OPTIONS: SortOption[] = [
	{ field: 'display_name', label: 'Name', direction: SortDirection.ASC },
];
