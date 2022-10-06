# Hasura auth

# Table of Contents
- [Hasura auth](#hasura-auth)
- [Table of contents](#table-of-contents)
    - [Introduction](#introduction)
    - [Techstack](#techstack)
    - [Hasura request flow](#hasura-request-flow)
- [Code](#code)


## Introduction

In this article we wanna describe an approach how to fast initialize Hasura graphql engine with Ory/Kratos authentication.

## Techstack
- [Ory/Kratos](https://www.ory.sh/docs/welcome) - Headless and configurable authentication and user management..
- [Hasura](https://hasura.io/) - Instant GraphQL on all your data
- [PostgreSQL](https://www.postgresql.org/) - PostgreSQL is a powerful, open source object-relational database system 


## Hasura request flow 

There are two approaches to make hasura authentication: by JWT and through the webhook. In this case we decided to us webhook approach

```mermaid
flowchart TB

hasura[Hasura]
client[Client App]
webhook
kratos[Ory/Kratos]
    client --->|Send request with ory_kratos_session cookie| hasura
    hasura --->|Request auth hook with req headers| webhook
    webhook --->|User info if session is resolved| hasura
    webhook --->|Check session is valid| kratos
```

# Code

To simply deploy on your local machine we are using docker-compose.

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

As we can see in docker-compose file, we have two kratos's valumes: `kratos-sqlite` for  storing data and `./kratos` with it's configuration. Let's focus attention on second. Folder `./kratos` contains only two files ([more]('https://www.ory.sh/docs/kratos/reference/configuration'))

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

**Let's make hasura calls authenticated**

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

That's it!

## Conclusion 

In that article we discussed how to fast and simple deploy api server developed on Hasura with Ory/Kratos authentication.



