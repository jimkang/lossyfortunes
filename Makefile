test:
	node_modules/mocha/bin/mocha tests/clockworktests.js
	node_modules/mocha/bin/mocha tests/picktranslationlocalestests.js
	node_modules/mocha/bin/mocha tests/translatrontests.js
	node_modules/mocha/bin/mocha tests/postlossyfortunetests.js
	node_modules/mocha/bin/mocha tests/integration/runlossyfortunetests.js

install-cron:
	echo "Note: You need to edit the paths in schedule.cron for this to work.\n"
	crontab admin/schedule.cron

npm-install:
	npm install

BARE_REPO_DIR = /var/repos/lossyfortunes.git

update-post-receive:
	cp admin/post-receive $(BARE_REPO_DIR)/hooks
	chmod +x $(BARE_REPO_DIR)/hooks/post-receive

build-server: npm-install install-cron
	echo "Server built."
