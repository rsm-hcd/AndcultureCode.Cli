#!/usr/bin/env node

import { CommandRunner } from "./modules/command-runner";
import { StringUtils } from "andculturecode-javascript-core";
import { Constants } from "./modules/constants";
import { Echo } from "./modules/echo";
import { Github } from "./modules/github";
import program from "commander";
import { OptionStringBuilder } from "./utilities/option-string-builder";
import { CommandDefinitions } from "./modules/command-definitions";

CommandRunner.run(async () => {
    // -----------------------------------------------------------------------------------------
    // #region Constants
    // -----------------------------------------------------------------------------------------

    const { ANDCULTURE_CODE } = Constants;
    const ADD_OPTION = new OptionStringBuilder("add <topic>", "a");
    const LIST_OPTION = new OptionStringBuilder("list", "l");
    const REMOVE_OPTION = new OptionStringBuilder("remove <topic>", "r");
    const REPO_OPTION = new OptionStringBuilder("repo <repo>", "R");

    // #endregion Constants

    // -----------------------------------------------------------------------------------------
    // #region Entrypoint
    // -----------------------------------------------------------------------------------------

    program
        .description(CommandDefinitions.github.children.topic.description)
        .option(
            ADD_OPTION.toString(),
            `Add topic to specified repository, or all ${ANDCULTURE_CODE} repositories if no repo provided`
        )
        .option(
            LIST_OPTION.toString(),
            `List topics for a given repo (used in conjunction with ${REPO_OPTION})`
        )
        .option(
            REMOVE_OPTION.toString(),
            `Remove topic from specified repository, or all ${ANDCULTURE_CODE} repositories if no repo provided`
        )
        .option(
            REPO_OPTION.toString(),
            `Repository name to act on (used in conjunction with ${ADD_OPTION} or ${LIST_OPTION}, for example).`
        )
        .parse(process.argv);

    const {
        add: topicToAdd,
        list,
        remove: topicToRemove,
        repo,
    } = program.opts();

    const addTopicToAllRepos =
        StringUtils.hasValue(topicToAdd) && StringUtils.isEmpty(repo);

    const addTopicToRepo =
        StringUtils.hasValue(topicToAdd) && StringUtils.hasValue(repo);

    const listTopicsByRepo = list === true && StringUtils.hasValue(repo);

    const removeTopicFromAllRepos =
        StringUtils.hasValue(topicToRemove) && StringUtils.isEmpty(repo);

    const removeTopicFromRepo =
        StringUtils.hasValue(topicToRemove) && StringUtils.hasValue(repo);

    if (listTopicsByRepo) {
        Echo.success(`Topics for ${repo}`);
        const topicsResult = await Github.topicsForRepository(
            Github.andcultureOrg,
            repo
        );
        Echo.message(topicsResult?.join(", "));
        return;
    }

    if (addTopicToAllRepos) {
        await Github.addTopicToAllRepositories(topicToAdd);
        return;
    }

    if (addTopicToRepo) {
        await Github.addTopicToRepository(
            topicToAdd,
            Github.andcultureOrg,
            repo
        );
        return;
    }

    if (removeTopicFromAllRepos) {
        await Github.removeTopicFromAllRepositories(topicToRemove);
        return;
    }

    if (removeTopicFromRepo) {
        await Github.removeTopicFromRepository(
            topicToRemove,
            Github.andcultureOrg,
            repo
        );
        return;
    }

    // If no valid combination of options were passed in, output help and exit
    program.help();

    // #endregion Entrypoint
});
