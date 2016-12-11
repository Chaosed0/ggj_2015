require.config({
  shim: {

  },
  paths: {
    crafty: "../bower_components/crafty/dist/crafty",
    jquery: "../bower_components/jquery/dist/jquery",
    require: "../bower_components/requirejs/require",
    PriorityQueue: "../bower_components/js-priority-queue/priority-queue",
    numeric: "../bower_components/numeric/lib/numeric-1.2.6",
	seedrandom: "../bower_components/seedrandom/seedrandom",
    util: "./Util",
  },
  packages: [

  ]
});

requirejs(['./game']);
