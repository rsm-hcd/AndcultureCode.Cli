import { Factory } from "rosie";
import { CommandDefinition } from "../../interfaces/command-definition";
import { FactoryType } from "./factory-type";
import faker from "faker";

// -------------------------------------------------------------------------------------------------
// #region Factory
// -------------------------------------------------------------------------------------------------

const CommandDefinitionFactory = Factory.define<CommandDefinition>(
    FactoryType.CommandDefinition
).attrs({
    command: () => faker.random.uuid(),
    description: () => faker.random.uuid(),
});

// #endregion Factory

// -------------------------------------------------------------------------------------------------
// #region Exports
// -------------------------------------------------------------------------------------------------

export { CommandDefinitionFactory };

// #endregion Exports
