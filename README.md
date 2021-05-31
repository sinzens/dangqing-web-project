# dangqing-web-project

## Project setup
```
yarn install
```

### Runtime dependencies
Development
- Please make sure there is **about.html** in `./dist_electron`, otherwise the integrated instruction document will not be loaded
- `./dist_electron` will be generated after setup, if there is no **about.html** in it, please copy the existing file from `./others`

Deploy
- Please make sure there is **about.html** in the working directory (where .exe is located)

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
