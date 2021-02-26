import { Factory } from "rosie";
import { FactoryType } from "./factory-type";
import { TestUtils } from "../test-utils";
import { Issue } from "../../interfaces/github/issue";

// -------------------------------------------------------------------------------------------------
// #region Factory
// -------------------------------------------------------------------------------------------------

const IssueFactory = Factory.define<Issue>(FactoryType.Issue).attrs({
    body: TestUtils.randomWords().join(" "),
    id: TestUtils.randomNumber(),
    title: TestUtils.randomWords().join(" "),
});

// #endregion Factory

// -------------------------------------------------------------------------------------------------
// #region Exports
// -------------------------------------------------------------------------------------------------

export { IssueFactory };

// #endregion Exports
