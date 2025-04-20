import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import mergeWith from "lodash/mergeWith.js";
import { CommonNinjaApi } from "./services/commonNinjaApi.js";

// Dotenv
dotenv.config();

// Create server instance
const server = new McpServer({
  name: "commonninja",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Get widget data by ID
server.tool(
  "commonninja_get_widget",
  "Get widget data by ID before updating widget data.",
  {
    widgetId: z.string(),
  },
  async ({ widgetId }) => {
    const { type, data: widgetData } = await CommonNinjaApi.getWidget(widgetId);

    return {
      content: [
        { type: "text", text: `Widget Type: ${type} \n WidgetData: \n` },
        { type: "text", text: JSON.stringify(widgetData) },
      ],
    };
  }
);

// Get widget schema by type
server.tool(
  "commonninja_get_widget_schema",
  "Get widget schema by type before updating widget data",
  {
    widgetType: z.string(),
  },
  async ({ widgetType }) => {
    const widgetSchema = await CommonNinjaApi.getWidgetSchema(widgetType);

    return {
      content: [{ type: "text", text: JSON.stringify(widgetSchema) }],
    };
  }
);

// Update widget data
server.tool(
  "commonninja_update_widget",
  "Merge current widget data with new partial widget data. For arrays, always return the new array.",
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
    // delete nextWidgetData.displayRules;
    delete nextWidgetData.integrations;
    delete nextWidgetData.notifications;
    delete nextWidgetData.emailSettings;
    delete nextWidgetData.payments;

    // Deep clone new widget data with current widget data using lodash
    const customMerge = (objValue: any, srcValue: any) => {
      if (Array.isArray(srcValue)) {
        // Combine arrays, avoid duplicates (optional)
        return srcValue;
      }
    };
    const mergedWidgetData = mergeWith(
      {},
      currentWidgetData,
      nextWidgetData,
      customMerge
    );

    await CommonNinjaApi.updateWidget(widgetId, mergedWidgetData);

    return {
      content: [{ type: "text", text: "Widget updated successfully" }],
    };
  }
);

// Get widget editor URL
server.tool(
  "commonninja_get_widget_editor_url",
  "Get the editor URL for a widget",
  { widgetId: z.string() },
  async ({ widgetId }) => {
    const editorUrl = await CommonNinjaApi.getWidgetEditorUrl(widgetId);

    return {
      content: [{ type: "text", text: JSON.stringify(editorUrl) }],
    };
  }
);

// Get widget embed code
server.tool(
  "commonninja_get_widget_embed_code",
  "Get the embed code for a widget",
  { widgetId: z.string() },
  async ({ widgetId }) => {
    const embedCode = await CommonNinjaApi.getWidgetEmbedCode(widgetId);

    return {
      content: [{ type: "text", text: JSON.stringify(embedCode) }],
    };
  }
);

// List all widgets
server.tool(
  "commonninja_list_widgets",
  "List all widgets in the account with pagination",
  {
    page: z.number().optional().default(1),
    limit: z.number().optional().default(20),
    projectId: z.string().optional().default(""),
    search: z.string().optional().default(""),
    type: z.string().optional().default(""),
  },
  async ({ page, limit, projectId, search, type }) => {
    const widgets = await CommonNinjaApi.listWidgets(
      page,
      limit,
      projectId,
      search,
      type
    );

    return {
      content: [
        { type: "text", text: "Widgets List:" },
        { type: "text", text: JSON.stringify(widgets, null, 2) },
      ],
    };
  }
);

// Create a new widget
server.tool(
  "commonninja_create_widget",
  "Create a new widget with the specified type and data. Optional props with an object type under `styles` should be empty or populated objects.",
  {
    widgetType: z.string(),
    widgetData: z.object({}).passthrough(),
    name: z.string().optional().default("My Widget"),
    projectId: z.string().optional().default(""),
  },
  async ({ widgetType, widgetData, name, projectId }) => {
    const result = await CommonNinjaApi.createWidget(
      widgetType,
      widgetData,
      name,
      projectId
    );

    return {
      content: [
        { type: "text", text: "Widget created successfully:" },
        { type: "text", text: JSON.stringify(result, null, 2) },
      ],
    };
  }
);

// Delete a widget - For now, we don't want to delete widgets
// server.tool(
//   "commonninja_delete_widget",
//   "Delete a widget by ID",
//   {
//     widgetId: z.string(),
//   },
//   async ({ widgetId }) => {
//     await CommonNinjaApi.deleteWidget(widgetId);

//     return {
//       content: [
//         { type: "text", text: `Widget ${widgetId} deleted successfully` },
//       ],
//     };
//   }
// );

// Get available widget types
server.tool(
  "commonninja_get_widget_types",
  "Get a list of all available widget types",
  {},
  async () => {
    const widgetTypes = await CommonNinjaApi.getWidgetTypes();

    return {
      content: [
        { type: "text", text: "Available Widget Types:" },
        { type: "text", text: JSON.stringify(widgetTypes, null, 2) },
      ],
    };
  }
);

// PROJECT TOOLS

// List all projects
server.tool(
  "commonninja_list_projects",
  "List all projects with pagination",
  {
    page: z.number().optional().default(1),
    limit: z.number().optional().default(20),
  },
  async ({ page, limit }) => {
    const projects = await CommonNinjaApi.getProjects(page, limit);

    return {
      content: [
        { type: "text", text: "Projects List:" },
        { type: "text", text: JSON.stringify(projects, null, 2) },
      ],
    };
  }
);

// Get project by ID
server.tool(
  "commonninja_get_project",
  "Get project details by ID",
  {
    projectId: z.string(),
  },
  async ({ projectId }) => {
    const project = await CommonNinjaApi.getProject(projectId);

    return {
      content: [
        { type: "text", text: "Project Details:" },
        { type: "text", text: JSON.stringify(project, null, 2) },
      ],
    };
  }
);

// CRM TOOLS - READ ONLY

// List all contacts
server.tool(
  "commonninja_project_list_contacts",
  "List all project's contacts with pagination",
  {
    projectId: z.string(),
    page: z.number().optional().default(1),
    limit: z.number().optional().default(20),
  },
  async ({ projectId, page, limit }) => {
    const contacts = await CommonNinjaApi.getContacts(projectId, page, limit);

    return {
      content: [
        { type: "text", text: "Contacts List:" },
        { type: "text", text: JSON.stringify(contacts, null, 2) },
      ],
    };
  }
);

// Get contact by ID
server.tool(
  "commonninja_project_get_contact",
  "Get project's contact details by ID",
  {
    projectId: z.string(),
    contactId: z.string(),
  },
  async ({ projectId, contactId }) => {
    const contact = await CommonNinjaApi.getContact(projectId, contactId);

    return {
      content: [
        { type: "text", text: "Contact Details:" },
        { type: "text", text: JSON.stringify(contact, null, 2) },
      ],
    };
  }
);

// List all submissions
server.tool(
  "commonninja_project_list_submissions",
  "List all project's submissions with pagination",
  {
    projectId: z.string(),
    page: z.number().optional().default(1),
    limit: z.number().optional().default(20),
    widgetId: z.string().optional().default(""),
  },
  async ({ projectId, page, limit, widgetId }) => {
    const submissions = await CommonNinjaApi.getSubmissions(
      projectId,
      page,
      limit,
      widgetId
    );

    return {
      content: [
        { type: "text", text: "Submissions List:" },
        { type: "text", text: JSON.stringify(submissions, null, 2) },
      ],
    };
  }
);

// Get submission by ID
server.tool(
  "commonninja_project_get_submission",
  "Get project's submission details by ID",
  {
    projectId: z.string(),
    submissionId: z.string(),
  },
  async ({ projectId, submissionId }) => {
    const submission = await CommonNinjaApi.getSubmission(
      projectId,
      submissionId
    );

    return {
      content: [
        { type: "text", text: "Submission Details:" },
        { type: "text", text: JSON.stringify(submission, null, 2) },
      ],
    };
  }
);

// ANALYTICS TOOLS - WIDGET LEVEL ONLY

// Get widget analytics
server.tool(
  "commonninja_get_widget_analytics",
  "Get analytics data for a specific widget",
  {
    widgetId: z.string(),
    from: z.string().optional().default(""),
    to: z.string().optional().default(""),
    breakdown: z.enum(["day", "week", "month"]).optional().default("day"),
    events: z.array(z.string()).optional().default([]),
  },
  async ({ widgetId, from, to, breakdown, events }) => {
    const analytics = await CommonNinjaApi.getWidgetAnalytics(
      widgetId,
      from,
      to,
      breakdown,
      events
    );

    return {
      content: [
        {
          type: "text",
          text: `Analytics for widget ${widgetId} (from: ${from}, to: ${to}, breakdown: ${breakdown}, events: ${events}):`,
        },
        { type: "text", text: JSON.stringify(analytics, null, 2) },
      ],
    };
  }
);

server.tool(
  "commonninja_links",
  "Get common platform links",
  {
    type: z
      .enum([
        "dashboard",
        "account",
        "billing",
        "feature-requests",
        "projects",
        "project-management",
        "website",
        "contact",
        "support",
        "help-center",
      ])
      .optional()
      .default("website"),
  },
  async ({ type }) => {
    const links = {
      dashboard: "https://www.commoninja.com/dashboard",
      account: "https://www.commoninja.com/account",
      billing: "https://www.commoninja.com/billing",
      "feature-requests": "https://www.commoninja.com/feature-requests",
      projects: "https://www.commoninja.com/projects",
      "project-management": "https://www.commoninja.com/project/{PROJECT_ID}",
      website: "https://www.commoninja.com",
      contact: "https://www.commoninja.com/contact-us",
      support: "https://www.commoninja.com/contact-us",
      "help-center": "https://help.commoninja.com",
    };

    return {
      content: [{ type: "text", text: `Link to ${type}: ${links[type]}` }],
    };
  }
);

// SSE Server

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

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

// ------------------------------------------------------------------------------------------------

// STDIO
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Common Ninja MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
