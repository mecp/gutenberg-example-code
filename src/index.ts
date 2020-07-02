import toInteger from 'lodash/toInteger';
import isSafeInteger from 'lodash/isSafeInteger';
import {
  bookRepository,
  subjectRepository,
  authorRepository,
  authorAliasRepository,
  publisherRepository
} from './db/repositories';

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.log('Improper arguments supplied, please supply numeric book id only, e.g. node dist/index.js 704');
  process.exit(1);
}

/**
 * Reads Book and associated information from database for given book id
 * @param bookId book id
 */
const getBookFromDatabase = async (bookId: number) => {
  if (!isSafeInteger(bookId)) throw new Error(`Improper book id supplied: ${bookId}`);

  return bookRepository.findByPk(bookId, {
    include: [
      publisherRepository,
      { model: subjectRepository, through: { attributes: [] } },
      { model: authorRepository, include: [authorAliasRepository], through: { attributes: [] } }
    ]
  });
};

/**
 * Read book from database for book id supplied as command line argument
 */
getBookFromDatabase(toInteger(args[0]))
  .then((book) => {
    console.log(JSON.stringify(book, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
