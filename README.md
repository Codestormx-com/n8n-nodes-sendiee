# n8n-nodes-sendiee

[n8n](https://n8n.io/) community node for [Sendiee](https://sendiee.com) — WhatsApp Business messaging.

Send WhatsApp template and freeform messages, manage contacts, and handle scheduled messages — without manually configuring HTTP nodes.

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

## Supported Operations

### Message
| Operation | Description |
|-----------|-------------|
| Send Template Message | Send an approved WhatsApp template |
| Send Freeform Message | Send text, image, document, audio, or video |
| Get Message Status | Check delivery status of a sent message |

### Contact
| Operation | Description |
|-----------|-------------|
| Create or Update | Upsert a contact by phone number |
| Get by Phone | Look up a contact by phone |
| Filter | Search contacts by any field |
| List All | Paginated list of all contacts |

### Scheduled Message
| Operation | Description |
|-----------|-------------|
| List | View scheduled messages (filter by status) |
| Get | Get details of a specific scheduled message |
| Cancel | Cancel a pending scheduled message |

## Example Workflows

- **Shopify order confirmed → Send WhatsApp template** with order details
- **Typeform submitted → Upsert contact → Send welcome message**
- **Google Sheets row added → Create Sendiee contact**

## Resources

- [Sendiee API Documentation](https://docs.sendiee.com)
- [n8n Community Nodes Guide](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
