docs = ./docs/**/*
browserify = ./node_modules/.bin/browserify
watchify = ./node_modules/.bin/watchify
uglify = ./node_modules/.bin/uglifyjs

lib/%.js: src/%.ts
	tsc

all: docs/src/main/tut/examples/example.js browser

.PHONY: test
test: lib/**/*.js test/*.js docs/src/main/tut/examples/example.js
	yarn test

docs/src/main/tut/examples/example.js: docs/src/main/tut/examples/example.tsx
	$(browserify) -p [tsify -p tsconfig.examples.json] docs/src/main/tut/examples/example.tsx -o docs/src/main/tut/examples/example.js

watch/example: docs/src/main/tut/examples/example.tsx
	$(watchify) -p [tsify -p tsconfig.examples.json] -t envify docs/src/main/tut/examples/example.tsx -dv -o docs/src/main/tut/examples/example.js

browser: dist/xreact.min.js dist/xreact-most.min.js dist/xreact-rx.min.js

dist/xreact.js: lib/index.js
	env NODE_ENV=production $(browserify) -t browserify-shim -t envify -x ./lib/xs lib/index.js -s xreact -o $@

dist/xreact-most.js: lib/xs/most.js
	env NODE_ENV=production $(browserify) -t browserify-shim -t envify -r ./lib/xs lib/xs/most.js -o $@

dist/xreact-rx.js: lib/xs/rx.js
	env NODE_ENV=production $(browserify) -t browserify-shim -t envify -r ./lib/xs lib/xs/rx.js -o $@

dist/%.min.js: dist/%.js
	env NODE_ENV=production $(uglify) -c dead_code $(basename $(basename $@)).js -o $@

docs: $(docs)
	sbt makeMicrosite

docs/publish: $(docs)
	sbt "project docs" publishMicrosite

clean:
	rm -rf lib docs/src/main/tut/examples/example.js dist/*
