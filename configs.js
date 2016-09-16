module.exports = {

	isAuth: false,

	port: 8088,

	isDBAvailable: false,

	db: {

		materDB: {
			name: 'master',
			pg: {
				user: '',
				password: '',
				host: 'postgres',
				port: '5432',
				database: '',
				max: 10,
				idleTimeoutMillis: 60
			}
		}

	}

}