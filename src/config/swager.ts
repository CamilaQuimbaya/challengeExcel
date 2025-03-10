import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Excel Upload API",
      version: "1.0.0",
      description: "API para carga de archivos Excel",
    },
    servers: [{ url: "http://localhost:3000", description: "Servidor local" }],
  },
  apis: ["./src/interfaces/controllers/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  console.log("📌 Configurando Swagger en /api-docs");

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Documentación de la API",
    explorer: true
  }));

  // Endpoint para obtener el JSON
  app.get("/api-docs-json", (req, res) => {
    res.json(swaggerSpec);
  });
}
