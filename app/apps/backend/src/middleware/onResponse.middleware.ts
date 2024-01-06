import type { FastifyInstance, FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';

export default (fastify: FastifyInstance<any>) => {
  fastify.addHook('onResponse', (req: FastifyRequest, res: FastifyReply, next: HookHandlerDoneFunction) => {
    req.log.info({
      req: {
        method: res.request.method,
        url: res.request.url,
        path: res.request.routeOptions.url,
        params: res.request.params,
        headers: res.request.headers,
      },
      statusCode: res.statusCode,
      time: res.getResponseTime(),
    });
    next();
  });
};