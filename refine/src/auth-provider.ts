import {V0alpha2Api, Configuration, UiNodeInputAttributes} from "@ory/client";

var ory = new V0alpha2Api(
  new Configuration({
    basePath: process.env.ORY_SDK_URL || "http://localhost:4433",
    baseOptions: {
      withCredentials: true
    }
  }),
);

const authProvider = {
    login: async ({ username, password }: any) => {
        try {
          const {data: loginFlow} = await ory.initializeSelfServiceLoginFlowForBrowsers(true);

          const csrfTokenAttrs = loginFlow.ui.nodes[0].attributes as UiNodeInputAttributes;

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
    register: async ({ username, password }: any) => {
        try {
          const {data: regitsrationFlow} = await ory.initializeSelfServiceRegistrationFlowForBrowsers();

          const csrfTokenAttrs = regitsrationFlow.ui.nodes[0].attributes as UiNodeInputAttributes;

          await ory.submitSelfServiceRegistrationFlow(regitsrationFlow.id, {
            csrf_token: csrfTokenAttrs.value,
            password: password,
            traits: { 
              email: username,
              name: {
                first: username,
                last: username
              }
            },
            method: "password"
          });
        }
        catch {
          return Promise.reject()
        }
    },
    logout: async () => {
        try {
          const {data: logoutFlow} = await ory.createSelfServiceLogoutFlowUrlForBrowsers();

          await ory.submitSelfServiceLogoutFlow(logoutFlow.logout_token);
          Promise.resolve();
        }
        catch {
          Promise.reject();
        }
    },
    checkAuth: async () => {
        const {data: session } = await ory.toSession();
        return session.id ? Promise.resolve() : Promise.reject();
    },
    checkError: (error: any) => {
      console.log(error);
      if (error.status === 401) {
          return Promise.reject();
      }
      return Promise.resolve();
  },
    getPermissions: () => Promise.resolve(),
    getUserIdentity: () => Promise.resolve(),
}

export default authProvider;