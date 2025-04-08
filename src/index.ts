import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import axios from "axios";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import merge from "lodash/merge.js";

// Dotenv
dotenv.config();

const commonninjaAccountAccessKey =
  process.env.COMMONNINJA_ACCOUNT_ACCESS_TOKEN ||
  ""; // TODO: Remove this
const cnApiBaseUrl = "https://api.commoninja.com/platform/api/v1";

// Create server instance
const server = new McpServer({
  name: "commonninja",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "get-widget",
  "Get widget data by ID",
  {
    widgetId: z.string(),
  },
  async ({ widgetId }) => {
    const response = await axios.get(`${cnApiBaseUrl}/widgets/${widgetId}`, {
      headers: {
        "CN-API-Token": commonninjaAccountAccessKey,
      },
    });

    const { type, data: widgetData } = response.data || {};

    return {
      content: [
        { type: 'text', text: `Widget Type: ${type} \n WidgetData: \n` },
        { type: "text", text: JSON.stringify(widgetData) },
      ],
    };
  }
);

server.tool(
  "get-widget-schema",
  "Get widget schema by type before updating widget data",
  {
    widgetType: z.string(),
  },
  async ({ widgetType }) => {
    const { data: widgetSchema } = await axios.get(
      `${cnApiBaseUrl}/widget-types/${widgetType}/schema`,
      {
        headers: {
          "CN-API-Token": commonninjaAccountAccessKey,
        },
      }
    );

    return {
      content: [{ type: "text", text: JSON.stringify(widgetSchema) }],
    };
  }
);

server.tool(
  "update-widget",
  "Merge current widget data with new partial widget data",
  {
    widgetId: z.string(),
    currentWidgetData: z.object({}).passthrough(),
    nextWidgetData: z.object({}).passthrough(),
  },
  async ({ widgetId, currentWidgetData = {}, nextWidgetData = {} }) => {
    if (!currentWidgetData) {
      throw new Error("Current widget data is required");
    }

    // Delete fields that are not allowed to be updated
    // delete nextWidgetData.localization
    // delete nextWidgetData.deviceRewrites
    // delete nextWidgetData.colorScheme
    delete nextWidgetData.integrations
    delete nextWidgetData.notifications
    delete nextWidgetData.displayRules
    delete nextWidgetData.emailSettings
    delete nextWidgetData.payments
    
    // Deep clone new widget data with current widget data using lodash
    const mergedWidgetData = merge({}, currentWidgetData, nextWidgetData);

    console.log("mergedWidgetData", mergedWidgetData);

    // Note: In a production implementation, we would:
    // 1. Get the widget schema based on widget type
    // 2. Validate the merged data against the schema
    // For now, we'll proceed with the update using the merged data
    await axios.put(
      `${cnApiBaseUrl}/widgets/${widgetId}`,
      { data: mergedWidgetData },
      {
        headers: {
          "CN-API-Token": commonninjaAccountAccessKey,
        },
      }
    );

    return {
      content: [{ type: "text", text: "Widget updated successfully" }],
    };
  }
);

// to support multiple simultaneous connections we have a lookup object from
// sessionId to transport
// const transports: {[sessionId: string]: SSEServerTransport} = {};
// const app = express();

// app.get("/sse", async (_: Request, res: Response) => {
//   const transport = new SSEServerTransport('/messages', res);
//   transports[transport.sessionId] = transport;
//   res.on("close", () => {
//     delete transports[transport.sessionId];
//   });
//   await server.connect(transport);
// });

// app.post("/messages", async (req: Request, res: Response) => {
//   const sessionId = req.query.sessionId as string;
//   const transport = transports[sessionId];
//   if (transport) {
//     await transport.handlePostMessage(req, res);
//   } else {
//     res.status(400).send('No transport found for sessionId');
//   }
// });

// app.listen(process.env.PORT || 3000);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Common Ninja MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
