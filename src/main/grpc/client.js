const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');

const FILE_NAME = "user.proc"

const GRPC_HOST = 'localhost';
const GRPC_PORT = '9091';

const SERVICE_NAME = "User";
const METHOD_NAME = "queryUser";
const PARAMS = { uid: 1 };

const packageDefinition = protoLoader.loadSync(path.join(__dirname, FILE_NAME), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition);

const client = new proto[SERVICE_NAME](GRPC_HOST + ':' + GRPC_PORT, grpc.credentials.createInsecure());

client[METHOD_NAME](PARAMS, (err, response) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('response:', response);
});
