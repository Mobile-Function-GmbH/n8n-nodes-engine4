export type Engine4ReturnType = 'full' | 'dataId' | 'none';

export interface IEntity {
	EntityId: string;
	EntityName: string;
	EntityFriendlyName?: string;
	IsMobileEntity?: boolean;
	AllowExternalApi?: boolean;
}

export interface IProperty {
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

export interface IView {
	EntityId: string;
	ViewId: string;
	ViewName: string;
	ViewType: string;
	IsMobile?: boolean;
}

export interface IViewField {
	ViewId: string;
	ViewFieldId: string;
	PropertyId?: string | null;
	PropertyName?: string;
	AssociatedViewField?: string | null;
	AssociatedViewId?: string | null;
	PositionX?: number | null;
	PositionY?: number | null;
	Width?: number | null;
	Height?: number | null;
	GenericColumnName?: string;
	FieldGenericColumnName?: string;
	ViewFieldLabel?: string;
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
