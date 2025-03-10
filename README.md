# 🚀 Challenge Backend - Carga y Procesamiento de Archivos Excel

Este proyecto es un **servicio backend en Node.js** que permite **cargar archivos Excel, validarlos y procesarlos** de manera eficiente mediante **mensajería con RabbitMQ** y **almacenamiento en MongoDB**.  
Utiliza **TypeScript, Express, Mongoose y RabbitMQ** para manejar grandes volúmenes de datos sin afectar la interfaz HTTP.

---

## 📂 **Estructura del Proyecto**

```
📂 challengeExcel/
│🌐 📂 src/
│   │🌐 📂 application/                # Lógica de aplicación
│   │   │🌐 📚 QueueService.ts         # Servicio para manejar RabbitMQ
│   │   │🌐 📚 TaskService.ts          # Servicio para procesar los Task
│   │   │🌐 📚 ExcelProcessor.ts       # Servicio para procesar el archivo de excel
│   │   │🌐 📚 ExcelValidator.ts       # Servicio para validar los campos del archivo
│   │🌐 📂 config/                     # Configuración general
│   │   │🌐 📚 env.ts                   # Variables de entorno
│   │   │🌐 📚 database.ts              # Conexión a MongoDB
│   │   │🌐 📚 logger.ts                # Logger con Winston
│   │   │🌐 📚 swagger.ts               # Configuración de Swagger
│   │🌐 📂 domain/                      # Entidades y modelos de negocio
│   │🌐 📂 infrastructure/               # Implementaciones específicas
│   │🌐 📂 interfaces/                   # Interfaces de la aplicación (API, middleware)
│   │🌐 📂 tests/                        # Tests automatizados
🌐 📚 server.ts                         # Punto de entrada principal
🌐 📚 package.json                       # Dependencias del proyecto
🌐 📚 README.md                          # Documentación del proyecto
🌐 📂 uploads/                           # Carpeta donde se guardan los archivos subidos
```

---

## ⚙️ **Requisitos Previos**
Antes de instalar el proyecto, asegúrate de tener **los siguientes servicios en ejecución**:

1. **MongoDB** (Base de datos)
   ```bash
   mongod --dbpath /ruta-a-tu-base-de-datos
   ```
2. **RabbitMQ** (Broker de mensajería)
   ```bash
   rabbitmq-server
   ```
3. **Configurar almacenamiento para archivos subidos**
   - **Modo local (desarrollo):** Se usará la carpeta `uploads/` en la raíz del proyecto.
     ```bash
     mkdir uploads
     ```
     ⚠️ Esta carpeta se usa para almacenar los archivos subidos y debe existir antes de ejecutar el servidor.
   - **Modo producción (servidor en la nube):** Se recomienda usar un servicio de almacenamiento externo como **AWS S3**, **Google Cloud Storage** o **Azure Blob Storage**. En este caso, se debe hacer la integración correspondiente con el servicio seleccionado y configurar la variable de entorno adecuada para indicar el destino de los archivos subidos.
     
     ⚠️ **Para el objetivo de este proyecto, solo se usará el almacenamiento local** y no se incluirá la integración con servicios de almacenamiento en la nube.

---

## 🛠️ **Instalación**
Sigue estos pasos para instalar y ejecutar el proyecto:

### 1️⃣ **Clonar el Repositorio**
```bash
git clone https://github.com/CamilaQuimbaya/challengeExcel.git
cd challenge-excel
```

### 2️⃣ **Instalar Dependencias**
```bash
yarn install
```
o con npm:
```bash
npm install
```

### 3️⃣ **Configurar Variables de Entorno**
Crea un archivo **`.env`** en la raíz del proyecto con el siguiente contenido:

```ini
MONGO_URL=mongodb://localhost:27017/excelDB
RABBITMQ_URL=amqp://localhost:5672
PORT=3000
UPLOADS_PATH=uploads/
LOG_LEVEL=info
```

---

## 🚀 **Ejecución del Proyecto**
⚠️ **El orden de ejecución es importante**:  
1. **Levantar el Worker de RabbitMQ**  
   ```bash
   yarn start-mq
   ```

2. **Levantar el Servidor Express**  
   ```bash
   yarn start
   ```

💡 Ahora puedes acceder a la API en **`http://localhost:3000`**.

---

## 📌 **Endpoints Principales**
Los endpoints están documentados en **Swagger**.  
Abre en el navegador:

🔗 **`http://localhost:3000/api-docs`**

---

## 📦 **Dependencias Utilizadas**
El proyecto usa las siguientes librerías y herramientas:

| Dependencia | Propósito |
|------------|----------|
| **express** | Framework web para Node.js |
| **mongoose** | ODM para manejar MongoDB |
| **amqplib** | Cliente RabbitMQ para Node.js |
| **multer** | Middleware para manejar archivos en Express |
| **xlsx** | Procesamiento de archivos Excel |
| **winston** | Logging avanzado |
| **swagger-jsdoc** | Generación automática de documentación Swagger |
| **swagger-ui-express** | Interfaz visual para Swagger |
| **dotenv** | Carga de variables de entorno |
| **jest** | Testing automatizado |
| **supertest** | Pruebas de integración con Express |

---



---

## 🔧 **Consideraciones Finales**
👉 **Escalabilidad**: Arquitectura basada en **Clean Architecture**.  
👉 **Performance**: Uso de **RabbitMQ** para manejar tareas pesadas en segundo plano.  
👉 **Validación y Documentación**: Uso de **Swagger**, validaciones y testing.  

💡 **Contribuciones y mejoras son bienvenidas**. 🚀🔥

---

## 🛠️ **Autor**
👉 **Laura Camila Quimbaya Hernandez**  
🔗 GitHub: [CamilaQuimbaya]([https://github.com/tu-usuario](https://github.com/camilaquimbaya))

---

🚀 **¡Listo para procesar archivos Excel de forma eficiente!** 🏆

