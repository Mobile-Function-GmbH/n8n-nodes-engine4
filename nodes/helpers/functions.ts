import type {
	FieldType,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
	ResourceMapperField,
	ResourceMapperFields,
} from 'n8n-workflow';

import type { IProperty } from './types';
import { Engine4FieldType } from './types';
import {
	getGenericEntities,
	getGenericProperties,
	getGenericViewFields,
	getGenericViews,
} from './api';

/** Only Insert views are offered, so records are created only where ENGINE4 expects them */
const INSERT_VIEW_TYPE = 'Insert';

/** ViewField.AssociatedViewField is this empty GUID unless the field comes from a related entity */
const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

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

function mapFieldToProperty(property: IProperty, label?: string): ResourceMapperField {
	const name = label?.trim() || property.PropertyName?.trim() || property.GenericColumnName;
	const fieldType = parseFieldType(property.DataType);

	return {
		id: property.GenericColumnName,
		displayName: `${name} (${property.GenericColumnName})`,
		type: toFieldType(fieldType),
		required: property.IsRequired === true,
		defaultMatch: false,
		canBeUsedToMatch: false,
		display: fieldType === undefined || !DISPLAY_ONLY_TYPES.has(fieldType),
	};
}

export async function getEntityFields(this: ILoadOptionsFunctions): Promise<ResourceMapperFields> {
	const entityId = this.getNodeParameter('entity', undefined, { extractValue: true }) as string;

	if (!entityId) {
		return { fields: [], emptyFieldsNotice: 'Select an entity first' };
	}

	const properties = await getGenericProperties.call(this, entityId);

	return {
		fields: properties.map((property) => mapFieldToProperty(property)),
		emptyFieldsNotice: 'This entity has no fields that can be written through the API',
	};
}

/** View dropdown: Insert views of the selected entity */
export async function getInsertViews(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const entityId = this.getNodeParameter('entity', undefined, { extractValue: true }) as string;

	if (!entityId) {
		return { results: [] };
	}

	const views = await getGenericViews.call(this, entityId);
	const search = filter?.toLowerCase().trim();

	const results: INodeListSearchItems[] = views
		.filter((view) => view.ViewType === INSERT_VIEW_TYPE)
		.map((view) => ({ name: view.ViewName, value: view.ViewId }))
		.filter((entry) => !search || entry.name.toLowerCase().includes(search))
		.sort((a, b) => a.name.localeCompare(b.name));

	return { results };
}

export async function getViewFields(this: ILoadOptionsFunctions): Promise<ResourceMapperFields> {
	const entityId = this.getNodeParameter('entity', undefined, { extractValue: true }) as string;
	const viewId = this.getNodeParameter('view', undefined, { extractValue: true }) as string;

	if (!entityId || !viewId) {
		return { fields: [], emptyFieldsNotice: 'Select an entity and a view first' };
	}

	const [viewFields, properties] = await Promise.all([
		getGenericViewFields.call(this, viewId),
		getGenericProperties.call(this, entityId),
	]);
	const propertiesById = new Map(properties.map((property) => [property.PropertyId, property]));

	const fields: ResourceMapperField[] = [];
	const seenColumns = new Set<string>();

	for (const viewField of viewFields) {
		// Fields of related entities cannot be saved through this entity
		if (viewField.AssociatedViewField && viewField.AssociatedViewField !== EMPTY_GUID) {
			continue;
		}

		const property = propertiesById.get(viewField.PropertyId ?? '');
		if (!property || seenColumns.has(property.GenericColumnName)) {
			continue;
		}

		seenColumns.add(property.GenericColumnName);
		fields.push(mapFieldToProperty(property, viewField.ViewFieldLabel));
	}

	// Alphabetical by label; PositionX/Y only describe the layout in the ENGINE4 UI
	fields.sort((a, b) => a.displayName.localeCompare(b.displayName));

	return {
		fields,
		emptyFieldsNotice: 'This view has no fields that can be written through the API',
	};
}
