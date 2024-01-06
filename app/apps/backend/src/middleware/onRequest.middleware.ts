import type { FastifyInstance, FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';

export default (fastify: FastifyInstance<any>) => {
  fastify.addHook('onRequest', (req: FastifyRequest, res: FastifyReply, next: HookHandlerDoneFunction) => {
    req.log.info(`started`);
    next();
  });
};