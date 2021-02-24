import { Factory } from "rosie";
import { FactoryType } from "./factory-type";
import faker from "faker";
import { Repository } from "../../interfaces/repository";
import { TestUtils } from "../test-utils";

// -------------------------------------------------------------------------------------------------
// #region Factory
// -------------------------------------------------------------------------------------------------

const RepositoryFactory = Factory.define<Repository>(
    FactoryType.Repository
).attrs({
    id: () => faker.random.number(),
    name: () => TestUtils.randomWords().join("-"),
    description: () => TestUtils.randomWords().join(" "),
});

// #endregion Factory

// -------------------------------------------------------------------------------------------------
// #region Exports
// -------------------------------------------------------------------------------------------------

export { RepositoryFactory };

// #endregion Exports
