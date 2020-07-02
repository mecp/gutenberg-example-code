import toInteger from 'lodash/toInteger';
import isSafeInteger from 'lodash/isSafeInteger';
import {
  readBookFileAsync,
  parseRdfXmlStringToJsonAsync,
  readBookInfoFromRdfJson,
  getPathForBookId
} from './rdf-utils';

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.log('Improper arguments supplied, please supply numeric book id only, e.g. node dist/parse.js 704');
  process.exit(1);
}

/**
 * Reads Book info from rdf file for given book id
 * @param bookId book id
 */
const readBookInfoAsJson = async (bookId: number) => {
  if (!isSafeInteger(bookId)) throw new Error(`Improper book id supplied: ${bookId}`);

  const bookRdfPath = getPathForBookId(bookId);
  const bookRdfFile = await readBookFileAsync(bookRdfPath);
  const bookRdfJson = await (bookRdfFile
    ? parseRdfXmlStringToJsonAsync(bookRdfFile.toString())
    : Promise.reject(new Error(`Error while reading: ${bookRdfPath}`)));
  return readBookInfoFromRdfJson(bookRdfJson);
};

/**
 * Read book object from RDF file for book id supplied as command line argument
 */
readBookInfoAsJson(toInteger(args[0]))
  .then((book) => {
    console.log(JSON.stringify(book, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
