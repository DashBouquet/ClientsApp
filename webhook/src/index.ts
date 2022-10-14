import express from "express";
import {V0alpha2Api, Configuration} from "@ory/client";

const PORT = 2000;


const ory = new V0alpha2Api(
    new Configuration({
        basePath:
            process.env.ORY_SDK_URL || "http://host.docker.internal:4433",
        baseOptions: {
            withCredentials: true
        }
    })
)

const app = express();

app.get("/webhook", async (req, res) => {
    try {
        await ory.toSession(undefined, req.header("cookie"));

        return res.send({
            "X-Hasura-Role": "admin"
        });
    }    
    catch(err: any) {
        console.log(err.toJSON());
       res.send({
            message: "ERROR"
       })
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