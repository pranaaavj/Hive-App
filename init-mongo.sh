#!/bin/bash

echo "Waiting for MongoDB to start..."
until mongosh --host localhost --eval "print('Mongo is ready')" &> /dev/null; do
  sleep 1
done

echo "Initiating replica set..."
mongosh <<EOF
rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "mongo:27017" }]
});
EOF

echo "Replica set initiated."
