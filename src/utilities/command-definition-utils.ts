import { CommandDefinition } from "../interfaces/command-definition";
import { CommandDefinitions } from "../modules/command-definitions";

// -----------------------------------------------------------------------------------------
// #region Variables
// -----------------------------------------------------------------------------------------

let _defaultMap: Record<string, CommandDefinition> = CommandDefinitions;

// #endregion Variables

// -----------------------------------------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------------------------------------

/**
 * Utility functions related to working with `CommandDefinition` objects
 */
const CommandDefinitionUtils = {
    /**
     * Returns whether or not a definition of the matching name (case-insensitive) exists in the
     * provided map
     *
     * @param name Name of the definition to find
     * @param map Collection of definitions to check
     */
    exists(name: string, map?: Record<string, CommandDefinition>): boolean {
        return this.get(name, _getOrDefault(map)) != null;
    },

    /**
     * Flattens the first level of a map to an array.
     *
     * @param map Collection of definitions to flatten to an array
     */
    flatten(map?: Record<string, CommandDefinition>): CommandDefinition[] {
        const mapToFlatten = _getOrDefault(map);
        return Object.keys(mapToFlatten).map(
            (key: string) => mapToFlatten[key]
        );
    },

    /**
     * Returns a definition of the matching name (case-insensitive) in the provided collection
     *
     * @param name Name of the definition to find
     * @param map Collection of definitions to check
     */
    get(
        name: string,
        map?: Record<string, CommandDefinition>
    ): CommandDefinition | undefined {
        return this.flatten(_getOrDefault(map)).find(
            (definition: CommandDefinition) =>
                name.toLowerCase() === definition.command.toLowerCase()
        );
    },

    /**
     * Returns an array of the first level of command names
     *
     * @param map Collection of definitions to retrieve names from
     */
    getNames(map?: Record<string, CommandDefinition>): string[] {
        return this.flatten(_getOrDefault(map)).map(
            (definition: CommandDefinition) => definition.command
        );
    },

    /**
     * Returns whether or not a definition of the matching name exists in the base `and-cli` map
     *
     * @param name Name of the definition to check
     */
    isBase(name: string): boolean {
        return this.get(name, CommandDefinitions) != null;
    },

    /**
     * Sets the default map of CommandDefinitions to be used when not passed in as a parameter to
     * any of the functions in this utility module.
     *
     * @default `CommandDefinitions` module
     * @param map Collection of definitions to be used as a default map
     *
     * @returns `this` for chaining
     */
    setDefault(map: Record<string, CommandDefinition>) {
        _defaultMap = map;
        return this;
    },

    /**
     * Converts the first level of definitions in the provided map to a comma separated string
     *
     * @param map Collection of definitions to convert to a string
     * @returns Comma separated string of definition names
     */
    toCsv(map?: Record<string, CommandDefinition>): string {
        return this.getNames(_getOrDefault(map)).join(",");
    },
};

// #endregion Public Functions

// -----------------------------------------------------------------------------------------
// #region Private Functions
// -----------------------------------------------------------------------------------------

const _getOrDefault = (
    map?: Record<string, CommandDefinition>
): Record<string, CommandDefinition> => map ?? _defaultMap;

// #endregion Private Functions

// -----------------------------------------------------------------------------------------
// #region Exports
// -----------------------------------------------------------------------------------------

export { CommandDefinitionUtils };

// #endregion Exports
