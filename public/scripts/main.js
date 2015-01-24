require.config({
  shim: {

  },
  paths: {
    crafty: "../bower_components/crafty/dist/crafty",
    jquery: "../bower_components/jquery/dist/jquery",
    require: "../bower_components/requirejs/require",
    TiledMapBuilder: "../TiledMapBuilder/tiledmapbuilder",
    TiledMapMocks: "../TiledMapBuilder/create_mocks_module",
    util: "./Util",
    numeric: "../bower_components/numeric/numeric-1.2.6"
  },
  packages: [

  ]
});

requirejs(['./game']);
