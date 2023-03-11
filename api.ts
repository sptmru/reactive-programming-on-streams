import Fastify, { FastifyInstance, RouteShorthandOptions, RouteHandlerMethod } from 'fastify'


const srv: FastifyInstance = Fastify({})

interface Objects {
  [key: string]: number,
}

interface APIResponse {
  objects: Objects,
  start?: number,
  end?: number,
}

interface RequestQuery {
  offset?: number,
  limit?: number,
}

const opts: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
          offset: { type: 'number'},
          limit: {type: 'number'}
      },
    }
  },
}

const handler: RouteHandlerMethod = async (req, _res) => {
  const response: APIResponse = {
      objects: {}
  };

  const query = req.query as RequestQuery;

  const offset = Number(query?.offset) || 0;
  const limit  = Number(query?.limit) || 50;

  const finalNum = 10000;
  
  const end = (Number(offset) + Number(limit)) < finalNum 
    ? (Number(offset) + Number(limit))
    : finalNum;
  
    for (let i = offset; i <= end; i++) {
      response.objects[i] = i;
    }
  
  response.start = offset;
  response.end = end;

  return response;
};

srv.get('/', opts, handler);

const start =  async () => {
  try {
    await srv.listen({ port: 3000 });
  } catch (err) {
    srv.log.error(err);
    process.exit(1);
  }
}

start();