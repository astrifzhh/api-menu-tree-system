# 🌳 API Menu Tree System

## Overview

This repository hosts the backend API for a hierarchical menu management system, built using the **NestJS** framework. This system allows for the creation, retrieval, updating, deletion, and, crucially, the reordering and movement of nested menu items. The application utilizes a custom Tree structure implementation backed by a **MySQL** database.

## 🚀 Getting Started

### Prerequisites

You need the following installed on your local machine:

* [Node.js](https://nodejs.org/) (version 18 or later is recommended)
* [npm](https://www.npmjs.com/) (usually comes with Node.js)
* **MySQL Database Instance**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [Your Repository URL]
    cd api-menu-tree-system
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a file named `.env` in the root directory and configure your database and port settings. You can use the provided `.env.example` as a template.

    ```bash
    # .env file example
    PORT=3000
    
    # MySQL Database Configuration
    DATABASE_TYPE=mysql
    DATABASE_HOST=localhost
    DATABASE_PORT=3306
    DATABASE_USERNAME=root
    DATABASE_PASSWORD=password
    DATABASE_NAME=menu_db
    ```

### Running the App

| Command | Description | Notes |
| :--- | :--- | :--- |
| `npm run start:dev` | Runs the application in **development mode** (watch mode with hot reload). | Uses `ts-node` for execution. |
| `npm run build` | Compiles the TypeScript source code into JavaScript in the `dist/` directory. | Required before running in production mode. |
| `npm run start` | Runs the **compiled application** from the `dist/` folder (Production mode). |

---

## 💻 API Endpoints

The base URL for all API interactions is assumed to be `/api`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/menus` | Get all menu items, typically returned in a nested/tree format. |
| **GET** | `/api/menus/:id` | Get a single menu item by its unique ID. |
| **POST** | `/api/menus` | Create a new menu item. |
| **PUT** | `/api/menus/:id` | Update an existing menu item. |
| **DELETE** | `/api/menus/:id` | Delete a menu item and **recursively deletes all of its children.** |
| **PATCH** | `/api/menus/:id/move` | **Move** menu item to a new parent node. |
| **PATCH** | `/api/menus/:id/reorder` | **Reorder** menu item within its current parent (same level). |

### Example: Moving a Menu Item

To move menu item with `ID=101` to be a child of menu item with `ID=50`:

```bash
PATCH /api/menus/101/move
Content-Type: application/json

{
    "newParentId": 50
}
