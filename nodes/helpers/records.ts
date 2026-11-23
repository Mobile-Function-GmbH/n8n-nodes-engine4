import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	ResourceMapperField,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { saveAll } from './api';
import type { Engine4ReturnType } from './types';

interface SaveRecordOptions {
	onlyMappedColumns?: boolean;
	withDataId?: boolean;
}

export async function saveRecordFromParameters(
	this: IExecuteFunctions,
	itemIndex: number,
	{ onlyMappedColumns = false, withDataId = false }: SaveRecordOptions = {},
): Promise<INodeExecutionData[]> {
	const entityId = this.getNodeParameter('entity', itemIndex, '', {
		extractValue: true,
	}) as string;

	let dataId: string | undefined;
	if (withDataId) {
		dataId = (this.getNodeParameter('dataId', itemIndex, '') as string).trim();
		if (!dataId) {
			throw new NodeOperationError(
				this.getNode(),
				`The 'DataId' parameter is empty [item ${itemIndex}]`,
				{
					itemIndex,
					description:
						'Enter or map the DataId of the ENGINE4 record to update, e.g. {{ $json.DataId }}',
				},
			);
		}
	}
	const options = this.getNodeParameter('options', itemIndex, {}) as {
		returnType?: Engine4ReturnType;
	};
	const returnType: Engine4ReturnType = options.returnType ?? 'full';

	const values = (this.getNodeParameter('fields.value', itemIndex, {}) as IDataObject | null) ?? {};

	let allowedColumns: Set<string> | undefined;
	if (onlyMappedColumns) {
		const schema = this.getNodeParameter('fields.schema', itemIndex, []) as ResourceMapperField[];
		allowedColumns = new Set(schema.filter((field) => field.display).map((field) => field.id));
	}

	// filter columns
	const record: IDataObject = {};
	for (const [key, value] of Object.entries(values)) {
		if (value === undefined || value === null || value === '') {
			continue;
		}
		if (allowedColumns && !allowedColumns.has(key)) {
			continue;
		}
		record[key] = value;
	}

	record.EntityId = entityId;
	if (dataId) {
		record.DataId = dataId;
	}

	const response = await saveAll.call(this, [record], returnType);

	if (response === undefined) {
		return [{ json: { success: true }, pairedItem: { item: itemIndex } }];
	}

	const records = Array.isArray(response) ? response : [response];
	return records.map((json) => ({ json, pairedItem: { item: itemIndex } }));
}
