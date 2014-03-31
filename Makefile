BIN = ./node_modules/.bin
JSHINT = $(BIN)/jshint
JSCS = $(BIN)/jscs

.PHONY: lint
lint:
	$(JSHINT) .
	$(JSCS) .
