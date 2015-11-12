# The ultimate restify dummy server #

**If you are developing a REST-Client than you definitely  need this mock server**

## Installation ##

```bash
npm install rest-server-dummy -g
```

## What It Does for You ##

When you are dealing with remote REST API's as a developer of a client Application, than you should have *something* on your local machine that mocks the API. 

**rest-server-dummy** is the tool you want to debug GET, POST  PUT and DELETE calls in the easiest way. Here is the  simple elegance of stupidity that just works. It will save you from a lot of trouble while you developing on your software.


## How To Use It ##

After you have installed the Software, you should start the server:

```bash
node rest-server-dummy
```

The default server settings are:

|           |           |
|:----------|----------:|  
|PORT       | 8080      |  
|DIRECTORY  | ./        |  

Now you can work with the server in your application with the url 

```
http://localhost:8080/some/great/file.json
```

in 1.0.3 you do not have to provide .json to the resouce

```
http://localhost:8080/some/great/file
```
will generate a file in the /some/great directory that called file.json


### POST ###

Everytime you post a document to the server it will create a file in the DIRECTORY. If you are working with the default setting, and post /some/great/file.json, than a directory called "some" will be created in your current work directory. Inside that directory an other one named "great" is created and inside this a file named "file.json" stores the content from your POST Request. 

To explain further examples, we asume at this point that you post a document that looks like this: 

```json
{
   "name": "james"
}
```

It is not very complex but you will know better what fits your needs and can build your own document. 

### PUT ###

A PUT will alter a document. For example we a document to the same address: some/great/file.json

```json
{
   "gender": "male"
}
```

Than the result in the file will be merged to:

```json
{
    "name": "james",
    "gender": "male"
}
```

### GET ###

You can fetch posted documents, or you can copy mock .json files to the directory structure and fetch them with a GET Request.

A GET on some/great/file.json will return the same document: 

```json
{
    "name": "james",
    "gender": "male"
}
```


### DELETE ###

If you request a DELETE method, the file, and the directories will be removed. A GET after a DELETE should produce a 404.

The directories will be removed when there is no other file only. Even a .response file will halt the removing process!

While deleting a resource no request file is produced. 

## The .request File ##

Every call will produce a extra file with the suffix .request If you are GET/POST/PUT a resourcece (for example:  some/great/file.json), a file named  some/great/file.request will be written. In this file your request headers are stored. 

```json
{
  "host": "localhost:8080",
  "accept": "*/*",
  "content-type": "application/x-www-form-urlencoded",
  "connection": "keep-alive",
  "user-agent": "YourApp/0.1",
  "accept-language": "en-us",
  "accept-encoding": "gzip, deflate",
  "content-length": "7"
}
```

This is very handy when you debugging your client. All headers are stored right beside the content.

## Extra Options ##

Maybe you do not want the results in the working directory? No Problem, just start up the server with a DIRECTORY option and all files are stored there:

```bash
DIRECTORY=/tmp node rest-server-dummy
```

## Mastering Your Calls ##

Debugging clients is hard. But not as hard as [Haddekuche](http://en.wikipedia.org/wiki/Haddekuche)! 

To fetch the document with additional headers, you can write a .response file with the same baseman as your resource and store some headers there. 
In our example a file named:  some/great/file.response will be merged to the headers that are returned to your client. 

```json
{
  "foo": "bar"
}
```

That response file will produce a header like: 

```
Content-Type: application/json
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Server: rest-server-dummy
Access-Control-Expose-Headers: Api-Version, Request-Id, Response-Time
Api-Version: 1.0.0
Content-MD5: TGOyctqnSLSYozRZIPJyyQ==
Access-Control-Allow-Headers: Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, Api-Version, Response-Time
Response-Time: 15
Date: Fri, 27 Feb 2015 16:31:56 GMT
Content-Length: 126
Connection: Keep-Alive
Request-Id: 25570e50-be9e-11e4-b5c2-235a2c2e6d6c
foo: bar
```

## Questions ##
Ask us on Twitter @ausderTechnik

## Spend a Satoshi ##
if you like this tool, spend a Satoshi to this address:

```
1DtvkCh28zqarTEUHtxs7gWtutsv2Cnf9d
```




