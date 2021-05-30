# dangqing-web-project

## Project setup
```
yarn install
```

### Runtime dependencies
- Please make sure there is **config.json** in `./dist_electron` before compiling or building, otherwise the app **will fail to connect to database** and you will get a notification dialog with error messages when app is running
- `./dist_electron` will be generated after setup, if there is no **config.json** in it, please copy the existing file from `./others`

### Compiles and hot-reloads for development
```
yarn electron:serve
```

### Compiles and minifies for production
```
yarn electron:build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
