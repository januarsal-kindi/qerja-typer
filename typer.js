//score variable globa
var score;

var Word = Backbone.Model.extend({
	move: function() {
		this.set({y:this.get('y') + this.get('speed')});
	}
});

var Words = Backbone.Collection.extend({
	model:Word
});

var WordView = Backbone.View.extend({
	initialize: function() {
		$(this.el).css({position:'absolute',width: "auto !important", overflow: "hidden", "min-width":"1000px", width: "1000px"});
		var string = this.model.get('string');
		var letter_width = 25;
		var word_width = string.length * letter_width;
		if(this.model.get('x') + word_width > $(window).width()) {
			this.model.set({x:$(window).width() - word_width});
		}
		for(var i = 0;i < string.length;i++) {
			$(this.el)
				.append($('<div>')
					.css({
						width:letter_width + 'px',
						padding:'5px 2px',
						'border-radius':'4px',
						'background-color':'#fff',
						border:'1px solid #ccc',
						'text-align':'center',
						float:'left'
					})
				.text(string.charAt(i).toUpperCase()));
		}
		
		this.listenTo(this.model, 'remove', this.remove);
		
		this.render();
	},
	
	render:function() {
		$(this.el).css({
			left:this.model.get('x') + 'px'
		});

		// add animation for move position
		$(this.el).animate({
			top: this.model.get('y') + 'px',
		  }, 75)
		 
		
		var highlight = this.model.get('highlight');
		$(this.el).find('div').each(function(index,element) {
			if(index < highlight) {
				$(element).css({'font-weight':'bolder','background-color':'#aaa',color:'#fff'});
			} else {
				$(element).css({'font-weight':'normal','background-color':'#fff',color:'#000'});
			}
		});
	}
});



var TyperView = Backbone.View.extend({
	initialize: function() {
		var wrapper = $('<div>')
			.css({
				position:'fixed',
				top:'0',
				left:'0',
				width:'100%',
				height:'100%'
			}).addClass('container');
		this.wrapper = wrapper;
		
		var self = this;
		var text_input = $('<input>')
			.addClass('form-control')
			.css({
				'border-radius':'4px',
				position:'absolute',
				bottom:'0',
				'min-width':'80%',
				width:'80%',
				'margin-bottom':'10px',
				'z-index':'1000'
			}).keyup(function() {
				var words = self.model.get('words');
				var wordcorecction = true;
				for(var i = 0;i < words.length;i++) {
					var word = words.at(i);
					var typed_string = $(this).val();
					var string = word.get('string');

					//if typer is cporrect
					if(string.toLowerCase().indexOf(typed_string.toLowerCase()) == 0) {
						word.set({highlight:typed_string.length});
						wordcorecction = false;
						if(typed_string.length == string.length) {
							$(this).val('');
							score.model.increaseScore();
							console.log(wordcorecction)

						}
					} else {
						word.set({highlight:0});
					}
				}
				//if typer is wrong
				if(  wordcorecction ) {
					score.model.decreaseScore();
				}
			});
		
		$(this.el)
			.append(wrapper
				.append($('<form>')
					.attr({
						role:'form'
					})
					.submit(function() {
						return false;
					})
					.append(text_input)));
		
		text_input.css({left:((wrapper.width() - text_input.width()) / 2) + 'px'});
		text_input.focus();
		
		this.listenTo(this.model, 'change', this.render);
		
	},
	
	render: function() {
		var model = this.model;
		var words = model.get('words');
		
		for(var i = 0;i < words.length;i++) {
			var word = words.at(i);
			if(!word.get('view')) {
				var word_view_wrapper = $('<div>');
				this.wrapper.append(word_view_wrapper);
				word.set({
					view:new WordView({
						model: word,
						el: word_view_wrapper
					})
				});
			} else {
				word.get('view').render();
			}
		}
	}
});


