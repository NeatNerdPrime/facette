# -*- Makefile -*-

VERSION := 0.4.0alpha1

BUILD_DATE := $(shell date +%F)
BUILD_HASH := $(shell git rev-parse --short HEAD)

PREFIX ?= /usr/local

GO ?= go

GOOS ?= $(shell $(GO) env GOOS)
GOARCH ?= $(shell $(GO) env GOARCH)

GB ?= gb

BUILD_NAME = facette-$(GOOS)-$(GOARCH)
BUILD_DIR = build/$(BUILD_NAME)
BUILD_ENV ?= production

GOLINT ?= golint
GOLINT_ARGS =

NPM ?= npm
NPM_ARGS = --loglevel silent

GULP ?= node_modules/.bin/gulp
GULP_ARGS = --no-color

PANDOC ?= pandoc
PANDOC_ARGS = --standalone --to man

BIN_LIST = $(patsubst src/cmd/%,%,$(wildcard src/cmd/*))
PKG_LIST = $(patsubst src/%,%,$(wildcard src/cmd/*) $(filter-out src/cmd, $(wildcard src/facette/*)))
MAN_LIST = $(patsubst docs/man/%.md,%,$(wildcard docs/man/*.[0-9].md))

mesg_start = echo "$(shell tty -s && tput setaf 4)$(1):$(shell tty -s && tput sgr0) $(2)"
mesg_step = echo "$(1)"
mesg_ok = echo "result: $(shell tty -s && tput setaf 2)ok$(shell tty -s && tput sgr0)"
mesg_fail = (echo "result: $(shell tty -s && tput setaf 1)fail$(shell tty -s && tput sgr0)" && false)

all: build

clean: clean-bin

clean-depends:
	@$(call mesg_start,clean,Removing build dependencies...)
	@rm -rf node_modules/ && \
		$(call mesg_ok) || $(call mesg_fail)

clean-bin:
	@$(call mesg_start,clean,Removing build data...)
	@rm -rf build/ src/cmd/facette/bindata.go && \
		$(call mesg_ok) || $(call mesg_fail)

build: build-bin build-assets build-docs

build-depends:
	@$(call mesg_start,build,Installing build dependencies...)
	@$(NPM) $(NPM_ARGS) install >/dev/null && \
		$(call mesg_ok) || $(call mesg_fail)

build-dir:
	@$(call mesg_start,build,Preparing build directory...)
	@(install -d -m 0755 $(BUILD_DIR) && cd $(BUILD_DIR) && ln -sf ../../src ../../vendor .) && \
		$(call mesg_ok) || $(call mesg_fail)

ifneq ($(filter builtin_assets,$(BUILD_TAGS)),)
build-bin: build-dir build-assets
	@$(call mesg_start,build,Embedding assets files...)
	@go-bindata \
			-prefix $(BUILD_DIR)/assets \
			-tags 'builtin_assets' \
			-o src/cmd/facette/bindata.go $(BUILD_DIR)/assets/... && \
		$(call mesg_ok) || $(call mesg_fail)
else
build-bin: build-dir
endif
	@$(call mesg_start,build,Building binaries...)
	@(cd $(BUILD_DIR) && $(GB) build \
		-tags "$(BUILD_TAGS)" \
		-ldflags "-s -w \
			-X main.version=$(VERSION) \
			-X main.buildDate=$(BUILD_DATE) \
			-X main.buildHash=$(BUILD_HASH) \
		") && \
		$(call mesg_ok) || $(call mesg_fail)
ifneq ($(BUILD_TAGS),)
	@for bin in $(BIN_LIST); do \
		$(call mesg_start,build,Renaming $$bin binary...); \
		mv -f $(BUILD_DIR)/bin/$$bin-$(subst $(NOOP) ,-,$(sort $(BUILD_TAGS))) $(BUILD_DIR)/bin/$$bin && \
			$(call mesg_ok) || $(call mesg_fail); \
	done
endif

build-assets:
	@$(call mesg_start,build,Building assets...)
	@BUILD_DIR=$(BUILD_DIR) $(GULP) $(GULP_ARGS) build --env $(BUILD_ENV) >/dev/null && \
		$(call mesg_ok) || $(call mesg_fail)

build-docs:
	@for man in $(MAN_LIST); do \
		$(call mesg_start,docs,Generating $$man manual page...); \
		install -d -m 0755 $(BUILD_DIR)/man && \
		$(PANDOC) $(PANDOC_ARGS) docs/man/$$man.md >$(BUILD_DIR)/man/$$man && \
			$(call mesg_ok) || $(call mesg_fail); \
	done

test: test-bin

test-bin: build-dir
	@$(call mesg_start,test,Testing packages...)
	@(cd $(BUILD_DIR) && $(GB) test -v) && \
		$(call mesg_ok) || $(call mesg_fail)

install: install-bin

install-bin: build-bin
	@$(call mesg_start,install,Installing binaries...)
	@install -d -m 0755 $(PREFIX)/bin && \
		install -m 0755 $(BUILD_DIR)/bin/* $(PREFIX)/bin/ && \
		$(call mesg_ok) || $(call mesg_fail)

lint: lint-bin lint-assets

lint-bin:
	@for pkg in $(PKG_LIST); do \
		$(call mesg_start,lint,Checking $$pkg sources...); \
		$(GOLINT) $(GOLINT_ARGS) ./src/$$pkg && \
			$(call mesg_ok) || $(call mesg_fail); \
	done

lint-assets:
	@$(call mesg_start,lint,Checking assets sources...)
	@BUILD_DIR=$(BUILD_DIR) $(GULP) $(GULP_ARGS) lint && \
		$(call mesg_ok) || $(call mesg_fail)

update-locale:
	@$(call mesg_start,locale,Updating locale files...)
	@BUILD_DIR=$(BUILD_DIR) $(GULP) $(GULP_ARGS) update-locale >/dev/null && \
		$(call mesg_ok) || $(call mesg_fail)
