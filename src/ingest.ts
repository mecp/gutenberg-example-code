import PromisePool from '@mixmaxhq/promise-pool';
import LRU from 'lru-cache';
import logUpdate from 'log-update';

import map from 'lodash/map';
import toString from 'lodash/toString';

import { sequelize } from './db/sequelize';

import {
  readBookInfoFromRdfJson,
  getBookPathsAsync,
  parseRdfXmlStringToJsonAsync,
  readBookFileAsync
} from './rdf-utils';
import { Book } from './types/book';
import { Author } from './types/author';
import { Subject } from './types/subject';
import { Publisher } from './types/publisher';
import {
  publisherRepository,
  bookRepository,
  subjectRepository,
  bookSubjectRepository,
  authorRepository,
  authorAliasRepository,
  bookAuthorRepository
} from './db/repositories';

const subjectCache = new LRU<string, Promise<Subject>>(10000);
const authorCache = new LRU<string, Promise<Author>>(10000);
const publisherCache = new LRU<string, Promise<Publisher>>(10000);

/**
 * Insert supplied book with it's nested associations to database tables
 * @param book book object
 */
const addBookToDb = async (book: Book) => {
  const { authors, subjects, publisher: publisherName, ...bookDbProps } = book;

  // check publisher if available in cache
  // if not, check in db, add to cache or insert to db
  let publisherPromise = publisherCache.get(publisherName);
  if (!publisherPromise) {
    publisherPromise = publisherRepository
      .findOne({ where: { name: publisherName }, raw: true })
      .then((publisher) => publisher ?? publisherRepository.create({ name: publisherName }));
    publisherCache.set(publisherName, publisherPromise);
  }

  const publisher = await publisherPromise;

  // add book to database
  const addedBook = await bookRepository.create({
    ...bookDbProps,
    publisherId: publisher.id
  });

  // add book subjects
  // check if subject ids available in cache else fetch from db and cache
  // if not available in db as well then create and cache
  const subjectRecords = await Promise.all(
    map(subjects, async (subjectName) => {
      let subjectPromise = subjectCache.get(subjectName);
      if (!subjectPromise) {
        subjectPromise = subjectRepository
          .findOne({ where: { name: subjectName }, raw: true })
          .then((publisher) => publisher ?? subjectRepository.create({ name: subjectName }));
        subjectCache.set(subjectName, subjectPromise);
      }

      return subjectPromise;
    })
  );

  await bookSubjectRepository.bulkCreate(
    map(subjectRecords, (subject) => ({ bookId: addedBook.id, subjectId: subject.id }))
  );

  // add book authors, check if already added in cache, else check db and cache
  // if not available in db as well then create and cache
  // if adding author, then add aliases
  const authorRecords = await Promise.all(
    map(authors, async (author) => {
      const { aliases, ...authorDbProps } = author;
      let authorPromise = authorCache.get(toString(author.id));
      if (!authorPromise) {
        authorPromise = authorRepository
          .findByPk(author.id, { raw: true })
          .then((authorRecord) => authorRecord ?? authorRepository.create(authorDbProps))
          .then(
            async (authorRecord) =>
              authorAliasRepository
                .bulkCreate(map(aliases, (alias) => ({ authorId: authorRecord.id, alias })))
                .then(() => authorRecord) as Promise<Author>
          );
        authorCache.set(toString(author.id), authorPromise);
      }
      return authorPromise;
    })
  );

  return bookAuthorRepository.bulkCreate(
    map(authorRecords, (author) => ({ bookId: addedBook.id, authorId: author.id }))
  );
};

const start = async () => {
  await sequelize.sync({ force: true });

  console.log('Connected to database');

  // read all book paths
  const bookPaths = await getBookPathsAsync();
  const numOfBooks = bookPaths.length;
  console.log(`Ingesting ${numOfBooks} books to database`);

  const pool = new PromisePool({ numConcurrent: 20 });

  // lodash or vanilla forEach won't wait for promise,
  // to use the backpressure benefits, using plain `for loop`
  for (let index = 0; index < numOfBooks; ++index) {
    const bookPath = bookPaths[index];

    logUpdate(`[${index + 1}/${numOfBooks}] Adding ${bookPath}`);
    await pool.start(async () => {
      const bookRdfFile = await readBookFileAsync(bookPath);
      const bookRdfJson = await (bookRdfFile
        ? parseRdfXmlStringToJsonAsync(bookRdfFile.toString())
        : Promise.reject(new Error(`Error while reading: ${bookPath}`)));
      return addBookToDb(readBookInfoFromRdfJson(bookRdfJson));
    });
  }

  // wait for any pending promised in the pool
  const errors = await pool.flush();

  if (errors.length) {
    console.log('done with errors', errors);
  } else {
    console.log('Ingestion done');
  }
};

// start ingesting books to database
const startTime = new Date().getTime();
start()
  .then(() => {
    logUpdate.done();
    logUpdate(`Completed in ${(new Date().getTime() - startTime) / 1000} seconds`);
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
