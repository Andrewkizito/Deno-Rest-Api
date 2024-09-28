type Method = "GET" | "POST" | "DELETE";

class Router {
    private routes: Map<string, Partial<Record<Method, Deno.ServeHandler>>>;
    private dynamicPathsQueries: Set<string>;
    private port: number;

    constructor(port: number) {
        this.routes = new Map();
        this.dynamicPathsQueries = new Set();
        this.port = port;
    }

    private async lookUpStaticPath(
        path: string,
        method: Method,
        req: Request,
        info: Deno.ServeHandlerInfo,
    ): Promise<Response> {
        const pathMethods = this.routes.get(path);

        if (!pathMethods) {
            return this.lookUpDynamicPath(path, method, req, info)
        } else {
            const routeHandler = pathMethods[method];
            if (!routeHandler) {
                return new Response("Method not allowed", {
                    status: 404,
                });
            }

            const res = await routeHandler(req, info);
            return res;
        }
    }

    private lookUpDynamicPath(path: string,
        method: Method,
        _req: Request,
        _info: Deno.ServeHandlerInfo,): Response {

        return new Response(JSON.stringify({ message: "Looking up path", path, method, }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    handler: Deno.ServeHandler = async (req, info): Promise<Response> => {
        const path = req.url.split(`${this.port}`)[1];
        const method = req.method.toUpperCase() as Method;

        return await this.lookUpStaticPath(path, method, req, info);
    };

    get(path: string, handler: Deno.ServeHandler) {
        if (this.routes.has(path)) {
            const pathMethods =
                this.routes.get(path) || ({} as Record<Method, Deno.ServeHandler>);
            pathMethods.GET = handler;

            this.routes.set(path, pathMethods);
        } else {
            this.routes.set(path, {
                GET: handler,
            });
        }
    }

    post(path: string, handler: Deno.ServeHandler) {
        if (this.routes.has(path)) {
            const pathMethods =
                this.routes.get(path) || ({} as Record<Method, Deno.ServeHandler>);
            pathMethods.POST = handler;

            this.routes.set(path, pathMethods);
        } else {
            this.routes.set(path, {
                POST: handler,
            });
        }
    }

    delete(path: string, handler: Deno.ServeHandler) {
        if (this.routes.has(path)) {
            const pathMethods =
                this.routes.get(path) || ({} as Record<Method, Deno.ServeHandler>);
            pathMethods.DELETE = handler;

            this.routes.set(path, pathMethods);
        } else {
            this.routes.set(path, {
                DELETE: handler,
            });
        }
    }
}

export default Router;
