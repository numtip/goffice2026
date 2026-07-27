# GO-M365-3 Flow Contract

> **Authoritative Source**: `docs/sharepoint/GO-M365-3-flow-contract.zip`  
> **Extraction Date**: 2026-07-27  
> **Status**: ✅ Extracted from live Power Automate export

---

## Flow Metadata

| Property | Value |
|---|---|
| **Display Name** | GO Metric Approval Workflow |
| **Flow ID (Canonical)** | `40e04977-38cf-42ad-a1e5-bbefbf5cbac1` |
| **Package Resource ID** | `65e382b8-538f-40a9-b102-c4199df03ae3` |
| **Type** | `Microsoft.Flow/flows` |
| **API** | `/providers/Microsoft.PowerApps/apis/shared_logicflows` |
| **Created (UTC)** | `2026-07-26T14:55:04.8552009Z` |
| **Last Modified (UTC)** | `2026-07-26T14:55:04.8552009Z` |
| **Status** | Enabled (On) |
| **isManaged** | `false` |
| **Flow Failure Alert** | Not subscribed (`flowFailureAlertSubscribed: false`) |
| **Provisioning Method** | `FromDefinition` |
| **Creation Source** | `Portal` |
| **Modified Sources** | `Portal` |
| **Client Suspension Reason** | `None` |
| **Flow Charged By Paygo** | `null` |

### Creator

| Property | Value |
|---|---|
| **Creator ID** | `6693e9ff-447f-4998-ba67-72a8791aadf1` |
| **Creator Type** | `User` |
| **Tenant ID** | `8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8` |

### Owner

| Property | Value |
|---|---|
| **Primary Owner** | สำนักวิจัยและส่งเสริมวิชาการการเกษตร (Research and Academic Promotion Office) |
| **Plan** | The user who runs the flow (per-user) |

---

## Trigger

### Manual Trigger (Power Apps Button)

```json
{
  "manual": {
    "type": "Request",
    "kind": "PowerAppV2",
    "inputs": {
      "schema": {
        "type": "object",
        "properties": {},
        "required": []
      }
    }
  }
}
```

**Trigger Properties**:
| Property | Value |
|---|---|
| **Type** | `Request` |
| **Kind** | `PowerAppV2` |
| **Name** | `manual` |
| **Schema Properties** | `{}` (empty — no input parameters defined) |
| **Required Fields** | `[]` (empty — no required inputs) |

**Behaviour**: The flow is activated on-demand by a Power Apps button press. The trigger accepts a JSON object payload but does **not** enforce any schema constraints. Any properties passed by the calling Power Apps app are accepted.

---

## Actions

### Compose Action

```json
{
  "Compose": {
    "runAfter": {},
    "type": "Compose",
    "inputs": "@{triggerBody()?['Action']}"
  }
}
```

**Action Properties**:
| Property | Value |
|---|---|
| **Name** | `Compose` |
| **Type** | `Compose` |
| **runAfter** | `{}` (no dependencies — runs immediately after trigger) |
| **Inputs** | `@{triggerBody()?['Action']}` |

**Action Count**: 1 (one Compose action)

---

## Expressions

### Expression Inventory

| Expression | Location | Purpose |
|---|---|---|
| `@{triggerBody()?['Action']}` | Compose → Inputs | Extracts the `Action` property from the trigger payload using the null-conditional operator (`?.`). If `Action` is absent, returns `null`. |

**Expression Patterns Used**:
- `triggerBody()` — Retrieves the body of the trigger request
- `?['Action']` — Safe property access (returns null if property missing)

**Expression Count**: 1 (single expression in use)

---

## Variables

| Name | Type | Scope | Default | Declared In |
|---|---|---|---|---|
| *None* | — | — | — | — |

**Present**: ❌ No variables defined  
**Observation**: The flow definition does not declare any `variables` block. The `$authentication` parameter is a SecureObject and `$connections` is an Object, but these are system parameters, not flow variables.

---

## Connection References

```json
{}
```

**Present**: ❌ None  
**apisMap.json**: `{}` (empty)  
**connectionsMap.json**: `{}` (empty)  

No API connectors, service endpoints, or authentication references are configured in this flow package. The flow is fully self-contained with no external dependencies.

---

## Environment

| Property | Value |
|---|---|
| **Environment ID** | `Default-8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8` |
| **Environment Name** | Maejo university (default) |
| **Tenant ID** | `8ec74a39-ddf6-41e1-b0a2-ff0459ea8eb8` |
| **Tenant Name** | Maejo365 |
| **Source Environment (Package)** | (empty — no source environment recorded) |

