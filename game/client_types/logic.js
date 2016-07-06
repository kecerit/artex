/**
 * # Logic code for Artex
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

var ngc = require('nodegame-client');
var stepRules = ngc.stepRules;

// Here we export the logic function. Receives three parameters:
// - node: the NodeGameClient object.
// - channel: the ServerChannel object in which this logic will be running.
// - gameRoom: the GameRoom object in which this logic will be running.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var channel = gameRoom.channel;
    var node = gameRoom.node;

    stager.setOnInit(function() {
        node.on.data('finished_part1', function(msg) {
            console.log('moving client to part2: ', msg.from);
            channel.moveClientToGameLevel(msg.from, 'part2', gameRoom.name);
        });
    });

    stager.setDefaultStepRule(stepRules.SOLO);

    // Here we group together the definition of the game logic.
    return {
        nodename: 'lgc_part1',
        // Extracts, and compacts the game plot that we defined above.
        plot: stager.getState(),
        // If debug is false (default false), exception will be caught and
        // and printed to screen, and the game will continue.
        debug: settings.DEBUG,
        // Controls the amount of information printed to screen.
        verbosity: 0,
        // nodeGame enviroment variables.
        env: {
            auto: settings.AUTO,
            review_select: !!settings.review_select,
            review_random: !!settings.review_random,
            com: !!settings.com,
            coo: !!settings.coo
        }
    };
};
