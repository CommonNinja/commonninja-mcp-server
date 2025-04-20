# Common Ninja MCP Server

A Model Context Protocol (MCP) server implementation for Common Ninja widgets, allowing AI assistants to interact with the Common Ninja API.

## Prerequisites

- Node.js (v20 or higher)
- npm or yarn package manager
- Common Ninja Account Access Token

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
      "args": [
        "/path/to/commonninja-mcp-server/build/index.js"
      ],
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