//controller button
var ButtonControlView = Backbone.View.extend({
	initialize: function(){
		var container = $('<div>').css({
			position: 'fixed',
			top: '20%',
			left: '0px',
			padding : '20px',
			width: 'auto',
			'box-shadow':'0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
			height: 'auto',
			'z-index': '2',
			'background-color': ''
		}).addClass('controller')

		//add controller button

		container.append('<div  class= "row"> <button id="play" disabled class="btn btn-success"> <i class="glyphicon glyphicon-play"></i></button></div> '+
		'<div  class= "row top-buffer"> <button id="pause" class="btn  btn-info"> <i class="glyphicon glyphicon-pause"></i></button></div>'+
		'<div class= "row top-buffer"> <button  id="stop" class="btn  btn-danger "> <i class="glyphicon glyphicon-stop"></i></button></div>');

		$(this.el).append(container);
		
	},


	//event for button control 
	events: {
		"click #play": "clickStart",
		"click #stop": "clickStop",
		"click #pause": "clickPause",
	},

	clickStart : function(){
		this.model.start();
		$('#play').attr('disabled', true);
		$('#pause').attr('disabled', false);
		$('.form-control').attr('disabled', false);
	},

	clickStop: function() {
		this.model.stop();
		$('#play').attr('disabled', false);
		$('#pause').attr('disabled', true);
		$('.form-control').attr('disabled', true);
	},

	clickPause: function (){
		this.model.pause();
		$('#play').attr('disabled', false);
		$('#pause').attr('disabled', true);
		$('.form-control').attr('disabled', true);
	}

	// render:function() {

	// }


});

var scoreModel = Backbone.Model.extend({
	defaults:{
		value: 0
	},

	increaseScore: function() {
		this.set({value:this.get('value') + 25});
		console.log(this.get('value'));
		$('#score').html(this.get('value'));
	},

	decreaseScore: function (){
		if(this.get('value') > 0){
			this.set({value:this.get('value') - 10});
			$('#score').html(this.get('value'));
		}
		
	},

	
});

var scoreView = Backbone.View.extend({
	initialize:function(){
		this.render();
	},

	render:function(){
		var containerScore = $('<div>').css({
			bottom : '12px',
			height :'auto',

		}).addClass('row top-buffer  text-center');

		containerScore.append('<div class="row"><div class="row"><h4>Score</h4></div><div class="row"><span id="score" class="badge">'+this.model.get('value')+'</span></div></div>');
		$(this.el).append(containerScore)

	}

});



var Typer = Backbone.Model.extend({
	defaults:{
		max_num_words:10,
		min_distance_between_words:50,
		words:new Words(),
		min_speed:1,
		max_speed:5,
		looping: null,
	},
	
	initialize: function() {
		new TyperView({
			model: this,
			el: $(document.body)
		});

		new ButtonControlView({
			el:$(document.body),
			model: this
		});

		score = new scoreView({
			el:$('.controller'),
			model: new scoreModel()
		});
	},

	start: function() {
		var animation_delay = 100;
		var self = this;
		var looping =  setInterval(function() {
			self.iterate();
		},animation_delay);
		self.set('looping',looping);
	},

	pause: function () {
		clearInterval(this.get('looping'));
	},

	stop: function () {
		clearInterval(this.get('looping'));
		var words = this.get('words');
		for (var i = words.length - 1; i >= 0; i--) {
			words.remove(words.at(i));
		}
	},
	
	iterate: function() {
		var words = this.get('words');
		if(words.length < this.get('max_num_words')) {
			var top_most_word = undefined;
			for(var i = 0;i < words.length;i++) {
				var word = words.at(i);
				if(!top_most_word) {
					top_most_word = word;
				} else if(word.get('y') < top_most_word.get('y')) {
					top_most_word = word;
				}
			}
			
			if(!top_most_word || top_most_word.get('y') > this.get('min_distance_between_words')) {
				var random_company_name_index = this.random_number_from_interval(0,company_names.length - 1);
				var string = company_names[random_company_name_index];
				var filtered_string = '';
				for(var j = 0;j < string.length;j++) {
					if(/^[a-zA-Z()]+$/.test(string.charAt(j))) {
						filtered_string += string.charAt(j);
					}
				}
				
				var word = new Word({
					x:this.random_number_from_interval(0,$(window).width()),
					y:0,
					string:filtered_string,
					speed:this.random_number_from_interval(this.get('min_speed'),this.get('max_speed'))
				});
				words.add(word);
			}
		}
		
		var words_to_be_removed = [];
		for(var i = 0;i < words.length;i++) {
			var word = words.at(i);
			word.move();
			
			if(word.get('y') > $(window).height() || word.get('move_next_iteration')) {
				words_to_be_removed.push(word);
			}
			
			if(word.get('highlight') && word.get('string').length == word.get('highlight')) {
				word.set({move_next_iteration:true});
			}
		}
		
		for(var i = 0;i < words_to_be_removed.length;i++) {
			words.remove(words_to_be_removed[i]);
		}
		
		score.trigger('change');
		this.trigger('change');
	},
	
	random_number_from_interval: function(min,max) {
	    return Math.floor(Math.random()*(max-min+1)+min);
	}
});