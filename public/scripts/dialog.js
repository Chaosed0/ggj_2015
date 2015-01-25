define(['jquery'], function($) {
	var width, height;

	var dialog = {
		credits: false,

		init: function(w, h) {
			width = w;
			height = h;
		},

        setEntity: function(entity) {
            this._entity = entity;
        },

		generateCharacter: function() {
            return unescape("%u" + (9472 + parseInt(Math.random() * 300)).toString(16));
        },

        addArrowToDialog: function(s) {
        	var p = Crafty("Player").get(0);
        	var t = Crafty("Trinket").get(0);

        	var dx = p.x - t.x;
        	var dy = p.y - t.y;

        	if (Math.abs(dx) > 100 || Math.abs(dy) > 100) {
        		var f;

        		//Horizontal
        		if (Math.abs(dx) >= Math.abs(dy)) {
        			if (dx >= 0) {
        				f = "☜";
        			} else {
        				f = "☞";
        			}
        		} else { //Vertical
        			if (dy <= 0) {
        				f = "☟";
        			} else {
        				f = "☝";
        			}
        		}

        		var i = parseInt(Math.random() * s.length);

        		return s.substr(0, i) + f + s.substr(i+1);
        	}

        	return s;
        },

        generateDialog: function(length) {
            length = typeof length !== 'undefined' ? length : 20;

            var s = this.generateCharacter();

            while (s.length < length) {
                if (Math.random() < .3) {
                    s += " ";
                } else {
                    s += this.generateCharacter();
                }
            }

            return this.addArrowToDialog(s);
        },

        displayDialogText: function(dialogText, i) {
            /*this.dialogText = Crafty.e("2D, Canvas, Text")
                .attr({
                    x: -Crafty.viewport.x + width/2,
                    y: -Crafty.viewport.y + 100,
                    z: 100
                })
                .text(dialog)
                .textFont({size: "30px"})
                .bind("EnterFrame", function(e) {
                	this.x = -Crafty.viewport.x + width/2;
                	this.y = -Crafty.viewport.y + 100;
                });*/
			var d = dialogText.substring(0, dialogText.length-i);
			$("#dialog").html(d);
        },

        currentlyPlaying: false,
        playDialog: function(baseFreq, baseDur, length, wave) {
            if (!this.currentlyPlaying) {
                this.currentlyPlaying = true;
                var dialogText = this.generateDialog(length);
                this._playDialog(dialogText, baseFreq, baseDur, length, wave);
            }
        },

        _playDialog: function(dialogText, baseFreq, baseDur, length, wave) {
            length = typeof length !== 'undefined' ? length : 20;
            baseFreq = typeof baseFreq !== 'undefined' ? baseFreq : 100;
            baseDur = typeof baseDur !== 'undefined' ? baseDur : 25;
            var waveTypes = ["square", 'triangle', 'sine', 'sawtooth'];
          	
            if (length) {
                var freq = parseInt(baseFreq + Math.random() * 300);
                var duration = parseInt(baseDur + Math.random() * 50);

                if (this.supportsAudio) {
	                var osc = this.audioContext.createOscillator();
	                //osc.connect(this.audioContext.destination);
	                osc.frequency.value = freq;
	                osc.type = typeof wave !== 'undefined' ? wave : 
	                	waveTypes[parseInt(Math.random() * 4)];

	                var gainNode = this.audioContext.createGain();
	                osc.connect(gainNode);
	                gainNode.connect(this.audioContext.destination);
	                gainNode.gain.value = .35;

	                osc.start(0);
	            }
                this.displayDialogText(dialogText, length);

                var _this = this;
                setTimeout(function() {
                	if (_this.supportsAudio) {
                    	osc.stop(0);
                    }
                    _this._playDialog(dialogText, baseFreq, baseDur, length-1, wave);

                }, duration);
            } else {
            	var _this = this;
            	setTimeout(function() {
            		_this.currentlyPlaying = false;
                    if(_this._entity) {
                        _this._entity.trigger("StopDialog");
                        delete _this._entity;
                    }
	                //this.dialogText.destroy();
	                if (!_this.credits) {
	                	$("#dialog").html("");
	                } else {
						var shareLink = window.location.protocol + "//" + window.location.host + window.location.pathname + "?seed=" + window.randomSeed;
	                	$("#dialog").html("Made by <a href='http://straypixels.net/' target='_blank'>Ed Lu</a> and <a href='http://jeremyneiman.com' target='_blank'>Jeremy Neiman</a><br/><br/>Share your adventure: <a href='"+shareLink+"'>"+shareLink+"</a>");
	                }
            	}, 500);
            }
        }
	};

	try {
        var ac = AudioContext || webkitAudioContext;
        dialog.audioContext = new ac();
        dialog.gainNode = dialog.audioContext.createGain();
        dialog.supportsAudio = true;
    } catch (e) {
        dialog.supportsAudio = false;
    }

	return dialog;
});
