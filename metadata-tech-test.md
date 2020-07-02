# Gutenberg Metadata Extraction

### Description

The challenge is to build a metadata extractor for all the project Gutenberg titles which are available in [zip](http://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.zip) and [tar](http://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2) format

Each book has an RDF file which will need to be processed to extract the:

- id (will be a number with 0-5 digits)
- title
- author/s
- publisher (value will always be Gutenberg)
- publication date
- language
- subject/s
- license rights

    *Note: For some books all of the data won't be available.*

### Objective

- Write a function that reads a single file in and outputs the correct output, using something
like ​[xml2js](https://www.npmjs.com/package/xml2js) ​ or [xmldom](https://www.npmjs.com/package/xmldom) ​will probably be useful to read the rdf files
- Store the output in a database of your choice locally for later querying, perhaps something
like ​[sequelize](https://github.com/sequelize/sequelize​) with MySQL/PostGreSQL or use something else!
- Write unit tests in a testing framework like mocha or jest for the code, ensuring that coverage information is saved
- Run the function against all the rdf files
- Send through the code once you're done, ensuring that if you create a github repo the name is simply your name concatenated with "example-code" if using with your test coverage analysis file

### Important aspects to consider

- Scalability, how long does it take to index all the content, what sort of memory consumption/network optimisations have you done?
- Reliability, does all the information process correctly? How thorough are your unit tests?
- Querying the dataset, how should the database be configured to search for specific fields quickly? Such as
  - Title
  - Author name
  - Publication date
