To create a translation file place a .json file named after the locale in this directory.

The json file contains all labels and their translations. You can use placeholders in the following pattern: ":placeholder".

You can translate labels using:

    geddy.i18n.getText('some label', {placeholder: 'replacement'});


Example:

    config/locales/en_US.json

    {
      "some label": "label translation with :placeholder",
      "some other label": "another translation"
    }