# n8n-nodes-engine4

This is a n8n community node. It lets you use [ENGINE4](https://www.mobile-function.com/) in your n8n workflows.

ENGINE4 by Mobile Function is a low-code platform for building business applications. Its data is organized in entities (tables) and views. This node creates, updates and finds records in your ENGINE4 entities through the ENGINE4 External API.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation and install the package `n8n-nodes-engine4`.

## Operations

**Record**

| Operation      | Description                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create         | Creates a new record in an entity.                                                                                                                                |
| Create in View | Creates a new record using only the fields of an insert view of the entity.                                                                                       |
| Get Many       | Finds all records of an entity that match the filters, sorted as set. Each record becomes its own n8n item, so following nodes (e.g. Update) run once per record. |
| Update         | Updates an existing record by its Data ID. Only fields with a value are changed.                                                                                  |

Only entities that are released for the External API are listed. Inactive records are not returned by Get Many.

Besides these operations, the node offers **Custom API Call** to send any request to the ENGINE4 External API with the stored credential.

## Credentials

The node uses the **ENGINE4 API** credential, which logs in with an ENGINE4 user account. The access token is requested and renewed automatically.

Prerequisites:

- An ENGINE4 user that is allowed to use the External API
- The client ID of your ENGINE4 instance (ask your ENGINE4 administrator or mobile function GmbH)

| Field     | Description                                                                                |
| --------- | ------------------------------------------------------------------------------------------ |
| Base URL  | URL of your ENGINE4 instance, without a trailing slash. Default: `https://prod.engine4.io` |
| Client ID | Client ID of your ENGINE4 instance                                                         |
| Username  | Email address of the ENGINE4 user                                                          |
| Password  | Password of the ENGINE4 user                                                               |

The node can only read and write what this user is allowed to access in ENGINE4. Using a dedicated user for n8n with only the permissions you need is recommended.

## Compatibility

Built with the `@n8n/node-cli` and tested with n8n 2.48.6. Requires an ENGINE4 instance with the External API enabled.

## Usage

### Field mapping

Create, Create in View and Update load the fields of the selected entity or view. You can either

- **map each field manually** (`Map Each Column Manually`), or
- **map automatically** (`Map Automatically`), where fields of the incoming item whose names match the ENGINE4 column names are written.

Fields are shown as `Label (ColumnName)`. Display-only fields such as text blocks are not offered.

### Filters in Get Many

- Each filter consists of a field, an operator and a value. System columns such as `Created Date` and `Data ID` are available as well.
- **Combine Filters** decides whether all filters (AND) or at least one filter (OR) must match.
- **Like** uses `%` and `_` as wildcards. **In List** takes several values separated by commas.
- Sorting is set under **Options → Sort**. To get the newest record, sort by `Created Date (System)` descending and set **Limit** to 1.

### Find and update a record

A common pattern is to look a record up and then change it:

1. **ENGINE4 → Get Many**: filter for the record, e.g. by an order number.
2. **ENGINE4 → Update**: set **Entity** to `By ID` with `{{ $json.EntityId }}` and **Data ID** to `{{ $json.DataId }}`, then map the fields to change.

If Get Many finds several records, Update runs once for each of them, so all matching records are updated.

When the entity comes from an expression, the field list can only be loaded once the previous node has produced data. Run the previous node once, or use `Map Automatically`.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [ENGINE4 API documentation](https://docs.engine4.io/api)
- [Mobile Function](https://www.mobile-function.com/)

## Version history

See [CHANGELOG.md](CHANGELOG.md).
