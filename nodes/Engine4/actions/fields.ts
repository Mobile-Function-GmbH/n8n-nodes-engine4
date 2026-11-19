/**
 * Reusable UI fields (node properties) for ENGINE4 actions.
 *
 * Each field is a function that takes the displayOptions of the action using it,
 * because n8n needs the same field name (e.g. "entity") to be shown separately
 * per resource/operation. Example in an action file:
 *
 *   const displayOptions = showFor('record', ['create']);
 *   export const description = [entityField(displayOptions), ...];
 */
import type { IDisplayOptions, INodeProperties } from 'n8n-workflow';

/** displayOptions that show a field only for the given resource and operations */
export function showFor(resource: string, operations: string[]): IDisplayOptions {
	return {
		show: {
			resource: [resource],
			operation: operations,
		},
	};
}

// ----------------------------------
//         Entity
// ----------------------------------

/** Entity dropdown (searchable), loaded from GetGenericEntities */
export function entityField(
	displayOptions: IDisplayOptions,
	description = 'The ENGINE4 entity to use',
): INodeProperties {
	return {
		displayName: 'Entity',
		name: 'entity',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description,
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
		],
	};
}

// ----------------------------------
//         Record fields
// ----------------------------------

/** Field mapping for the columns of the selected entity, loaded from GetGenericProperties */
export function recordFieldsMapper(displayOptions: IDisplayOptions): INodeProperties {
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
			loadOptionsDependsOn: ['entity.value'],
			resourceMapper: {
				resourceMapperMethod: 'getEntityFields',
				mode: 'add',
				fieldWords: {
					singular: 'field',
					plural: 'fields',
				},
				// Entities can have many columns: start empty, users add the fields they need
				addAllFields: false,
				supportAutoMap: true,
				multiKeyMatch: false,
			},
		},
		displayOptions,
	};
}

// ----------------------------------
//         Options
// ----------------------------------

/** "Options" collection; pass the option fields the action supports */
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

/** Option: what saveAll returns (used inside optionsCollection) */
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
