# What is this?

This is a simple Github Action that will update the state for a work item in Azure DevOps to a configured state when
the work item is linked to a Pull Request, either by being added to the Pull Request description or in a comment.

## Inputs

## `ado_domain`

Domain to use for Azure DevOps. Defaults to `dev.azure.com`

## `ado_org`

The organisation within Azure DevOps that the work items are in.

## `ado_project`

The project with Azure DevOps that the work items are in.

## `ado_pat`

An Azure DevOps Personal Access Token. The token requires access to read and update work items.

## `in_review_state`

The state that work items will be set to when linked.

## Example Usage

```yml
# Controls when the workflow will run
on:
  pull_request:
    types: [ opened, reopened, edited ]
  pull_request_review_comment:
    types: [ created ]
  issue_comment:
    types: [ created ]

jobs:
  update-ado-state:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: magentah/az-update-linked-work-item@v0.1
        with:
          ado_domain: "dev.azure.com"
          ado_org: "my-ado-organization"
          ado_project: "My ADO Project"
          ado_pat: ${{ secrets.ADO_PAT }}
          reviewed_state: "In Review"
```