import * as core from "@actions/core"

export interface InputVariables {
    azureDomain: string;
    azureOrg: string;
    azureProject: string;
    azurePersonalAccessToken: string;
    inReviewState: string;
}

export function loadInputVariables(): InputVariables {
    return {
        azureDomain: core.getInput("ado_domain", {required: true}),
        azureOrg: core.getInput("ado_org", {required: true}),
        azureProject: core.getInput("ado_project", {required: true}),
        azurePersonalAccessToken: core.getInput("ado_pat", {required: true}),
        inReviewState: core.getInput("in_review_state", {required: true})
    };
}