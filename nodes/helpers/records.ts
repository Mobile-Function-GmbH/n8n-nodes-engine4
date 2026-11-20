/**
 * Shared logic for actions that create records from the "Fields" mapping.
 * Used by Record → Create and Record → Create in View.
 */
import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	ResourceMapperField,
} from 'n8n-workflow';

import { saveAll } from './api';
import type { Engine4ReturnType } from './types';

interface CreateRecordOptions {
	/** Send only columns that are part of the loaded field mapping (e.g. the fields of a view) */
	onlyMappedColumns?: boolean;
}

/** Reads entity, fields and options of one input item and creates the record via saveAll */
export async function createRecordFromParameters(
	this: IExecuteFunctions,
	itemIndex: number,
	{ onlyMappedColumns = false }: CreateRecordOptions = {},
): Promise<INodeExecutionData[]> {
	const entityId = this.getNodeParameter('entity', itemIndex, '', {
		extractValue: true,
	}) as string;
	const mappingMode = this.getNodeParameter('fields.mappingMode', itemIndex) as string;
	const options = this.getNodeParameter('options', itemIndex, {}) as {
		returnType?: Engine4ReturnType;
	};
	const returnType: Engine4ReturnType = options.returnType ?? 'full';

	const values =
		mappingMode === 'autoMapInputData'
			? this.getInputData()[itemIndex].json
			: ((this.getNodeParameter('fields.value', itemIndex, {}) as IDataObject | null) ?? {});

	// Columns of the loaded field mapping, e.g. only the fields of the selected view
	let allowedColumns: Set<string> | undefined;
	if (onlyMappedColumns) {
		const schema = this.getNodeParameter('fields.schema', itemIndex, []) as ResourceMapperField[];
		allowedColumns = new Set(schema.filter((field) => field.display).map((field) => field.id));
	}

	// Leave out empty fields (ENGINE4 keeps its defaults) and columns outside the mapping
	const record: IDataObject = { EntityId: entityId };
	for (const [key, value] of Object.entries(values)) {
		if (value === undefined || value === null || value === '') continue;
		if (allowedColumns && !allowedColumns.has(key)) continue;
		record[key] = value;
	}

	const response = await saveAll.call(this, [record], returnType);

	// returnType "none" answers without a body
	if (response === undefined) {
		return [{ json: { success: true }, pairedItem: { item: itemIndex } }];
	}

	const records = Array.isArray(response) ? response : [response];
	return records.map((json) => ({ json, pairedItem: { item: itemIndex } }));
}
