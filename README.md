The api is in:
http://api.lfum.es

Url Shortener - Backend Nodejs

### Project ###

Return all documents
```
GET /
```

Search document
```
GET /hash
```

Create a new document.
```
POST /
Content-Type: application/json
Body
{
    "url": "http://example.com.br"
}
```

Update document
```
PUT /hash
Content-Type: application/json
Body
{
    "url": "http://example.com.br"
}
```
Delete document
```
DELETE /hash
```


### Dev machine ###

#### Dependencies ####
- Docker  - (https://docs.docker.com/engine/installation/)
- Docker Compose - (https://docs.docker.com/compose/install/)

#### Run local project ####

```
$ docker-compose up -d
```

### Live machine ###

It's necessary create a config live file:

```
config/config.live.json
```

#### Run live project ####

```
npm run live
```

If you're using supervisor, you can use this configuration:

```
directory={YOUR PROJETCT DIRECTORY}
command=npm run live
```
