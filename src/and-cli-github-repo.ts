#!/usr/bin/env node

import { CommandRunner } from "./modules/command-runner";
import { StringUtils } from "andculturecode-javascript-core";
import { Constants } from "./modules/constants";
import { Echo } from "./modules/echo";
import { Github } from "./modules/github";
import program from "commander";
import { CommandDefinitions } from "./modules/command-definitions";
import { OptionStringBuilder } from "./utilities/option-string-builder";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const { ANDCULTURE_CODE } = Constants;
    const LIST_OPTION = new OptionStringBuilder("list", "l");
    const USERNAME_OPTION = new OptionStringBuilder("username <username>", "u");

    // #endregion Constants

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .description(CommandDefinitions.github.children.repo.description)
        .option(LIST_OPTION.toString(), `Lists ${ANDCULTURE_CODE} repos`)
        .option(
            USERNAME_OPTION.toString(),
            `Github username for which to list ${ANDCULTURE_CODE} repositories (used in conjunction with ${LIST_OPTION.option})`
        )
        .parse(process.argv);

    const { list, username } = program.opts();

    const listAndcultureRepos = list === true;
    const listReposByUser =
        listAndcultureRepos && StringUtils.hasValue(username);

    if (listReposByUser) {
        Echo.success(`${program.username}/${ANDCULTURE_CODE} Repositories`);
        Echo.byProperty(
            await Github.repositoriesByAndculture(program.username),
            "url"
        );
        return;
    }

    if (listAndcultureRepos) {
        Echo.success(`${ANDCULTURE_CODE} Repositories`);
        Echo.byProperty(await Github.repositoriesByAndculture(), "url");
        return;
    }

    // If no valid combination of options were passed in, output help and exit
    program.help();

    // #endregion Entrypoint
});
