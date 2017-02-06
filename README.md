Url Shortener - Backend Nodejs

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
./config/config.live.json
```

#### Run live project ####

```
./npm run live
```

If you're using supervisor, you can use this configuration:

```
directory={YOUR PROJETCT DIRECTORY}
command=npm run live
```
