src = ./src/**/*
docs = ./docs/**/*
browserify = ./node_modules/.bin/browserify
watchify = ./node_modules/.bin/watchify

build: $(src)
	tsc

all: docs/src/main/tut/examples/example.js browser

docs/src/main/tut/examples/example.js: docs/src/main/tut/examples/example.tsx
	$(browserify) -p [tsify -p tsconfig.examples.json] docs/src/main/tut/examples/example.tsx -o docs/src/main/tut/examples/example.js

watch/example: docs/src/main/tut/examples/example.tsx
	$(watchify) -p [tsify -p tsconfig.examples.json] -t envify docs/src/main/tut/examples/example.tsx -dv -o docs/src/main/tut/examples/example.js

browser: build
	$(browserify) -t browserify-shim -x ./lib/xs lib/index.js -s xreact -o docs/src/main/tut/dist/xreact.js
	$(browserify) -t browserify-shim -r ./lib/xs lib/xs/most.js -o docs/src/main/tut/dist/xreact-most.js
	$(browserify) -t browserify-shim -r ./lib/xs lib/xs/rx.js -o docs/src/main/tut/dist/xreact-rx.js

docs: $(docs)
	sbt makeMicrosite

docs/publish: $(docs)
	sbt "project docs" publishMicrosite

clean:
	rm -rf lib docs/src/main/tut/examples/example.js docs/src/main/tut/dist/*
