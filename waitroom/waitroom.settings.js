/**
 * Standard Waiting Room settings.
 */

var ngamt = require('nodegame-mturk')();

var EXPIRE_LIMIT;
var RE_EXTEND_ASS = 5;

module.exports = {

    // How many clients must connect before groups are formed.
    POOL_SIZE: 1,

    // The size of each group.
    GROUP_SIZE: 1,

    // Maximum waiting time.
    // MAX_WAIT_TIME: 600000,

    // Treatment assigned to groups.
    // If left undefined, a random treatment will be selected.
    // Use "treatment_rotate" for rotating the treatmenrs.
    CHOSEN_TREATMENT: 'rank_skew', // 'rank_same',

    EXECUTION_MODE: 'WAIT_FOR_N_PLAYERS',

    ON_CONNECT: function(room, player) {
        var part2, totPlayers;
        totPlayers = getTotPlayers(room);

        console.log('ON_CONNECT!!');

        // Expire HIT if we have 20 players between the two rooms.
        if (!room.hitExpired && totPlayers >= EXPIRE_LIMIT) {
            room.hitExpired = true;
            room.closeRoom();

            console.log('ON_CONNECT!! 2');

            ngamt.modules.manageHIT.expire(function(err) {
                if (err) {
                    room.hitExpired = false;
                    room.openRoom();
                }
            });
        }
    },

    ON_DISCONNECT: function(room, player) {
        var part2, totPlayers;
        totPlayers = getTotPlayers(room);

        console.log('ON_DISC!!');

        // Expire HIT if we have 20 players between the two rooms.
        if (room.hitExpired && totPlayers < EXPIRE_LIMIT) {
            room.hitExpired = false;
            room.openRoom();

            console.log('ON_DISC!! 2');

            // Extend or mark as expired again.
            ngamt.modules.manageHIT.extend({
                assignments: RE_EXTEND_ASS
            }, function(err) {
                if (err) {
                    // Reset
                    room.hitExpired = true;
                }
                else {
                    room.closeRoom();
                }
            });
        }
    },

    ON_INIT: function(room) {
        var part2;
        part2 = room.channel.gameLevels.part2.waitingRoom;
        EXPIRE_LIMIT = part2.POOL_SIZE;
        console.log('EXPIRE_LIMIT: ' + EXPIRE_LIMIT);
        this.hitExpired = false;
        ngamt.api.connect({ getLastHITId: true });
    },

    DISPATCH_TO_SAME_ROOM: true
};

// ## Helper methods

/**
 * ## Returns the total number of players across the two levels
 *
 * If part2 has not dispatched 2 games already, it return 0
 *
 * @param {WaitingRoom} room This waiting room
 *
 * @return {number} The total number of players
 */
function getTotPlayers(room) {
    var part2,
    part2 = room.channel.gameLevels.part2.waitingRoom;
    if (part2.numberOfDispatches < 2) return 0;
    return part2.size() + room.size();
}
