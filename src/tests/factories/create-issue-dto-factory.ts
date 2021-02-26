import { Factory } from "rosie";
import { FactoryType } from "./factory-type";
import { TestUtils } from "../test-utils";
import { CreateIssueDto } from "../../interfaces/github/create-issue-dto";

// -------------------------------------------------------------------------------------------------
// #region Factory
// -------------------------------------------------------------------------------------------------

const CreateIssueDtoFactory = Factory.define<CreateIssueDto>(
    FactoryType.CreateIssueDto
).attrs({
    title: TestUtils.randomWords().join(" "),
    owner: TestUtils.randomWord(),
    repo: TestUtils.randomWords().join("-"),
});

// #endregion Factory

// -------------------------------------------------------------------------------------------------
// #region Exports
// -------------------------------------------------------------------------------------------------

export { CreateIssueDtoFactory };

// #endregion Exports
