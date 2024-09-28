import { createStringHashMap } from "./common.ts";

type Method = "GET" | "POST" | "DELETE";

class Router {
  private routes: Map<string, Partial<Record<Method, Deno.ServeHandler>>>;
  private dynamicPathsQueries: Map<string, RegExp>;
  private port: number;

  constructor(port: number) {
    this.port = port;
    this.routes = new Map();
    this.dynamicPathsQueries = new Map();
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
        return await this.lookUpStaticPath(_path, method, _req, _info);
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

  private getPathSegments(path: string) {
    const result: Array<string> = [];

    while (path.includes(":")) {
      const charsMap = createStringHashMap(path);
      const startIndex = charsMap[":"][0];
      const endIndex = charsMap["/"]?.find((num) => num > startIndex);

      if (!endIndex) {
        result.push(path.substring(startIndex));
      } else {
        result.push(path.substring(startIndex, endIndex));
      }

      // Delete
      path = path.replace(":", "");
    }

    return result;
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
      const segments = this.getPathSegments(path);
      let regex = path;

      segments.forEach((seg) => {
        regex = regex.replace(seg, "[a-zA-z\\d]");
      });

      if (!this.dynamicPathsQueries.has(path)) {
        this.dynamicPathsQueries.set(path, new RegExp(regex));
      }
    }
  }

  handler: Deno.ServeHandler = async (req, info): Promise<Response> => {
    const path = req.url.split(`${this.port}`)[1];
    const method = req.method.toUpperCase() as Method;

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
