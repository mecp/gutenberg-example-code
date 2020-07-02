import * as fs from 'graceful-fs';
import * as path from 'path';
import * as xmlParser from 'fast-xml-parser';
import { promisify } from 'util';

import get from 'lodash/get';
import split from 'lodash/split';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import last from 'lodash/last';
import toInteger from 'lodash/toInteger';
import { Book } from './types/book';

const gutenbergDataDirPath = path.resolve(process.cwd(), `gutenberg-data/epub`);

/**
 * RDF XML Paths without namespaces to fetch book fields
 */
export const BookInfoPaths = {
  about: 'RDF.ebook._attributes.about',
  title: 'RDF.ebook.title._value',
  publisher: 'RDF.ebook.publisher._value',
  publicationDate: 'RDF.ebook.issued._value',
  languageCode: 'RDF.ebook.language.Description.value._value',
  subjects: 'RDF.ebook.subject.$.Description.value._value',
  licenseRights: 'RDF.ebook.rights._value'
};

/**
 * RDF XML Path without namespace to fetch authors array
 */
export const AgentsPathInBook = 'RDF.ebook.creator.agent';

/**
 * RDF XML Paths without namespaces to fetch authors fields
 */
export const AuthorInfoPaths = {
  about: '_attributes.about',
  name: 'name._value',
  birthYear: 'birthdate._value',
  deathYear: 'deathdate._value',
  webpage: 'webpage._value',
  aliases: 'alias.$._value'
};

/**
 * Get rdf file path for given book id
 * @param bookId book id
 */
export const getPathForBookId = (bookId: number | string) => `${gutenbergDataDirPath}/${bookId}/pg${bookId}.rdf`;

/**
 * Get all rdf file paths as array (synchronous)
 */
export const getBookPathsSync = () =>
  map(
    fs.readdirSync(gutenbergDataDirPath),
    (bookFolder) => `${gutenbergDataDirPath}/${bookFolder}/pg${bookFolder}.rdf`
  );

/**
 * Get all rdf file paths as array (asynchronous)
 */
export const getBookPathsAsync = async () =>
  promisify(fs.readdir)(gutenbergDataDirPath).then((bookFolders) =>
    map(bookFolders, (bookFolder) => getPathForBookId(bookFolder))
  );

/**
 * Read book rdf file as file buffer (synchronous)
 * @param bookPath book rdf path
 */
export const readBookFileSync = (bookPath: string) => (fs.existsSync(bookPath) ? fs.readFileSync(bookPath) : null);

/**
 * Read book rdf file as file buffer (asynchronous)
 * @param bookPath book rdf path
 */
export const readBookFileAsync = async (bookPath: string) =>
  promisify(fs.exists)(bookPath).then((exists) => (exists ? promisify(fs.readFile)(bookPath) : null));

/**
 * Parse RDF xml string as javascript object (synchronous)
 * @param rdfXml RDF xml string
 */
export const parseRdfXmlStringToJson = (rdfXml: string) =>
  xmlParser.parse(rdfXml, {
    allowBooleanAttributes: true,
    ignoreAttributes: false,
    attrNodeName: '_attributes',
    attributeNamePrefix: '',
    ignoreNameSpace: true,
    textNodeName: '_value',
    arrayMode: false,
    trimValues: true
  });

/**
 * Parse RDF xml string as javascript object (asynchronous)
 * @param rdfXml RDF xml string
 */
export const parseRdfXmlStringToJsonAsync = async (rdfXml: string): Promise<Object> =>
  new Promise((resolve, reject) => {
    try {
      resolve(parseRdfXmlStringToJson(rdfXml));
    } catch (err) {
      reject(err);
    }
  });

/**
 * Ensure supplied object is an array, if not wrap in array and return
 * @param obj array or object to wrap in array
 */
const ensureArray = (obj: Object[] | Object) => {
  if (!obj) return obj;

  return Array.isArray(obj) ? obj : [obj];
};

/**
 * Get value for given path in rdf javascript object
 *
 * Some paths may contain a '$' sign, that means, path
 * before the $ sign is path to an array and path afterwards
 * will give the scalar value. e.g. 'alias.$._value'
 *
 * @param obj object from which values are to be read
 * @param path path of the field to get value
 */
// supports only one level of array
const nestedPropertyGetter = (obj: Object, path: string) => {
  const arrayPaths = split(path, '.$.');

  if (arrayPaths.length === 1) {
    return get(obj, path);
  } else if (arrayPaths.length === 2) {
    return map(ensureArray(get(obj, arrayPaths[0])), (nestedObj) => get(nestedObj, arrayPaths[1]));
  } else {
    return undefined;
  }
};

/**
 * Read Book object from rdf javascript object
 * @param bookRdfJson javascript object parsed from rdf xml
 */
export const readBookInfoFromRdfJson = (bookRdfJson: Object): Book => {
  const agents = ensureArray(get(bookRdfJson, AgentsPathInBook));
  const { about: bookAbout, ...book } = {
    ...mapValues(BookInfoPaths, (infoPath) => nestedPropertyGetter(bookRdfJson, infoPath)),
    authors: map(agents, (agent) => {
      const { about: authorAbout, ...author } = mapValues(AuthorInfoPaths, (infoPath) =>
        nestedPropertyGetter(agent, infoPath)
      );

      return {
        ...author,
        id: toInteger(last(split(authorAbout, '/')))
      };
    })
  };

  return {
    ...book,
    id: toInteger(last(split(bookAbout, '/')))
  };
};
