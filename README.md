# Clients App

# Table of Contents
- [Clients app](#clients-app)
- [Table of contents](#table-of-contents)
    - [Introduction](#introduction)
    - [Techstack](#techstack)
    - [Usage](#usage)
    - [Containers](#containers-dependencies)
    - [Request flow](#request-flow)
    - [Project structure](#project-structure)
- [Code](#code)
    - [Hasura definition](#hasura-definition)
      - [Hasura authentication](#hasura-authentication)
      - [Webhook](#webhook)
    - [Refine](#refine)
      - [Resources](#resources)
      - [Resoieces file structure](#resource-file-structure)
      - [Refine authencation](#refine-authetication)
    - [Ory/Kratos](#orykratos)
      - [Identity definition](#identity-definition)
      - [Kratos cinfiguration](#kratos-config)
- [Conclusion](#conclusion)


## Introduction

**The simple project shows how to setup ory/kratos auth for Hasura**


## Techstack

- [Ory/Kratos](https://www.ory.sh/docs/welcome) - Headless and configurable authentication and user management.
- [Refine](https://www.ory.sh/docs/welcome) - React-based framework for the rapid ✨ development of web applications.
- [Hasura](https://hasura.io/) - Instant GraphQL on all your data
- [PostgreSQL]() - PostgreSQL is a powerful, open source object-relational database system 

## Usage

Download the app 
`git clone https://github.com/DashBouquet/ClientsApp.git`

Go to the root folder

`cd ClientsApp`

`npm run preinstall` for install all dependencies for `webhook` and `refine`

run `docker-compose up`

## Containers dependencies

```mermaid
flowchart LR

postgres[(Postgres)]
hasura[Hasura]
refine[Refine]
webhook
kratos[Ory/Kratos]
    refine --->|Get data| hasura
    hasura ---> postgres
    hasura --->|Authetication| webhook
    refine --->|Authentication| kratos
    webhook --->|Check session is valid| kratos
    
```

## Request flow

```mermaid
flowchart TB

hasura[Hasura]
refine[Refine]
webhook
kratos[Ory/Kratos]
    refine --->|Send request with ory_kratos_session cookie| hasura
    hasura --->|Request auth hook with req headers| webhook
    webhook --->|User info if session is resolved| hasura
    webhook --->|Check session is valid| kratos
```

## Project structure

```
ClientsApp
├── docker/
│   ├── Dockerfile.refine
│   │ 
│   ├── Dockerfile.webhook
│   │
├── hasura/                            //constains hasura metadata
│   │
├── refine/
│   └── src/
│   └── public/
│   └── package.json
│   └── tsconfig.json
│   
├── kratos/
│   └── kratos.yml                      //Kratos config
│   └── identity.schema.json
│   │
├── sql/                                //Init scripts
│   └── create_tables.sql
│
├── kratos/
│   └── kratos.yml                      //Kratos config
│   └── identity.schema.json
│
├── webhook/
│   └── src/
│   └── package.json
│   └── tsconfig.json
│
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── README.md
```

# Code

## Hasura definition

Hasura uses postgres DB for data storing. With variable `POSTGRES_PASSWORD` we getting DB connection URL - `PG_DATABASE_URL: postgres://postgres:postgrespassword@postgres:5432/postgres`

```yaml
postgres:
    container_name: postgres
    image: postgres:12
    restart: always
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./sql/create_tables.sql:/docker-entrypoint-initdb.d/create_tables.sql
    environment:
      POSTGRES_PASSWORD: postgrespassword

  graphql-engine:
    container_name: hasura
    image: hasura/graphql-engine:v2.11.2.cli-migrations-v3
    ports:
      - "8080:8080"
    depends_on:
      - "postgres"
    restart: always
    environment:
      HASURA_GRAPHQL_METADATA_DATABASE_URL: postgres://postgres:postgrespassword@postgres:5432/postgres
      PG_DATABASE_URL: postgres://postgres:postgrespassword@postgres:5432/postgres
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_DEV_MODE: "true"
      HASURA_GRAPHQL_ENABLED_LOG_TYPES: startup, http-log, webhook-log, websocket-log, query-log
      HASURA_GRAPHQL_MIGRATIONS_SERVER_TIMEOUT: 10
      HASURA_GRAPHQL_ADMIN_SECRET: myadminsecretkey
      HASURA_GRAPHQL_AUTH_HOOK: http://host.docker.internal:2000/webhook
      HASURA_GRAPHQL_AUTH_HOOK_MODE: GET
    volumes:
      - ./hasura/metadata:/hasura-metadata
```

Also we have predeploy data for posgtes at file `./sql/create_table.sql` and configured migration for Hasura `./hasura`.


### Hasura authentication

You configured the GraphQL engine to use a webhook to authenticate all incoming requests to the Hasura GraphQL engine server.

The configured webhook is called when the you set `HASURA_GRAPHQL_ADMIN_SECRET` environment variable.
To configure webhook we need to set webhook endpoint `HASURA_GRAPHQL_AUTH_HOOK: http://host.docker.internal:2000/webhook` and method `HASURA_GRAPHQL_AUTH_HOOK_MODE: GET`

### Webhook

Basically webhook is simple `express` server which handling one request.

file: `./webhook/src/index.ts`

```typescript
import express from "express"
const app = express();
const PORT = 2000;

app.get("/webhook", async (req, res) => {
    try {
        // authentication
    }    
    catch(err: any) {
        console.log(err.toJSON());
        throw new Error(err);
    }
});

const start = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`App listening on port ${PORT}`);
        })
    }
    catch(err) {
        console.log(err);
    }
};

start();
```

Then we need to realize request authentication 

First step is ory client init: 

```typescript
import {V0alpha2Api, Configuration} from "@ory/client";

const ory = new V0alpha2Api(
    new Configuration({
        basePath:
            process.env.ORY_SDK_URL || "http://host.docker.internal:4433",
        baseOptions: {
            withCredentials: true
        }
    })
)
```

_Note: when `withCredentials: true` auth cookie will include in each auth request._


Second step is realize webhook route business logic 

```typescript
await ory.toSession(undefined, req.header("cookie"));

return res.send({
  "X-Hasura-Role": "admin"
});
```

That's it 🚀

In response you can set any data you want to congigure authorization, roles and etc.

## Refine

Refine is a React-based framework for the rapid development of web applications. In this case we are using samples from basic [tutorial](https://refine.dev/docs/tutorials/ant-design-tutorial/).

For the first step lest's initialize data provider. A data provider is the place where a refine app communicates with an API. In this case we are using GraphQL client as data provider.

file: `./refine/src/graphql-client.ts`

```typescript
import {GraphQLClient} from "@pankod/refine-hasura";

const API_URL = "http://localhost:8080/v1/graphql";
const client = new GraphQLClient(API_URL, {
    credentials: 'include',
    headers: {
        "x-hasura-role": "admin"
    },
});

export default client;
```

_Note: when `credentials: 'include'` grapql client send cookies with each request._

Then we have to pass the dataProvider to the <Refine /> component.

```typescript
import dataProvider from "@pankod/refine-hasura";

<Refine
    routerProvider={routerProvider}
    LoginPage={Login}
    dataProvider={dataProvider(client)}
    Layout={Layout}
    ReadyPage={ReadyPage}
    notificationProvider={notificationProvider}
    catchAll={<ErrorComponent />}
    resources={resources}
/>
```

### Resources

`resources` is the main building block of a refine app. A resource represents an entity in an endpoint in the API.

```typescript
{
    name: "clients",
    show: ClientShow,
    edit: ClientEdit,
    list: ClientList,
    create: ClientCreate 
}
```

### Resource file structure

```typescript
clients/
│   └── index.ts
│   └── create.tsx
│   └── edit.tsx
│   └── list.tsx
│   └── show.tsx
```


### Refine authetication

Refine let's you set authentication logic by providing the `authProvider` property to the `<Refine>` component. ([more]('https://refine.dev/docs/api-reference/core/providers/auth-provider/')). 
Also we added a custom login page (`./pages/login`)

```javascript
<Refine
    authProvider={authProvider}
    LoginPage={Login}
    routerProvider={routerProvider}
    dataProvider={dataProvider(client)}
    Layout={Layout}
    ReadyPage={ReadyPage}
    notificationProvider={notificationProvider}
    catchAll={<ErrorComponent />}
    resources={resources}
/>
```

refine authProvider definition

The first step is initialize ory/kratos client to have abiltity to make auth requests to Ory/Kratos

```typescript
import {V0alpha2Api, Configuration, UiNodeInputAttributes} from "@ory/client";

var ory = new V0alpha2Api(
  new Configuration({
    basePath: process.env.ORY_SDK_URL || "http://localhost:4433",
    baseOptions: {
      withCredentials: true
    }
  }),
);
```

_Note: `ORY_SDK_URL` is url of your kratos service. `withCredentials: true` enables authentication with cookies._

Authentication flow example: 

file: `./refine/src/auth-provider.ts`

```typescript
login: async ({ username, password }: any) => {
    try {
        const {data: loginFlow} = await ory.initializeSelfServiceLoginFlowForBrowsers(true)

        const csrfTokenAttrs = loginFlow.ui.nodes[0].attributes as UiNodeInputAttributes

        const {data: {session}} = await ory.submitSelfServiceLoginFlow(loginFlow.id, {
          csrf_token: csrfTokenAttrs.value,
          password_identifier:  username,
          method: "password",
          password: password,
          identifier: username,
          traits: {
            email: username
          }
        });

        if (session) {  
            return Promise.resolve();
        }

        return Promise.reject();
    } catch {
        return Promise.reject();
    }
},
```

Other flows will have the same structure.

_Note: Login payload object is configured by kratos identity schema._

_Note: `csrf_token` will always by first element of nodes array._

## Ory/Kratos

We are using Ory as a software infrastructure provider for login, registration and keeping session.

Here is basic Ory/Kratos definition.

file: `docker-compose.yml`

There are two containers:
  `kratos-migrate`: for migrate all necessary data for api
  `kratos`: kratos api server.

```yaml
kratos-migrate:
    container_name: kratos_migrate
    image: oryd/kratos:v0.10.1
    environment:
      - DSN=sqlite:///var/lib/sqlite/db.sqlite?_fk=true&mode=rwc
    volumes:
      - type: volume
        source: kratos-sqlite
        target: /var/lib/sqlite
        read_only: false
      - type: bind
        source: ./kratos
        target: /etc/config/kratos
    command: -c /etc/config/kratos/kratos.yml migrate sql -e --yes
    restart: on-failure

  kratos:
    container_name: kratos
    image: oryd/kratos:v0.10.1
    ports:
      - "4433:4433" # public
      - "4434:4434" # admin
    restart: unless-stopped
    depends_on:
      - kratos-migrate
    environment:
      - DSN=sqlite:///var/lib/sqlite/db.sqlite?_fk=true
      - LOG_LEVEL=trace
    command:
      serve -c /etc/config/kratos/kratos.yml --dev
    volumes:
      -
        type: volume
        source: kratos-sqlite
        target: /var/lib/sqlite
        read_only: false
      -
        type: bind
        source: ./kratos
        target: /etc/config/kratos
```

_Note: in your implementation please use lates krats images due to the fact that oldest api versions has many differences._

### Identity definition

Identity definition contains all properties, their definition and options of instance wich we use for login, registration, session and user's darta.

file: `./kratos/identity.schema.json`.


```javascript
{
  "$id": "https://schemas.ory.sh/presets/kratos/quickstart/email-password/identity.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Person",
  "type": "object",
  "properties": {
    "traits": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "format": "email",
          "title": "E-Mail",
          "minLength": 3,
          "ory.sh/kratos": {
            "credentials": {
              "password": {
                "identifier": true
              }
            },
            "verification": {
              "via": "email"
            },
            "recovery": {
              "via": "email"
            }
          }
        },
        "name": {
          "type": "object",
          "properties": {
            "first": {
              "type": "string"
            },
            "last": {
              "type": "string"
            }
          }
        }
      },
      "required": [
        "email"
      ],
      "additionalProperties": false
    }
  }
}
```

_Note: that is basic schema for user creation with password and some traits._

### Kratos config

We have simple configuration for kratos placed at file `./kratos/kratos.yml`. 

The most interesting parts is cors: 

```yaml
public:
    base_url: http://127.0.0.1:4433/
    cors:
      enabled: true
      allowed_origins:
        - http://localhost
        - http://localhost:3000
        - http://*.localhost:3000
      allowed_methods:
        - POST
        - GET
        - PUT
        - PATCH
        - DELETE
      allowed_headers:
        - Authorization
        - Cookie
        - Content-Type
      exposed_headers:
        - Content-Type
        - Set-Cookie
```

and we need to add our identity definition

```yaml
identity:
  schemas:
    - id: user
      url: file:///etc/config/kratos/identity.schema.json
  default_schema_id: "user"
```

Also we need to definy our self-service. Here we need just enable authentication by password

```yaml
selfservice:
  default_browser_return_url: http://127.0.0.1:3000/

  methods:
    password:
      enabled: true
```

# Conclusion
