/**
 * Reusable UI fields (node properties) for actions.
 * showFor() creates displayOptions for the field from the action its used in
 * needs to be defined since n8n lists all available fields
 */
import type { IDisplayOptions, INodeProperties } from 'n8n-workflow';

import type { FetchCompareOperator } from './types';

export function showFor(resource: string, operations: string[]): IDisplayOptions {
	return {
		show: {
			resource: [resource],
			operation: operations,
		},
	};
}

// allowID defines if a id can be put directly in the field
export function entityField(
	displayOptions: IDisplayOptions,
	{ allowId = false }: { allowId?: boolean } = {},
): INodeProperties {
	return {
		displayName: 'Entity',
		name: 'entity',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'ENGINE4 entity that should be used',
		displayOptions,
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchEntities',
					searchable: true,
				},
			},
			...(allowId
				? [
						{
							displayName: 'By ID',
							name: 'id',
							type: 'string' as const,
							placeholder: 'e.g. ee5f85eb-53d4-47a5-a8d2-f18ee0a9ce91',
						},
					]
				: []),
		],
	};
}

export function dataIdField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'Data ID',
		name: 'dataId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 1bdc7f8a-67c8-4ead-be6a-016722a45c1c',
		description: 'DataId of the ENGINE4 record',
		displayOptions,
	};
}

export function viewField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'View',
		name: 'view',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'ENGINE4 insert view whose fields should be used',
		displayOptions,
		typeOptions: {
			loadOptionsDependsOn: ['entity.value'],
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchInsertViews',
					searchable: true,
				},
			},
		],
	};
}

/**
 * Where the field mapping takes its fields from:
 * - entity: all columns of the entity (required fields are mandatory)
 * - view: only the fields of the selected view (needs viewField in the same action)
 * - entityUpdate: all columns of the entity, none mandatory
 */
type PropertySource = 'entity' | 'view' | 'entityUpdate';

const MAPPER_METHODS: Record<PropertySource, string> = {
	entity: 'getEntityFields',
	view: 'getViewFields',
	entityUpdate: 'getEntityFieldsForUpdate',
};

export function propertyField(
	displayOptions: IDisplayOptions,
	source: PropertySource = 'entity',
): INodeProperties {
	return {
		displayName: 'Fields',
		name: 'fields',
		type: 'resourceMapper',
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		noDataExpression: true,
		required: true,
		typeOptions: {
			loadOptionsDependsOn: source === 'view' ? ['entity.value', 'view.value'] : ['entity.value'],
			resourceMapper: {
				resourceMapperMethod: MAPPER_METHODS[source],
				mode: 'add',
				fieldWords: {
					singular: 'field',
					plural: 'fields',
				},
				addAllFields: false,
				supportAutoMap: true,
				multiKeyMatch: false,
			},
		},
		displayOptions,
	};
}

export function optionsCollection(
	displayOptions: IDisplayOptions,
	options: INodeProperties[],
): INodeProperties {
	return {
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions,
		options,
	};
}

export const returnTypeOption: INodeProperties = {
	displayName: 'Return Type',
	name: 'returnType',
	type: 'options',
	options: [
		{
			name: 'Full Record',
			value: 'full',
			description: 'Return the complete saved record',
		},
		{
			name: 'IDs Only',
			value: 'dataId',
			description: 'Return only the DataId and EntityId of the saved record',
		},
		{
			name: 'Nothing',
			value: 'none',
			description: 'Return no data, only a success flag',
		},
	],
	default: 'full',
	description: 'What ENGINE4 returns after saving',
};

export function returnAllField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions,
	};
}

export function limitField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			...displayOptions,
			show: {
				...displayOptions.show,
				returnAll: [false],
			},
		},
	};
}

// enum needed since n8n treats the value starting with '=' as an expression and breaks selection
export const FILTER_OPERATOR_MAP: Record<string, FetchCompareOperator> = {
	equal: '=',
	notEqual: '!=',
	smaller: '<',
	smallerOrEqual: '<=',
	greater: '>',
	greaterOrEqual: '>=',
	like: 'LIKE',
	contains: 'CONTAINS',
	isEmpty: 'ISNULL',
	isNotEmpty: 'ISNOTNULL',
	inList: 'IN',
};

export type FilterOperatorKey = keyof typeof FILTER_OPERATOR_MAP;

const FILTER_OPERATORS: Array<{ name: string; value: FilterOperatorKey }> = [
	{ name: 'Equal', value: 'equal' },
	{ name: 'Not Equal', value: 'notEqual' },
	{ name: 'Smaller', value: 'smaller' },
	{ name: 'Smaller or Equal', value: 'smallerOrEqual' },
	{ name: 'Greater', value: 'greater' },
	{ name: 'Greater or Equal', value: 'greaterOrEqual' },
	{ name: 'Like (% and _ as Wildcards)', value: 'like' },
	{ name: 'Contains', value: 'contains' },
	{ name: 'Is Empty', value: 'isEmpty' },
	{ name: 'Is Not Empty', value: 'isNotEmpty' },
	{ name: 'In List', value: 'inList' },
];

export const NO_VALUE_OPERATORS: FilterOperatorKey[] = ['isEmpty', 'isNotEmpty'];

export function filtersField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'Filters',
		name: 'filters',
		type: 'fixedCollection',
		placeholder: 'Add filter',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		description: 'Only return records matching these conditions',
		displayOptions,
		options: [
			{
				displayName: 'Conditions',
				name: 'conditions',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'field',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFilterFields',
							loadOptionsDependsOn: ['entity.value'],
						},
						default: '',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
					{
						displayName: 'Operator',
						name: 'operator',
						type: 'options',
						noDataExpression: true,
						options: FILTER_OPERATORS,
						default: 'equal',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'For "In List", separate the values with commas',
						displayOptions: {
							hide: {
								operator: NO_VALUE_OPERATORS,
							},
						},
					},
				],
			},
		],
	};
}

export function combineFiltersField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'Combine Filters',
		name: 'combineFilters',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'AND', value: 'AND', description: 'Records must match all filters' },
			{ name: 'OR', value: 'OR', description: 'Records must match at least one filter' },
		],
		default: 'AND',
		displayOptions,
	};
}

export function sortField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'Sort',
		name: 'sort',
		type: 'fixedCollection',
		placeholder: 'Add sort rule',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions,
		options: [
			{
				displayName: 'Rules',
				name: 'rules',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'field',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFilterFields',
							loadOptionsDependsOn: ['entity.value'],
						},
						default: '',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
					{
						displayName: 'Descending',
						name: 'descending',
						type: 'boolean',
						default: false,
						description: 'Whether to sort from highest to lowest (e.g. newest first)',
					},
				],
			},
		],
	};
}
