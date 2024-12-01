import { logger, LogLevels } from "../utils/common.ts";
import { getPathSegments } from "./utils.ts";

type Method = "GET" | "POST" | "DELETE" | "OPTIONS";

class Router {
  private routes: Map<string, Partial<Record<Method, Deno.ServeHandler>>>;
  private dynamicPathsQueries: Map<string, RegExp>;
  private port: number;
  private cors: {
    origin: string;
    methods: string;
    headers: string;
  }

  constructor(port: number) {
    this.port = port;
    this.routes = new Map();
    this.dynamicPathsQueries = new Map();
    this.cors = {
      origin: "*",
      methods: "*",
      headers: "*",
    }
  }

  private async lookUpStaticPath(
    path: string,
    method: Method,
    req: Request,
    info: Deno.ServeHandlerInfo
  ): Promise<Response> {
    const pathMethods = this.routes.get(path);

    if (!pathMethods) {
      return this.lookUpDynamicPath(path, method, req, info);
    } else {
      const routeHandler = pathMethods[method];

      const res = await routeHandler?.(req, info);
      
      if (res?.status === 200) {
        logger(`${res.status} ${method} - ${path}`)
      } else {
        logger(`${(res?.status || 500)} ${method} - ${path}`, LogLevels.ERROR)
      }

      return (
        res ||
        new Response("Not Found", {
          status: 404,
        })
      );
    }
  }

  private async lookUpDynamicPath(
    path: string,
    method: Method,
    _req: Request,
    _info: Deno.ServeHandlerInfo
  ): Promise<Response> {
    for (const [_path, _pattern] of this.dynamicPathsQueries) {
      const matched = _pattern.test(path);

      if (matched) {
        const pathParts = path.split("/");
        const params: Record<string, string> = {};

        _path.split("/").forEach((p, i) => {
          if (p.startsWith(":")) {
            params[p.replace(":", "")] = pathParts[i];
          }
        });

        return await this.lookUpStaticPath(_path, method, _req, {
          ..._info,
          params,
        } as Deno.ServeHandlerInfo);
      }
    }

    return new Response(
      JSON.stringify({ message: "Looking up path", path, method }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  private addRoute(method: Method, path: string, handler: Deno.ServeHandler) {
    if (this.routes.has(path)) {
      const pathMethods =
        this.routes.get(path) ||
        ({} as Partial<Record<Method, Deno.ServeHandler>>);
      pathMethods[method] = handler;
      this.routes.set(path, pathMethods);
    } else {
      this.routes.set(path, {
        [method]: handler,
      });
    }

    if (path.includes(":")) {
      const segments = getPathSegments(path);
      let regex = path;

      segments.forEach((seg) => {
        regex = regex.replace(seg, "[a-zA-z\\d]");
      });

      if (!this.dynamicPathsQueries.has(path)) {
        this.dynamicPathsQueries.set(path, new RegExp(regex));
      }
    }
  }

  set setCors (config: {origin?: string, methods?: string, headers?: string}) {
    if (!config?.headers && !config?.methods && !config?.origin) {
      throw new Error("No cors config provided");
    }

    if (config.origin) {
      this.cors.origin = config.origin;
    }
    
    if (config.methods) {
      this.cors.methods = config.methods;
    }

    if (config.headers) {
      this.cors.headers = config.headers;
    }
  }

  handler: Deno.ServeHandler = async (req, info): Promise<Response> => {
    const path = req.url.split(`${this.port}`)[1];
    const method = req.method.toUpperCase() as Method;
    
    if (method === "OPTIONS") {
      logger(`${method} - ${req.url}`)
      return new Response("", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": this.cors.origin,
          "Access-Control-Allow-Methods": this.cors.methods,
          "Access-Control-Allow-Headers": this.cors.headers,
        },
      });
    }

    return await this.lookUpStaticPath(path, method, req, info);
  };

  get(path: string, handler: Deno.ServeHandler) {
    this.addRoute("GET", path, handler);
  }

  post(path: string, handler: Deno.ServeHandler) {
    this.addRoute("POST", path, handler);
  }

  delete(path: string, handler: Deno.ServeHandler) {
    this.addRoute("DELETE", path, handler);
  }
}

export default Router;
