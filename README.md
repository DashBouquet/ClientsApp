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

In this article we wanna create a simple client app for managing data through Hasura graphql engine, with Ory/Kratos authentication manager.

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

## Ory/Kratos

We are using Ory as a software infrastructure provider for login, registration and keeping session.

**Here is basic Ory/Kratos definition.**

file: `docker-compose.yml`

There are two containers:
  `kratos-migrate` - for migrate all necessary data for api.
  `kratos`- kratos api server.

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

_Note: in your implementation please use latest kratos images due to the fact that oldest api versions has many differences._

As we can see in docker-compose file, we have two kratos's valumes: `kratos-sqlite` for  storing data and `./kratos` with it's configuration. Let's focus attention on second. Folder `./kratos` contains only two files 


### Kratos identity definition

Identity definition contains all properties, their definition and options of instance wich we use for login, registration, session and user's darta.

file: `./kratos/identity.schema.json`.

```json
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

## Hasura definition

We decided to use Hasura cause it simple and quick tool to define database, tables, relashionship and REST API.

Hasura uses postgres DB for data storing. 

file: `docker-compose.yml`

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

Let's take a look closer at the hasura environment:

Firtsly we created some database template `./sql/create_tables.sql`. And applied it to our postgres container with volume 
`./sql/create_tables.sql:/docker-entrypoint-initdb.d/create_tables.sql`

Also we need to set `POSTGRESS_PASSWORD` to make confidential connection url.

At hasura container we've created some metadata to predeploy all configurated data with tables dependencies, REST, and etc. 
`- ./hasura/metadata:/hasura-metadata`

_Note: For applying hasura metadata be sure that you are using iamage with migration for us is `hasura/graphql-engine:v2.11.2.cli-migrations-v3`._

Next let's take a look at most important vairables: 

`PG_DATABASE_URL: postgres://postgres:postgrespassword@postgres:5432/postgres` - PostgreSQL conneciton URL
`HASURA_GRAPHQL_ENABLE_CONSOLE: "true"` - enables UI for manual Hasura usage.
`HASURA_GRAPHQL_DEV_MODE: "true"` - Set dev mode for GraphQL requests.
`HASURA_GRAPHQL_MIGRATIONS_SERVER_TIMEOUT: 10` - timeout for start hasura metdata migration (Default=30)
`HASURA_GRAPHQL_ADMIN_SECRET: myadminsecretkey` - enables authentication for hasura engine server.
_Note: You can't put this password to client application._
`HASURA_GRAPHQL_AUTH_HOOK: http://host.docker.internal:2000/webhook` - address of hasura authentication webhook
`HASURA_GRAPHQL_AUTH_HOOK_MODE: GET` - Method of hasura authentication webhook _(Default= GET)_

**Let's make a little bit security**

