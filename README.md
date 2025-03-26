# Docker / React/Vite + Node.js + MySQL

This template provides a minimal setup to get React working with Node.js and MySQL in Docker.

## :penguin: 1.0 Install Docker on Ubuntu

### 1.1 Update packages and install dependencies

```sh
$ sudo apt update && sudo apt upgrade -y
$ sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
```

### 1.2 Add the official Docker repository

```sh
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
$ echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 1.3 Install Docker

```sh
$ sudo apt update
$ sudo apt install -y docker-ce docker-ce-cli containerd.io
```

### 1.4 Verify the installation / Enable Docker

```sh
$ sudo systemctl enable docker
$ sudo systemctl start docker
$ sudo docker --version
```

### 1.5 Add user to the Docker group (Optional, avoids using sudo)

```sh
$ sudo usermod -aG docker $USER
$ newgrp docker
```

## :whale2: 2.0 Install Docker Compose

```sh
$ sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
$ docker-compose --version
```

## :penguin: 3.0 Install Node.js and npm on Ubuntu

### 3.1 Update packages and install dependencies

```sh
$ curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
$ sudo apt install -y nodejs
```

### 3.2 Verify installation

```sh
$ node -v
$ npm -v
```

## :whale2: 4.0 Create the Docker environment with React, Node.js and MySQL

### 4.1 Create Project Structure

```sh
$ mkdir docker-react
$ cd docker-react
```

## :arrow_upper_right: 5.0 Set Up Frontend (React with Vite)

### 5.1 Install Vite and Dependencies

```sh
$ npm create vite@latest frontend --template react
$ cd frontend
$ npm install
```

### 5.2 Install Material UI

```sh
$ npm install @mui/material @emotion/react @emotion/styled
```

### 5.3 Update frontend/vite.config.js to ensure proper hot-reloading inside Docker

```sh
export default {
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true, // Fixes hot reload issues in Docker
    },
  },
};
```

## :arrow_lower_right: 6.0 Set Up Backend (Node.js with Express)

### 6.1 Create Backend Folder

```sh
$ cd ..
$ mkdir backend && cd backend
$ npm init -y
```

### 6.2 Create Backend Folder

```sh
$ npm install express cors dotenv mysql2
```

### 6.3 Create .env File in backend/

```sh
DB_HOST=mysql
DB_PORT=3306
DB_USER=user
DB_PASSWORD=password123
DB_NAME=my_database
```

### 6.4 Create backend/server.js

```sh
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.get("/customers", (req, res) => {
  db.query("SELECT * FROM customers", (err, results) => {
    if (err) {
      res.status(500).send("Error fetching customers");
      return;
    }
    res.json(results);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 6.4 Create backend/db.js

```sh
const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL!");
});

module.exports = connection;
```

## :whale2: 7.0 Create docker-compose.yml in the root project folder

### 7.1 Create Backend Folder

```sh
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - mysql
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev
    environment:
      - CHOKIDAR_USEPOLLING=true
      - WATCHPACK_POLLING=true
    restart: always

  mysql:
    image: mysql:8
    container_name: mysql_container
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: my_database
      MYSQL_USER: user
      MYSQL_PASSWORD: password123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## :whale2: 8.0 Create Dockerfiles

### 8.1 Backend Dockerfile (backend/Dockerfile)

```sh
FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### 8.2 Frontend Dockerfile (frontend/Dockerfile)

```sh
FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

## :whale2: 9.0 Run the Project in Docker

### 9.1 Build and Start Containers

```sh
$ docker-compose up --build
```

## :x: 10.0 Stop and Remove Containers

### 10.1 To stop the containers

```sh
$ docker-compose down
```

### 10.2 To remove everything (including volumes)

```sh
$ docker-compose down -v
```
