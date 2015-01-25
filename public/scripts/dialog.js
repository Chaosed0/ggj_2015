define(['jquery'], function($) {
	var width, height;

	var dialog = {
		init: function(w, h) {
			width = w;
			height = h;
		},

		generateCharacter: function() {
            return unescape("%u" + (9472 + parseInt(Math.random() * 300)).toString(16));
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

            return s;
        },

        displayDialogText: function(dialog) {
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
			$("#dialog").html(dialog);
        },

        currentlyPlaying: false,
        playDialog: function(baseFreq, baseDur, length) {
            console.log(baseFreq, baseDur);
            if (!this.currentlyPlaying) {
                this.currentlyPlaying = true;
                this.displayDialogText(this.generateDialog());
                this._playDialog(baseFreq, baseDur, length);
            }
        },
        _playDialog: function(baseFreq, baseDur, length) {
            length = typeof length !== 'undefined' ? length : 20;
            baseFreq = typeof baseFreq !== 'undefined' ? baseFreq : 100;
            baseDur = typeof baseDur !== 'undefined' ? baseDur : 25;

            if (this.supportsAudio && length) {
                var freq = parseInt(baseFreq + Math.random() * 300);
                var duration = parseInt(baseDur + Math.random() * 50);

                var osc = this.audioContext.createOscillator();
                osc.connect(this.audioContext.destination);
                osc.frequency.value = freq;
                osc.type = ["square", 'triangle', 'sine', 'sawtooth'][Math.floor(Math.random() *4)];
                osc.start(0);

                var _this = this;
                setTimeout(function() {
                    osc.stop(0);
                    _this._playDialog(baseFreq, baseDur, length-1);

                }, duration);
            } else {
                this.currentlyPlaying = false;
                //this.dialogText.destroy();
                $("#dialog").html("");
            }
        }
	};

	try {
        new webkitAudioContext();
        dialog.supportsAudio = true;
        dialog.audioContext = new webkitAudioContext();
    } catch (e) {
        dialog.supportsAudio = false;
    }

	return dialog;
});