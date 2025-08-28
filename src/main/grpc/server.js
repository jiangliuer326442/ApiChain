const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');

const packageDefinition = protoLoader.loadSync(path.join(__dirname, 'service.proto'), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const greeterProto = grpc.loadPackageDefinition(packageDefinition);

function sayHello(call, callback) {
  callback(null, { message: 'Hello ' + call.request.name });
}

const server = new grpc.Server();
server.addService(greeterProto.Greeter.service, { sayHello });
server.bindAsync('0.0.0.0:9091', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
});