We configured the GraphQL engine. As we can see at [Request flow](#request-flow) hasura calls authentication webhook each request. So let's see webhook a little closer.

### Webhook

Basically webhook is simple server which handling only one request.

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

That's it!

_Note: rememder that your app and route must be run at the same address as you defined at `docker-compose` file._

Then we need to add request authentication 

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

Ory offers us a client interface which makes communication with ort/kratos quick and simple.

_Note: when `withCredentials: true` auth cookie will include in each auth request._

Second step is implement webhook route business logic

```typescript
await ory.toSession(undefined, req.header("cookie"));

return res.send({
  "X-Hasura-Role": "admin"
});
```

In this case we just asking for session, request is coming directly from the Hasura service and must contains actual cookies. If we getting that session that means that session is alive. To make Hasura know that authentication success we need to return any positive result. In response you can set any data you want to congigure authorization, roles and etc.

That's it 

## Refine

Refine is a React-based framework for the rapid development of web applications. In this case we are using samples from basic [tutorial](https://refine.dev/docs/tutorials/ant-design-tutorial/).

In the begining let's initialize main `<Refine>` object 

file: `./refine/serc/App.tsx`

```typescript
import { Refine } from "@pankod/refine-core";
import {
    ReadyPage,
    notificationProvider,
    ErrorComponent,
    Layout
} from "@pankod/refine-antd";
import routerProvider from "@pankod/refine-react-router-v6";
import dataProvider from "@pankod/refine-hasura";

import "@pankod/refine-antd/dist/styles.min.css";

export const App: React.FC = () => (
        <Refine
            routerProvider={routerProvider}
            Layout={Layout}
            ReadyPage={ReadyPage}
            notificationProvider={notificationProvider}
            catchAll={<ErrorComponent />}
        />
    );
```

To manage data we must provide to refine dataProvider. 
>A data provider is the place where a refine app communicates with an API. Data providers also act as adapters for refine making it possible to consume different API's and data services conveniently. A data provider makes HTTP requests and returns response data back using predefined methods.

We can make dataProvider ourself or using one out-of-the-box data providers which refine offers.

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

Then we have to pass the dataProvider to the `<Refine />` component.

```tsx
import dataProvider from "@pankod/refine-hasura";

<Refine
    dataProvider={dataProvider(client)}
    routerProvider={routerProvider}
    Layout={Layout}
    ReadyPage={ReadyPage}
    notificationProvider={notificationProvider}
    catchAll={<ErrorComponent />}
/>
```

### Resources

`resources` is the main building block of a refine app. A resource represents an entity in an endpoint in the API.

To use resourses we have to pass them to the `<Rfine />` component.

```tsx
<Refine
    dataProvider={dataProvider(client)}
    routerProvider={routerProvider}
    Layout={Layout}
    ReadyPage={ReadyPage}
    notificationProvider={notificationProvider}
    catchAll={<ErrorComponent />}
    resourses={[
      {
          name: "clients",
          show: ClientShow,
          edit: ClientEdit,
          list: ClientList,
          create: ClientCreate 
      }
    ]}
/>
```

Resource object contains `name` for navigation and components with logic and some representation UI. ([more]('https://refine.dev/docs/api-reference/core/components/refine-config/#resources'))

### Resource file structure

```typescript
pages/
│   └── clients/
│   │     └── index.ts
│   │     └── create.tsx
│   │     └── edit.tsx
│   │     └── list.tsx
│   │     └── show.tsx
│   └──  projects/       // same as clients
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

**Refine authProvider definition.**

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

Let's see how authProvider looks like
>authProvider is an object with methods that refine uses when necessary. These methods are needed to return a Promise. 


```typescript
const authProvider = {
    login: () => Promise.resolve(),
    register: () => Promise.resolve(),
    forgotPassword: () => Promise.resolve(),
    updatePassword: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    checkAuth: () => Promise.resolve(),
    checkError: () => Promise.resolve(),
    getPermissions: () => Promise.resolve(),
    getUserIdentity: () => Promise.resolve(),
};
```

In this article we will describe only login flow, because other flows have the same structure: 

file: `./refine/src/auth-provider.ts`

```typescript
const authProvider = {
  login: async ({ username, password }: any) => {
    try {
        // Initialize the flow 
        const {data: loginFlow} = await ory.initializeSelfServiceLoginFlowForBrowsers(true);

        // getting csrf_toke from response
        const csrfTokenAttrs = loginFlow.ui.nodes[0].attributes as UiNodeInputAttributes;

        // Login request
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

        // If we got seesion - resolve the login
        if (session) {  
            return Promise.resolve();
        }

        return Promise.reject();
    } catch {
        return Promise.reject();
    }
  },
}
```

_Note: Login payload object is configured by kratos identity schema._

_Note: `csrf_token` will always by first element of nodes array._


If we've got a successful login we need to check our authentication each time we comming to the sit. For this we must to implement `checkAuth` method of `authProvider`. In our case that method will check that session still alive.

```typescript
const authProvider = {
  // ...login, ...registration, ...etc

  checkAuth: async () => {
        const {data: session } = await ory.toSession();
        return session.id ? Promise.resolve() : Promise.reject();
    }
}
```

Simple, right? 

# Conclusion

Now we can login to the Client App and managing data through Hasura engine which authenticating by clients cookies in Ory/Kratos.
