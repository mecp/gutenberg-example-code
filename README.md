### Instructions

Install dependencies

```sh
$ npm i
```

Setup volume directory for postgres data

```sh
$ mkdir -p $HOME/docker/volumes/postgres
```

Start postgres container

```sh
$ docker run --rm   --name pg-docker -e POSTGRES_PASSWORD=docker -d -p 5432:5432 -v $HOME/docker/volumes/postgres:/var/lib/postgresql/data  postgres
```

Download Gutenberg RDF files and extract (This takes few minutes to complete download and extraction)

```sh
$ npm run download-data
```

To parse and see a book as json using book id from RDF files, `1090` is book id here

```sh
$ npm run parse-book -- 1090
```

Start ingesting books to database

```sh
$ npm run ingest
```

To fetch a book using book id as stored ins database and see as json, `1090` is book id here

```sh
$ npm run fetch-book -- 1090
```

#### Notes:

- Promise pool is used speed up the ingestion process with pool size 20 to keep the file io and memory in check
- It takes about 460 seconds to ingest all books
- LRU cache is used with a limited max capacity configuration(control over memory usage) to store related entities like authors and subjects that might relate to multiple books
- Both sync and async versions of file system operations are implemented, but no major performance differnece seen
- Further improvements can be made by using batch insertion of books using single db operation
- GIN indices on Book title, Publisher, Subject and Author name is added to database to make text search or `%LIKE%` queries faster.
- Proper formatting, linting, test and coverage setup has been done but no tests added due to lack of time
