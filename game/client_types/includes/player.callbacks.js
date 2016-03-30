/**
 * # Functions used player clients in the Art Exhibition Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {
    init: init,
    instructions: instructions,
    quiz: quiz,
    creation: creation,
    evaluation: evaluation,
    dissemination: dissemination,
    questionnaire: questionnaire,
    endgame: endgame
};

function init() {
    var that, waitingForPlayers, treatment, header;

    that = this;
    this.node.log('Init.');

    // Setup the header (by default on the left side).
    if (!W.getHeader()) {
        header = W.generateHeader();

        // Uncomment to visualize the name of the stages.
        //node.game.visualStage = node.widgets.append('VisualStage', header);

        node.game.rounds = node.widgets.append('VisualRound', header, {
            displayModeNames: ['COUNT_UP_STAGES_TO_TOTAL'],
            stageOffset: 1
        });

        node.game.timer = node.widgets.append('VisualTimer', header);

        node.game.money = node.widgets.append('MoneyTalks', header, {
            currency: 'CHF', money: 10
        });

    }

    // Add the main frame where the pages will be loaded.
    if (!W.getFrame()) {
        W.generateFrame();
    }

    this.html = {};

    node.env('review_select', function(){

	node.game.html.creation = 'creation_SEL.html';

	node.env('coo', function() {
	    node.game.html.q = 'questionnaire_SEL_COO.html';
	    node.game.html.instructions = 'instructions_SEL_COO.html';
	});
	node.env('com', function() {
	    node.game.html.q = 'questionnaire_SEL_COM.html';
	    node.game.html.instructions = 'instructions_SEL_COM.html';
	});
    });
    node.env('review_random', function(){

	node.game.html.creation = 'creation_RND.html';

	node.env('coo', function(){
	    node.game.html.q = 'questionnaire_RND_COO.html'; // won't be played now
	    node.game.html.instructions = 'instructions_RND_COO.html';
	});
	node.env('com', function(){
	    node.game.html.q = 'questionnaire_RND_COM.html';
	    node.game.html.instructions = 'instructions_RND_COM.html';
	});
    });


    this.cf = null;
    this.outlet = null;
    this.exs = ['A','B','C'];
    this.donetxt = 'Done!';
    this.milli = 1000;
    this.milli_short = 1000;


    this.evaAttr = {
	min: 1,
	max: 9,
	step: 0.5,
	value: 4.5
    };

    this.evas = {};
    this.evasChanged = {};

    this.all_ex = new W.List({ id: 'all_ex',
			       lifo: true,
		             });

    this.personal_history = null;

    this.last_cf = null;

    this.renderCF = function(cell) {

	// Check if it is really CF obj
	if (!cell.content || !cell.content.cf) {
	    return;
	}

	var w = 200;
	var h = 200;

	if (node.game.gameLoop.getName() == 'Creation') {
	    w = 100;
	    h = 100;
	}

	var cf_options = {
            id: 'cf_' + cell.x,
	    width: w,
	    height: h,
	    features: cell.content.cf,
	    controls: false,
	    change: false,
	    onclick: function() {
		var that = this;
		var f = that.getAllValues();

		var cf_options = { id: 'cf',
				   width: 400,
				   height: 400,
				   features: f,
				   controls: false,
				 };

		var cf = node.widgets.get('ChernoffFacesSimple',
                                          cf_options);


		var div = $('<div class="copyorclose">');
		$(cf.canvas).css('background', 'white');
		$(cf.canvas).css('border', '3px solid #CCC');
		$(cf.canvas).css('padding', '5px');

		div.append(cf.canvas);

		var buttons = [];
		if (node.game.gameLoop.getName() !== 'Exhibition') {
		    buttons.push({
			text: 'copy',
			click: function() {
			    node.emit('COPIED', f);
			    node.set('COPIED', {
				author: cell.content.author,
				ex: cell.content.ex,
				mean: cell.content.mean,
				round: cell.content.round,
			    });
			    $( this ).dialog( "close" );
			},
		    });
		}

		buttons.push({
		    text: 'Cancel',
		    click: function() {
			$( this ).dialog( "close" );
		    },
		});

		div.dialog({
		    width: 460,
		    height: 560,
		    show: "blind",
		    hide: "explode",
		    buttons: buttons,
		});
	    }
	};

	var container = document.createElement('div');

	var cf = node.widgets.append('ChernoffFacesSimple',
                                     container,
                                     cf_options);

	var details_tbl = new W.Table();
	details_tbl.addColumn(['Author: ' + cell.content.author,
			       'Score: ' + cell.content.mean
			      ]);
	container.appendChild(details_tbl.parse());

	return container;

    };
}

function instructions() {
    var that = this;

    W.loadFrame(node.game.html.instructions, function() {

        // TODO: html pages have own button and js handler.
        var b = W.getElementById('read');
        b.onclick = function() {
            node.done();
        };

        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.done();
            }, 2000);
        });
    });
    console.log('Instructions');
}

function quiz() {
    var that = this;
    W.loadFrame('quiz.html', function() {
        var b, QUIZ;
        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.game.timer.doTimeUp();
            });
        });
    });
    console.log('Quiz');
}

function creation() {
    W.loadFrame(this.html.creation, function(){
	node.on('CLICKED_DONE', function(){
	    $( ".copyorclose" ).dialog('close');
	    $( ".copyorclose" ).dialog('destroy');
	});
    });
    console.log('Creation');
}


function evaluation() {
    W.loadFrame('evaluation.html');
    console.log('Evaluation');
}

function dissemination() {

    var dt_header = 'Round: ' + node.player.stage.round;

    this.all_ex.addDT(dt_header);

    var table = new W.Table({
        className: 'exhibition',
	render: {
	    pipeline: this.renderCF,
	    returnAt: 'first',
	}
    });

    table.setHeader(['A','B','C']);

    W.loadFrame('dissemination.html', function() {

	node.game.timer.stop();

	node.on.data('WIN_CF', function(msg) {

	    if (msg.data.length) {
		var db = new node.NDDB(null,msg.data);

		for (var j=0; j < this.exs.length; j++) {
		    var winners = db.select('ex', '=', this.exs[j])
			.sort('mean')
			.reverse()
			.fetch();


		    if (winners.length > 0) {
			table.addColumn(winners);
		    }
		    else {
			table.addColumn([' - ']);
		    }
		}

		//$('#mainframe').contents().find('#done_box').before(table.parse());

		W.getElementById('container_exhibition').appendChild(table.parse());

		this.all_ex.addDD(table);

	    }

	    else {
		var str = 'No painting was considered good enough to be put on display';
		W.write(str, W.getElementById("container_exhibition"));
		this.all_ex.addDD(str);
	    }

	    node.game.timer.restart({
		milliseconds: 15000,
		timeup: 'DONE',
	    });
	});

	node.on.data('PLAYER_RESULT', function(msg){
	    if (!msg.data) return;
	    var str = '';
	    if (msg.data.published) {
		str += 'Congratulations! You published in exhibition: <strong>' + msg.data.ex + '</strong>. ';
		str += 'You earned <strong>' + msg.data.payoff  + ' CHF</strong>. ';
		node.emit('MONEYTALKS', parseFloat(msg.data.payoff));
	    }
	    else {
		str += 'Sorry, you got rejected by exhibition: <strong>' + msg.data.ex + '</strong>. ';
	    }
	    str += 'Your average review score was: <strong>' + msg.data.mean + '</strong>.</br></br>';
	    W.getElementById('results').innerHTML = str;

	});

	// Auto play.
	node.env('auto', function() {
	    node.timer.randomExec(function() {
                node.done();
            }, 5000);
	});
    });

    console.log('Dissemination');
}

function questionnaire() {
    W.loadFrame(this.html.q);
    console.log('Postgame');

    // Auto play.
    node.env('auto', function(){
	node.timer.randomExec(function() {
            node.done();
        }, 5000);
    });

}

function endgame() {
    W.loadFrame('ended.html');
    console.log('Game ended');
}

