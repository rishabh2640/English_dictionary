## Why

The user needs an English dictionary to look up word definitions, phonetics, synonyms, and usage examples. A dedicated dictionary application or feature will improve the user experience by providing quick access to linguistic information without having to use external search engines.

## What Changes

- Create a functional interface for searching English words with an autocomplete dropdown.
- Implement as-you-type prefetching to speculatively load definitions for top predicted words, providing a perceived zero-latency experience.
- Integrate with a dictionary API (e.g., Free Dictionary API) to fetch word meanings, phonetics, parts of speech, and examples.
- Display the search results in a clean, readable, and modern UI.
- Handle edge cases like words not found or network errors gracefully.

## Capabilities

### New Capabilities
- `dictionary-search`: The core capability to search for an English word and display its definition, phonetics, and examples. Includes autocomplete and prefetching to ensure maximum perceived speed.

### Modified Capabilities
- (None)

## Impact

- Introduces a new feature module for dictionary search and display.
- Adds an external dependency on a dictionary API for data fetching.
- Requires new UI components for the search bar, result layout, and error states.
hello