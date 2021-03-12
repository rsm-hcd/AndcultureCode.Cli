import { Factory } from "rosie";
import { FactoryType } from "./factory-type";
import { TestUtils } from "../test-utils";
import { CloneIssueSourceDto } from "../../interfaces/github/clone-issue-source-dto";

// -------------------------------------------------------------------------------------------------
// #region Factory
// -------------------------------------------------------------------------------------------------

const CloneIssueSourceDtoFactory = Factory.define<CloneIssueSourceDto>(
    FactoryType.CloneIssueSourceDto
).attrs({
    number: TestUtils.randomNumber(),
    owner: TestUtils.randomWord(),
    repo: TestUtils.randomWords().join("-"),
});

// #endregion Factory

// -------------------------------------------------------------------------------------------------
// #region Exports
// -------------------------------------------------------------------------------------------------

export { CloneIssueSourceDtoFactory };

// #endregion Exports
