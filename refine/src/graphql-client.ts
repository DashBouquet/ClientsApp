import {GraphQLClient} from "@pankod/refine-hasura";

const API_URL = "http://localhost:8080/v1/graphql";

const client = new GraphQLClient(API_URL, {
    headers: {
        "x-hasura-role": "admin",
    },
});

export default client;