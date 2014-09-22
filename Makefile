test:
	node_modules/mocha/bin/mocha tests/clockworktests.js
	node_modules/mocha/bin/mocha tests/picktranslationlocalestests.js
	node_modules/mocha/bin/mocha tests/translatrontests.js
	node_modules/mocha/bin/mocha tests/postlossyfortunetests.js
	node_modules/mocha/bin/mocha tests/integration/runlossyfortunetests.js
