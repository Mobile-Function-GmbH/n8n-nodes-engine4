/** Data types of the ENGINE4 External API */

/** What saveAll returns: complete records, DataId-EntityId pairs, or nothing (HTTP 204) */
export type Engine4ReturnType = 'full' | 'dataId' | 'none';

/** Entry of GET /webapi/external/GetGenericEntities */
export interface Engine4Entity {
	EntityId: string;
	EntityName: string;
	EntityFriendlyName?: string;
	IsMobileEntity?: boolean;
	AllowExternalApi?: boolean;
}

/** ENGINE4 field types, as returned in `DataType` of GetGenericProperties */
export enum Engine4FieldType {
	input = 'input',
	textarea = 'textarea',
	select = 'select',
	inputSelect = 'inputSelect',
	asyncselect = 'asyncselect',
	multidropdown = 'multidropdown',
	richdocumentLookup = 'richdocumentLookup',
	checkbox = 'checkbox',
	decision = 'decision',
	multiDecision = 'multiDecision',
	time = 'time',
	date = 'date',
	monthyear = 'monthyear',
	year = 'year',
	datetime = 'datetime',
	filechooser = 'filechooser',
	filters = 'filters',
	specialized = 'specialized',
	singledocument = 'singledocument',
	signature = 'signature',
	richtext = 'richtext',
	tel = 'tel',
	mail = 'mail',
	nonHtmlDisplay = 'nonHtmlDisplay',
	hyperlink = 'hyperlink',
	subview = 'subview',
	geocode = 'geocode',
	color = 'color',
	password = 'password',
	passwordarea = 'passwordarea',
	autocomplete = 'autocomplete',
	integer = 'integer',
	decimal = 'decimal',
	icon = 'icon',
	iconv2 = 'iconv2',
	serialized = 'serialized',
	groupAggregation = 'groupAggregation',
	configHelp = 'configHelp',
	textblock = 'textblock',
	custom = 'custom',
	imageblock = 'imageblock',
	markdown = 'markdown',
}

/** Entry of GET /webapi/external/GetGenericProperties */
export interface Engine4Property {
	EntityId: string;
	PropertyId: string;
	GenericColumnName: string;
	PropertyName?: string;
	DataType?: string;
	Size?: number | null;
	Precision?: number | null;
	Scale?: number | null;
	IsUtc?: boolean;
	IsRequired?: boolean;
	LookupEntityId?: string | null;
}
