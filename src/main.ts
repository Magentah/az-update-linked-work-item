import * as github from "@actions/github"
import {WorkItem} from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import {JsonPatchDocument} from "azure-devops-node-api/interfaces/common/VSSInterfaces";
import * as az from "azure-devops-node-api";
import {IWorkItemTrackingApi} from "azure-devops-node-api/WorkItemTrackingApi";
import {WebhookPayload} from "@actions/github/lib/interfaces";
import {loadInputVariables} from "./inputVariables";

async function run(): Promise<void> {
    let context = github.context;

    const isReview = !!context.payload.pull_request || !!context.payload.comment;

    if (!isReview) {
        console.log("Not a pull request, push or a comment, skipping.");
        return;
    }

    if (context.payload.action !== "opened" &&
        context.payload.action !== "reopened" &&
        context.payload.action !== "edited" &&
        context.payload.action !== "created") {
        console.log("Pull request was not opened, reopened or edited, or comment was not created. Skipping.");
        return;
    }

    let workItemIds: number[];
    workItemIds = getWorkItemIds(context.payload);

    if (!workItemIds || (workItemIds && workItemIds.length === 0)) {
        console.log("No work item IDs found. Skipping");
        return;
    }

    const inputVariables = loadInputVariables();
    let adoAuthHandler = az.getPersonalAccessTokenHandler(inputVariables.azurePersonalAccessToken);
    let connection = new az.WebApi(
        `https://${inputVariables.azureDomain}/${inputVariables.azureOrg}`,
        adoAuthHandler);

    let adoWorkItemTrackingClient: IWorkItemTrackingApi = await connection.getWorkItemTrackingApi();
    console.log(`Getting work items from Azure.`);
    let workItems: Array<WorkItem> = await adoWorkItemTrackingClient.getWorkItems(
        workItemIds,
        undefined,
        undefined,
        undefined,
        undefined,
        inputVariables.azureProject);

    console.log(`Got ${workItems.length} work items. Updating status.`);
    for (const workItem of workItems) {
        let patch: JsonPatchDocument = [{
            "op": "replace",
            "path": "/fields/System.State",
            "value": inputVariables.inReviewState
        }]
        await adoWorkItemTrackingClient.updateWorkItem(undefined, patch, workItem.id, inputVariables.azureProject);
    }
    console.log(`Finished updating work item status to '${inputVariables.inReviewState}'.`)
}

function getWorkItemIds(payload: WebhookPayload): number[] {
    let workItemIds: number[];
    let comment: string;

    if (payload.pull_request) {
        comment = payload.pull_request.body;
    } else if (payload.comment) {
        comment = payload.comment.body;
    }

    // Need to split as Azure APIs require just the number for work items.
    let workItemIdMatch = comment.match(/AB#\d*/);
    if (workItemIdMatch && workItemIdMatch.length > 0) {
        workItemIds = workItemIdMatch.map((match: string): number => {
            return parseInt(match.split("#")[1]);
        });
    }

    return workItemIds;
}

run();