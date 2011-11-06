PACKAGE := $(shell grep '  name=' addon.xml |cut -d'"' -f2)
VERSION := $(shell grep '  version' addon.xml | cut -d'"' -f2)
RELEASE_DIR := ..
RELEASE_FILE := $(PACKAGE)-$(VERSION).zip
zip:
	cd $(RELEASE_DIR); \
	zip -r $(RELEASE_FILE) $(PACKAGE) -x "$(PACKAGE)/.git/*"

clean:
	rm $(RELEASE_DIR)/$(RELEASE_FILE)
