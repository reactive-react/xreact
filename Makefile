docsdir = ./docs/**/*
browserify = ./node_modules/.bin/browserify
watchify = ./node_modules/.bin/watchify
uglify = ./node_modules/.bin/uglifyjs

test: unit integrate

build: lib/**/*.js

lib/**/*.js: src/**/*.ts
	tsc

lib/%.js: src/%.ts
	tsc

all: test dist

.PHONY: test build unit integrate dist docs docs/publish

unit: build
	yarn test

integrate: build test/*.js docs/src/main/tut/examples/example.js
	mocha test/test.js

docs/src/main/tut/examples/example.js: docs/src/main/tut/examples/example.tsx
	$(browserify) -p [tsify -p tsconfig.examples.json] docs/src/main/tut/examples/example.tsx -o docs/src/main/tut/examples/example.js

watch/example: docs/src/main/tut/examples/example.tsx
	$(watchify) -p [tsify -p tsconfig.examples.json] -t envify docs/src/main/tut/examples/example.tsx -dv -o docs/src/main/tut/examples/example.js

dist: dist/xreact.min.js dist/xreact-most.min.js dist/xreact-rx.min.js

dist/xreact.js: lib/index.js dist/xreact-most.js dist/xreact-rx.js
	env NODE_ENV=production $(browserify) -t browserify-shim -t envify -x ./lib/xs $< -s xreact -o $@

dist/xreact-%.js:  lib/xs/%.js
	env NODE_ENV=production $(browserify) -t browserify-shim -t envify -r ./lib/xs $< -o $@

dist/%.min.js: dist/%.js
	env NODE_ENV=production $(uglify) -c dead_code $(basename $(basename $@)).js -o $@

docs: $(docsdir)
	sbt "project docs" makeMicrosite

docs/publish: $(docsdir)
	sbt "project docs" publishMicrosite

clean:
	rm -rf lib docs/src/main/tut/examples/example.js dist/*