---

## Dependencies

### Package-Level Dependencies

From `manifest.json`:
```json
"dependsOn": []
```

**Present**: ❌ None  
The resource `65e382b8-538f-40a9-b102-c4199df03ae3` declares zero dependencies (`dependsOn: []`). No flows, connectors, solutions, or other resources are required.

### Runtime Dependencies

- **Trigger**: Requires a Power Apps app to invoke (the app is **not included** in this package)
- **Authentication**: `SecureObject` parameter declared but **no default value set** — expects runtime authentication context
- **Connections**: No external services or APIs referenced

---

## Flow Graph

```
                    ┌─────────────────────┐
                    │   Power Apps Button  │
                    │  (External Caller)   │
                    └──────────┬──────────┘
                               │ trigger payload
                               ▼
                    ┌─────────────────────┐
                    │  TRIGGER: manual     │
                    │  Type: Request       │
                    │  Kind: PowerAppV2    │
                    │  Schema: {}          │
                    └──────────┬──────────┘
                               │ triggerBody()
                               ▼
                    ┌─────────────────────┐
                    │  ACTION: Compose     │
                    │  Input:              │
                    │  @{triggerBody()?    │
                    │    ['Action']}       │
                    │  runAfter: {}        │
                    └──────────┬──────────┘
                               │ output
                               ▼
                    ┌─────────────────────┐
                    │      END OF FLOW    │
                    │  (No further steps) │
                    └─────────────────────┘
```

**Graph Summary**:
- **Nodes**: 3 (trigger + 1 action + terminal)
- **Edges**: 2 (trigger → Compose → end)
- **Branching**: None
- **Parallel Paths**: None
- **Loops**: None
- **Conditions**: None

---

## Current Implementation Status

### ✅ Present

- **Trigger definition**: Power App V2 button trigger (`PowerAppV2`)
- **Single Compose action**: Extracts `Action` property from trigger body
- **Package structure**: Complete export package with standard Microsoft Power Automate layout
- **Package manifest**: Valid schema 1.0, correct resource hierarchy

### ❌ Missing

- **No action after Compose**: Flow terminates after extracting the `Action` property — no processing, transformation, or output logic
- **No condition/switch**: No branching based on the extracted Action value
- **No approval steps**: Despite the name "Approval Workflow", no approval actions (e.g., Start and Wait for an Approval) are configured
- **No SharePoint integration**: No SharePoint Create Item, Update Item, or Get Item actions
- **No Office 365 Outlook integration**: No email notifications or approvals
- **No HTTP requests**: No REST API calls or webhook integrations
- **No variable declarations**: No `variables` block defined
- **No parallel branches**: Single linear execution path
- **No error handling**: No `runAfter` failure conditions, no scope/until patterns
- **No connection references**: `apisMap.json` and `connectionsMap.json` are empty objects `{}`
- **No Power Apps caller app**: The triggering Power Apps app is **not included** in this package

### ⚠️ Observations

1. **Incomplete Workflow**: The Compose action is a development placeholder — it reads but does not use the `Action` input. No downstream action processes the composed output.
2. **No Input Schema**: The trigger accepts any payload but enforces no validation (`properties: {}`, `required: []`). The calling app could pass malformed data without flow-side validation.
3. **No Security Context**: `$authentication` parameter is declared as `SecureObject` with an empty default, meaning authentication/identity context is not enforced within the flow.
4. **Content Version**: `"contentVersion": "undefined"` — the workflow definition schema version was not explicitly set during creation.
5. **Created and Modified Timestamps Identical**: `clientLastModifiedTime` equals the creation time, indicating **no edits** were made after initial creation.

---

## Appendix: Raw Data Sources

| File | Path in Package |
|---|---|
| **definition.json** | `Microsoft.Flow/flows/65e382b8-538f-40a9-b102-c4199df03ae3/definition.json` |
| **apisMap.json** | `Microsoft.Flow/flows/65e382b8-538f-40a9-b102-c4199df03ae3/apisMap.json` |
| **connectionsMap.json** | `Microsoft.Flow/flows/65e382b8-538f-40a9-b102-c4199df03ae3/connectionsMap.json` |
| **Root Manifest** | `manifest.json` |
| **Flows Manifest** | `Microsoft.Flow/flows/manifest.json` |
