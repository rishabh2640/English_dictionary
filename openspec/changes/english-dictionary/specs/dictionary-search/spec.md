## ADDED Requirements

### Requirement: Search for a word
The system SHALL allow users to input a valid English word and retrieve its dictionary data.

#### Scenario: Successful search
- **WHEN** the user inputs a valid English word and triggers the search
- **THEN** the system fetches data from the API and displays the word, its phonetics, and its definitions

#### Scenario: Word not found
- **WHEN** the user searches for a word that does not exist in the dictionary
- **THEN** the system displays a friendly "Word not found" error message

#### Scenario: Empty search
- **WHEN** the user attempts to search with an empty input
- **THEN** the system ignores the search action or displays a prompt to enter a word

### Requirement: As-You-Type Prefetching
The system SHALL display autocomplete suggestions and aggressively prefetch the top predicted result before the search is explicitly submitted.

#### Scenario: User is typing
- **WHEN** the user types characters into the search bar
- **THEN** the system debounces the input, provides a dropdown of word predictions, and quietly fetches the definition for the most likely word

#### Scenario: Result caching
- **WHEN** a definition has been fetched via prefetch or explicit search
- **THEN** subsequent requests for the same word are served instantly from the local cache

### Requirement: View phonetics and audio
The system SHALL display phonetic spelling and provide a way to listen to the pronunciation if available.

#### Scenario: Pronunciation available
- **WHEN** the API returns phonetic audio for the searched word
- **THEN** the system displays a play button that plays the audio when clicked

#### Scenario: Pronunciation unavailable
- **WHEN** the API does not return phonetic audio for the searched word
- **THEN** the system hides the play button but still shows the phonetic spelling if available

### Requirement: View word meanings and parts of speech
The system SHALL categorize definitions by their part of speech (noun, verb, etc.) and list synonyms and usage examples if provided by the API.

#### Scenario: Complete definitions
- **WHEN** the API returns multiple parts of speech with definitions and examples
- **THEN** the system displays a grouped list of meanings, clearly separated by part of speech, with examples styled distinctively
