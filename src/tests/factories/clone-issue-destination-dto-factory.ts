import { Factory } from "rosie";
import { FactoryType } from "./factory-type";
import { TestUtils } from "../test-utils";
import { CloneIssueDestinationDto } from "../../interfaces/github/clone-issue-destination-dto";

// -------------------------------------------------------------------------------------------------
// #region Factory
// -------------------------------------------------------------------------------------------------

const CloneIssueDestinationDtoFactory = Factory.define<
    CloneIssueDestinationDto
>(FactoryType.CloneIssueDestinationDto).attrs({
    owner: TestUtils.randomWord(),
    repo: TestUtils.randomWords().join("-"),
});

// #endregion Factory

// -------------------------------------------------------------------------------------------------
// #region Exports
// -------------------------------------------------------------------------------------------------

export { CloneIssueDestinationDtoFactory };

// #endregion Exports
