# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-20

First stable release. Contains all features of 0.1.1 plus the changes below.

### Changed

- Node description now mentions finding records

- Record → Get Many: sorting moved into the **Options** collection, following the n8n UX guidelines.
- Clearer error messages for a failed ENGINE4 login, an empty DataId and unexpected Get Many responses
- Credential placeholders now start with "e.g."

## [0.1.1] - 2026-11-20

First version published to npm. Version 0.1.0 was tagged but never published.

### Added

- ENGINE4 API credential with login by username and password and automatic token renewal
- Record → Create: create a record with all fields of an entity
- Record → Create in View: create a record using only the fields of an insert view
- Record → Get Many: find records with filters, AND/OR combination, sorting and limit
- Record → Update: update a record by its Data ID; the entity can also be set by ID or expression
- Custom API Call for any request to the ENGINE4 External API
