import {
  ConfigContext,
  ConfigError,
  ConfigInstance,
  newConfig,
  string,
  number
} from "../";

class AppConfigSpec {
  name = string({ env: "NAME" });

  nameWithDefault = string({ env: "NAME_NOT_SET", default: "DEFAULT" });

  nameOptional = string({ env: "NAME_NOT_SET", optional: true });

  port = number({ env: "PORT" });

  portWithDefault = number({ env: "PORT_NOT_SET", default: 8081 });

  portOptional = number({ env: "PORT_NOT_SET", optional: true });

  nameIsEnvName = string();

  SOME_URL = string();
}

type AppConfig = ConfigInstance<AppConfigSpec>;

/* eslint-disable prefer-destructuring */
describe("AppConfig", () => {
  // default test value
  const validEnvVars = {
    NAME: "app",
    PORT: "8080",
    NAME_IS_ENV_NAME: "app2",
    SOME_URL: "url"
  };

  it("can be constructed", () => {
    const context = new ConfigContext(validEnvVars);
    const c: AppConfig = newConfig(AppConfigSpec, context);
    const name: string = c.name;
    expect(name).toBe("app");
  });

  it("cannot be constructed with missing env vars", () => {
    const context = new ConfigContext({});
    expect(() => newConfig(AppConfigSpec, context)).toThrow(ConfigError);
  });

  it("error message contains the name of all missing env vars", () => {
    const invalidEnvVars = { ...validEnvVars };
    delete invalidEnvVars.NAME;
    delete invalidEnvVars.PORT;
    const context = new ConfigContext(invalidEnvVars);
    try {
      newConfig(AppConfigSpec, context);
    } catch (e) {
      expect(e.message).toEqual("NAME is not set, PORT is not set");
    }
  });

  it("uses a default value if its given", () => {
    const context = new ConfigContext(validEnvVars);
    const nameWithDefault: string = newConfig(AppConfigSpec, context)
      .nameWithDefault;
    expect(nameWithDefault).toBe("DEFAULT");
  });

  it("can use the property name as the env variable name", () => {
    const context = new ConfigContext(validEnvVars);
    const name: string = newConfig(AppConfigSpec, context).nameIsEnvName;
    expect(name).toBe("app2");
  });

  it("can use the property name as if already snake cased", () => {
    const context = new ConfigContext(validEnvVars);
    const url: string = newConfig(AppConfigSpec, context).SOME_URL;
    expect(url).toBe("url");
  });

  it("allows options to be optional", () => {
    const context = new ConfigContext(validEnvVars);
    const config = newConfig(AppConfigSpec, context);
    const nameOptional: string | undefined = config.nameOptional;
    expect(nameOptional).toBeUndefined();
  });

  it("can parse numbers", () => {
    const context = new ConfigContext(validEnvVars);
    const port: Number = newConfig(AppConfigSpec, context).port;
    expect(port).toBe(8080);
  });

  it("can handle invalid numbers", () => {
    const vars = { ...validEnvVars, PORT: "invalid" };
    const context = new ConfigContext(vars);
    try {
      newConfig(AppConfigSpec, context);
      fail();
    } catch (e) {
      expect(e.message).toEqual("PORT is not a number");
    }
  });

  it("can get number default value", () => {
    const context = new ConfigContext(validEnvVars);
    const portWithDefault: Number = newConfig(AppConfigSpec, context)
      .portWithDefault;
    expect(portWithDefault).toBe(8081);
  });

  it("can have optional numbers", () => {
    const context = new ConfigContext(validEnvVars);
    const config = newConfig(AppConfigSpec, context);
    const portOptional: Number | undefined = config.portOptional;
    expect(portOptional).toBeUndefined();
  });
});