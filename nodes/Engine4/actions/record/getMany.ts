import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { fetchRecords } from '../../../helpers/api';
import {
	combineFiltersField,
	entityField,
	FILTER_OPERATOR_MAP,
	filtersField,
	limitField,
	NO_VALUE_OPERATORS,
	returnAllField,
	showFor,
	sortField,
} from '../../../helpers/fields';
import type { FilterOperatorKey } from '../../../helpers/fields';
import type { IFetchFilter, IFetchSorting, IGenericDataElement } from '../../../helpers/types';

const displayOptions = showFor('record', ['getMany']);

const PAGE_SIZE = 100;

export const description: INodeProperties[] = [
	entityField(displayOptions),
	returnAllField(displayOptions),
	limitField(displayOptions),
	filtersField(displayOptions),
	combineFiltersField(displayOptions),
	sortField(displayOptions),
];

interface FilterRow {
	field?: string;
	operator?: FilterOperatorKey;
	value?: string;
}

interface SortRule {
	field?: string;
	descending?: boolean;
}

function buildFilter(rows: FilterRow[], logic: 'AND' | 'OR'): IFetchFilter | null {
	const conditions: IFetchFilter[] = rows
		.filter((row) => row.field)
		.map((row) => {
			const operator = row.operator ?? 'equal';
			const condition: IFetchFilter = {
				GenericName: row.field as string,
				CompareOperator: FILTER_OPERATOR_MAP[operator],
			};

			if (operator === 'inList') {
				const values = (row.value ?? '')
					.split(',')
					.map((value) => value.trim())
					.filter((value) => value !== '');
				condition.Value = JSON.stringify(values);
			} else if (!NO_VALUE_OPERATORS.includes(operator)) {
				condition.Value = row.value ?? '';
			}

			return condition;
		});

	if (conditions.length === 0) return null;

	const [first, ...others] = conditions;
	if (others.length === 0) return first;

	return {
		...first,
		Logic: logic,
		Groups: others.map((condition) => ({ ...condition, Logic: logic })),
	};
}

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const entityId = this.getNodeParameter('entity', itemIndex, '', {
		extractValue: true,
	}) as string;
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
	const limit = returnAll ? Infinity : (this.getNodeParameter('limit', itemIndex, 50) as number);
	const filterRows = this.getNodeParameter('filters.conditions', itemIndex, []) as FilterRow[];
	const logic = this.getNodeParameter('combineFilters', itemIndex, 'AND') as 'AND' | 'OR';
	const sortRules = this.getNodeParameter('sort.rules', itemIndex, []) as SortRule[];

	const filter = buildFilter(filterRows, logic);
	const sortings: IFetchSorting[] = sortRules
		.filter((rule) => rule.field)
		.map((rule) => ({ GenericName: rule.field as string, Descending: rule.descending === true }));

	const records: IGenericDataElement[] = [];
	let skip = 0;

	while (records.length < limit) {
		const take = Math.min(PAGE_SIZE, limit - records.length);

		const response = await fetchRecords.call(this, {
			EntityId: entityId,
			Take: take,
			Skip: skip,
			Filter: filter,
			Sortings: sortings,
			IsActive: true,
			WithLongValues: true,
			ConvertAllCustomDataToStrings: true,
			WithTotalCount: false,
		});

		if (response.Items !== undefined && !Array.isArray(response.Items)) {
			throw new NodeOperationError(this.getNode(), 'Unexpected response from ENGINE4 fetch', {
				itemIndex,
			});
		}

		const page = response.Items ?? [];
		records.push(...page);

		if (page.length < take) {
			break;
		}
		skip += page.length;
	}

	return records.map((json) => ({ json, pairedItem: { item: itemIndex } }));
}
