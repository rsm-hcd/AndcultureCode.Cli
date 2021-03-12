#!/usr/bin/env node

import { CommandRunner } from "./modules/command-runner";
import { CollectionUtils, StringUtils } from "andculturecode-javascript-core";
import { Echo } from "./modules/echo";
import { Github } from "./modules/github";
import program from "commander";
import { OptionStringBuilder } from "./utilities/option-string-builder";
import { Issue } from "./interfaces/github/issue";
import { table } from "table";
import { CreateIssueDto } from "./interfaces/github/create-issue-dto";
import { Prompt } from "./modules/prompt";
import shell from "shelljs";
import { Formatters } from "./modules/formatters";
import { CloneIssueSourceDto } from "./interfaces/github/clone-issue-source-dto";
import { CloneIssueDestinationDto } from "./interfaces/github/clone-issue-destination-dto";
import { CommandDefinitions } from "./modules/command-definitions";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const REPO_ISSUE_EXAMPLE = "repo#issue";

    const ADD_OPTION = new OptionStringBuilder("add", "a");
    const BODY_OPTION = new OptionStringBuilder("body <body>", "b");
    const CLONE_FROM_OPTION = new OptionStringBuilder(
        `clone-from <${REPO_ISSUE_EXAMPLE}>`,
        "c"
    );
    const LIST_OPTION = new OptionStringBuilder("list", "l");
    const REPO_OPTION = new OptionStringBuilder("repo <repo>", "R");
    const TITLE_OPTION = new OptionStringBuilder("title <title>", "t");

    // #endregion Constants

    // -----------------------------------------------------------------------------------------
    // #region Functions
    // -----------------------------------------------------------------------------------------

    const clone = async (cloneFrom: string, destinationRepo?: string) => {
        validatePatternOrExit(cloneFrom);

        if (StringUtils.isEmpty(destinationRepo)) {
            destinationRepo = await Prompt.questionAsync(
                "What repository should this issue be cloned to? "
            );
        }

        const [sourceRepo, sourceNumber] = cloneFrom.split("#");

        const sourceIssue: CloneIssueSourceDto = {
            number: Number(sourceNumber),
            owner: Github.andcultureOrg,
            repo: sourceRepo,
        };
        const destinationIssue: CloneIssueDestinationDto = {
            owner: Github.andcultureOrg,
            repo: destinationRepo,
        };

        const clonedIssue = await Github.cloneIssueToRepository(
            sourceIssue,
            destinationIssue
        );

        if (clonedIssue == null) {
            shell.exit(1);
        }

        printCloneSuccess(sourceIssue, destinationIssue, clonedIssue);
    };

    const dtoHasRequiredFields = (
        dto: Partial<CreateIssueDto>
    ): dto is CreateIssueDto => {
        const { repo, title, body } = dto;
        return (
            StringUtils.hasValue(repo) &&
            StringUtils.hasValue(title) &&
            StringUtils.hasValue(body)
        );
    };

    const print = (repo: string, issues?: Issue[]): void => {
        if (CollectionUtils.isEmpty(issues)) {
            Echo.message("No issues found.");
            return;
        }

        const tableHeader = [["Issue #", "Title", "Opened by"]];
        const tableData = issues.map((issue: Issue) => [
            `#${issue.number}`,
            issue.title,
            issue.user.login,
        ]);

        Echo.success(`Issues for ${repo}`);
        Echo.message(table(tableHeader.concat(tableData)), false);
        Echo.message(`Total: ${issues.length}`);
    };

    const printCloneSuccess = (
        source: CloneIssueSourceDto,
        destination: CloneIssueDestinationDto,
        cloned: Issue
    ) => {
        const sourceIssueMessage = Formatters.yellow(
            `${source.repo}#${source.number} - '${cloned.title}'`
        );
        const clonedIssueMessage = Formatters.green(
            `${destination.repo}#${cloned.number}`
        );
        Echo.message(
            `${sourceIssueMessage} successfully cloned to ${clonedIssueMessage}.`
        );
        Echo.message(cloned.html_url);
    };

    const promptForNewFields = async (
        dto: Partial<CreateIssueDto>
    ): Promise<CreateIssueDto> => {
        if (dtoHasRequiredFields(dto)) {
            return dto;
        }

        if (StringUtils.isEmpty(dto.repo)) {
            dto.repo = await Prompt.questionAsync(
                "What repository should this issue be added to? "
            );
        }

        dto.owner = Github.andcultureOrg;

        if (StringUtils.isEmpty(dto.title)) {
            dto.title = await Prompt.questionAsync(
                "Enter a title for this issue: "
            );
        }

        if (StringUtils.hasValue(dto.body)) {
            // Replace escaped new lines/tabs w/ actual chars
            dto.body = dto.body.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
        }

        if (StringUtils.isEmpty(dto.body)) {
            const terminatorPhrase = "/end";
            dto.body = (
                await Prompt.multiline(
                    `Enter a body for this issue: ('${terminatorPhrase}' to finish input)`,
                    terminatorPhrase
                )
            ).join("\n");
        }

        return dto as CreateIssueDto;
    };

    const validatePatternOrExit = (value: string): boolean | never => {
        if (value.match(`${Github.andcultureOrg}.*#[0-9]+`)) {
            return true;
        }

        Echo.error(
            `Value provided for ${CLONE_FROM_OPTION.option} does not match an ${Github.andcultureOrg} ${REPO_ISSUE_EXAMPLE} pattern.`
        );

        shell.exit(1);
    };

    // #endregion Functions

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .description(CommandDefinitions.github.children.issue.description)
        .option(
            ADD_OPTION.toString(),
            `Add issue to a repository (optionally used in conjunction with ${REPO_OPTION.option}, ${TITLE_OPTION.option}, and ${BODY_OPTION.option})`
        )
        .option(
            CLONE_FROM_OPTION.toString(),
            `Clone an existing issue to the target repo (used in conjunction with ${REPO_OPTION.option})`
        )
        .option(
            BODY_OPTION.toString(),
            `Set the body for an issue to be created with ${ADD_OPTION.option} (will be prompted if not provided via cli)`
        )
        .option(
            LIST_OPTION.toString(),
            `List issues for a given repo (used in conjunction with ${REPO_OPTION.option})`
        )
        .option(
            REPO_OPTION.toString(),
            `Repository name to act on (used in conjunction with ${ADD_OPTION.option} or ${LIST_OPTION.option}, for example)`
        )
        .option(
            TITLE_OPTION.toString(),
            `Set the title for an issue to be created with ${ADD_OPTION.option} (will be prompted if not provided via cli)`
        )
        .parse(process.argv);

    const {
        add: addIssue,
        body,
        cloneFrom,
        list,
        title,
        repo,
    } = program.opts();

    const cloneIssueFromRepo = StringUtils.hasValue(cloneFrom);
    const listIssuesByRepo = list === true && StringUtils.hasValue(repo);

    if (listIssuesByRepo) {
        const issues = await Github.getIssues(Github.andcultureOrg, repo);
        print(repo, issues);
        return;
    }

    if (addIssue === true) {
        const dto = await promptForNewFields({ repo, body, title });
        const issue = await Github.addIssueToRepository(dto);
        if (issue == null) {
            shell.exit(1);
        }

        Echo.success(
            `Issue #${issue.number} - '${issue.title}' successfully created.`
        );
        Echo.message(issue.html_url);

        return;
    }

    if (cloneIssueFromRepo) {
        await clone(cloneFrom, repo);
        return;
    }

    // If no valid combination of options were passed in, output help and exit
    program.help();

    // #endregion Entrypoint
});
