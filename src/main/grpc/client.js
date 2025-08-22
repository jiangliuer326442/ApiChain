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

const greeterProto = grpc.loadPackageDefinition(packageDefinition).com.mustafa.payment.grpc.sample;

const client = new greeterProto.Greeter('localhost:9091', grpc.credentials.createInsecure());

client.sayHello({ name: 'World' }, (err, response) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Greeting:', response.message);
});
