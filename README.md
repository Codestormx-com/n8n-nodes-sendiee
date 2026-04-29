# n8n-nodes-sendiee

[n8n](https://n8n.io/) community node for [Sendiee](https://sendiee.com) — WhatsApp Business messaging, campaigns, AI assistants, and more via the Sendiee v2.0 API.

Wire workflow events to WhatsApp template / freeform messages, run audience-targeted campaigns, manage contacts and tags, configure AI assistants, and pull chat history — all without configuring HTTP nodes manually.

---

## Installation

In n8n: **Settings → Community Nodes → Install** → search `n8n-nodes-sendiee`

Or via CLI:
```
npm install n8n-nodes-sendiee
```

## Credentials

1. Go to your [Sendiee Dashboard](https://www.sendiee.com/dashboard) → **Settings → API Keys**
2. Copy your API key
3. Copy your WhatsApp Business phone number (full international, no `+`)
4. In n8n: **Credentials → New → Sendiee API** → paste both

## Dynamic dropdowns ✨

Several fields are populated **live from your Sendiee account** so you don't have to paste IDs:

| Field | What it loads | Used in |
|---|---|---|
| **Template Name** | Your APPROVED templates with name + language + category | Message → Send Template, Campaign → Create |
| **Tags** | Your contact tags | Tag → Rename / Delete, Campaign audience |
| **Custom Field** | Your custom field definitions | Custom Field → Update / Delete |
| **Lead Categories** | Your AI lead categories | Contact → Upsert (lead_category) |
| **Campaign** | Your recent campaigns with status | Campaign → Get Report |
| **Assistant** | Your AI assistants with platform + status | Assistant → Toggle |

These call the corresponding `GET /v2.0/...` endpoints when you open the dropdown.

## Supported Operations (v0.3)

### Message
- Send Template Message · Send Freeform Message · Get Message Status

### Contact
- Create or Update · Get by Phone · Filter · List All

### Tag
- List · Create · Rename · Delete

### Custom Field
- List · Create · Update · Delete

### Template
- List · **Create** (strict pre-Meta validation; rate-limited)

### Campaign
- **Preview Audience** (always preview before sending) · **Create** (immediate or scheduled) · **List** · **Get Report** (delivery + engagement + cost breakdown)

### Chat
- **Get History** (cursor-paginated message history for a contact) · **List Conversations** (inbox view)

### Assistant
- **List** (filter by platform / active / connected) · **Toggle** (enable / disable)

> Full assistant CRUD (create, update, restore, history) lives in the dashboard or [sendiee-mcp](https://github.com/Codestormx-com/sendiee-mcp) — those are interactive setup tasks better suited to AI agents than workflow automations. Insights / billing endpoints stay in the dashboard for the same reason.

### Scheduled Message
- List · Get · Cancel

## Example Workflows

- **Shopify order confirmed → Send WhatsApp template** with order details (templateName picker auto-loads APPROVED templates)
- **CRM lead tagged "VIP" → Preview campaign audience → Create campaign** to those VIPs with a personalised template
- **Daily 9 AM cron → List chat conversations → Mirror unread to Slack**
- **Out-of-hours webhook → Toggle assistant → Disable replies** (and re-enable in the morning)
- **Typeform submission → Upsert contact (with loadOptions-driven lead category) → Send welcome template**

## Resources

- [Sendiee API Documentation](https://docs.sendiee.com)
- [Sendiee MCP server](https://github.com/Codestormx-com/sendiee-mcp) — for AI agents (Claude Desktop, Cursor) that need full v2.0 coverage including assistant config, billing, and insights
- [n8n Community Nodes Guide](https://docs.n8n.io/integrations/community-nodes/)

## What's New in v0.3

- 5 new resources: **Tag**, **Custom Field**, **Campaign**, **Chat**, **Assistant**
- Template **Create** operation
- 6 dynamic dropdown loaders (templates, tags, custom fields, lead categories, campaigns, assistants)
- Updated to v2.0 of the Sendiee public API

## License

MIT
