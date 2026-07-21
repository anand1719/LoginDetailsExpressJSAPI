const {Client} = require('pg');

const client = new Client ({
	user: 'postgres',
	password: 'anand##1903',
	host: 'localhost',
	port: 5432,
	database: 'employer',
});

client.connect();

module.exports=client;