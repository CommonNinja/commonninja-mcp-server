# Common Ninja MCP Server

A Model Context Protocol (MCP) server implementation for Common Ninja widgets, allowing AI assistants to interact with the Common Ninja API.

## Prerequisites

- Node.js (v20 or higher)
- npm or yarn package manager
- Common Ninja Account Access Token ([found in the Common Ninja dashboard](https://help.commoninja.com/hc/en-us/articles/21742833539613-How-to-Obtain-Your-Account-Level-API-Key))

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

## MCP Configuration Example

```json
{
  "globalShortcut": "",
  "mcpServers": {
    "commonninja": {
      "command": "node",
      "args": ["/path/to/commonninja-mcp-server/build/index.js"],
      "env": {
        "COMMONNINJA_ACCOUNT_ACCESS_TOKEN": "your_access_token_here"
      }
    }
  }
}
```

Get current path with `process.cwd()`, and use it as the path to the MCP server.

## MCP Server

The MCP server is a Node.js application that listens for MCP connections from the Common Ninja desktop app.

## Available MCP Server Tools

### Widget Management

- **commonninja_get_widget** - Get widget data by ID
- **commonninja_get_widget_schema** - Get widget schema by type before updating widget data
- **commonninja_update_widget** - Merge current widget data with new partial widget data
- **commonninja_list_widgets** - List all widgets in the account with pagination
- **commonninja_create_widget** - Create a new widget with the specified type and data
- **commonninja_delete_widget** - Delete a widget by ID
- **commonninja_get_widget_types** - Get a list of all available widget types

### Project Management

- **commonninja_list_projects** - List all projects with pagination
- **commonninja_get_project** - Get project details by ID

### CRM Tools (Read-only)

- **commonninja_project_list_contacts** - List all project's contacts with pagination
- **commonninja_project_get_contact** - Get project's contact details by ID
- **commonninja_project_list_submissions** - List all project's submissions with pagination
- **commonninja_project_get_submission** - Get project's submission details by ID

### Analytics

- **commonninja_get_widget_analytics** - Get analytics data for a specific widget

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
