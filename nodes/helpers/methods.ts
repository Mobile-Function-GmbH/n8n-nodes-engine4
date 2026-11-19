import type {
	FieldType,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
	ResourceMapperField,
	ResourceMapperFields,
} from 'n8n-workflow';

import { Engine4FieldType } from './types';
import { getGenericEntities, getGenericProperties } from './api';

export async function searchEntities(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const entities = await getGenericEntities.call(this);

	const search = filter?.toLowerCase().trim();

	const results: INodeListSearchItems[] = entities
		.filter((entity) => entity.AllowExternalApi !== false)
		.map((entity) => ({
			name: entity.EntityFriendlyName
				? `${entity.EntityFriendlyName} (${entity.EntityName})`
				: entity.EntityName,
			value: entity.EntityId,
		}))
		.filter((entry) => !search || entry.name.toLowerCase().includes(search))
		.sort((a, b) => a.name.localeCompare(b.name));

	return { results };
}

/** Case-insensitive lookup from the DataType string to the ENGINE4 field type */
const FIELD_TYPES_BY_NAME = new Map<string, Engine4FieldType>(
	Object.values(Engine4FieldType).map((type) => [type.toLowerCase(), type]),
);

function parseFieldType(dataType: string | undefined): Engine4FieldType | undefined {
	return FIELD_TYPES_BY_NAME.get((dataType ?? '').toLowerCase());
}

/** ENGINE4 field types that only display something in ENGINE4 and hold no data */
const DISPLAY_ONLY_TYPES = new Set<Engine4FieldType>([
	Engine4FieldType.nonHtmlDisplay,
	Engine4FieldType.textblock,
	Engine4FieldType.imageblock,
	Engine4FieldType.configHelp,
	Engine4FieldType.subview,
	Engine4FieldType.groupAggregation,
]);

// map ENGINE4 fields to field types available in n8n
function toFieldType(type: Engine4FieldType | undefined): FieldType {
	switch (type) {
		case Engine4FieldType.checkbox:
		case Engine4FieldType.decision:
			return 'boolean';

		case Engine4FieldType.integer:
		case Engine4FieldType.year:
		case Engine4FieldType.decimal:
			return 'number';

		case Engine4FieldType.date:
		case Engine4FieldType.datetime:
			return 'dateTime';

		case Engine4FieldType.time:
			return 'time';

		case Engine4FieldType.hyperlink:
			return 'url';

		case Engine4FieldType.textarea:
		case Engine4FieldType.richtext:
		case Engine4FieldType.markdown:
		case Engine4FieldType.password:
		case Engine4FieldType.passwordarea:
		case Engine4FieldType.filechooser:
		case Engine4FieldType.singledocument:
		case Engine4FieldType.signature:
		case Engine4FieldType.filters:
		case Engine4FieldType.specialized:
		case Engine4FieldType.serialized:
		case Engine4FieldType.custom:
		case Engine4FieldType.monthyear:
		case Engine4FieldType.input:
		case Engine4FieldType.tel:
		case Engine4FieldType.mail:
		case Engine4FieldType.geocode:
		case Engine4FieldType.color:
		case Engine4FieldType.icon:
		case Engine4FieldType.iconv2:
		case Engine4FieldType.select:
		case Engine4FieldType.inputSelect:
		case Engine4FieldType.asyncselect:
		case Engine4FieldType.autocomplete:
		case Engine4FieldType.multidropdown:
		case Engine4FieldType.multiDecision:
		case Engine4FieldType.richdocumentLookup:
		default:
			return 'string';
	}
}

export async function getEntityFields(this: ILoadOptionsFunctions): Promise<ResourceMapperFields> {
	const entityId = this.getNodeParameter('entity', undefined, { extractValue: true }) as string;

	if (!entityId) {
		return { fields: [], emptyFieldsNotice: 'Select an entity first' };
	}

	const properties = await getGenericProperties.call(this, entityId);

	const fields: ResourceMapperField[] = properties.map((property) => {
		const label = property.PropertyName?.trim() || property.GenericColumnName;
		const fieldType = parseFieldType(property.DataType);

		return {
			id: property.GenericColumnName,
			displayName: `${label} (${property.GenericColumnName})`,
			type: toFieldType(fieldType),
			required: property.IsRequired === true,
			defaultMatch: false,
			canBeUsedToMatch: false,
			display: fieldType === undefined || !DISPLAY_ONLY_TYPES.has(fieldType),
		};
	});

	return {
		fields,
		emptyFieldsNotice: 'This entity has no fields that can be written through the API',
	};
}
