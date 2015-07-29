//JS modules
var _ = require('lodash');

/**
* @author David B - laopunk 
* @class notePlayer
* @classdesc A musical note that can be played in a browser. Plays for however long it has been defined to.
* @param {Object} obj 						- properties needed to instanciate the class
* @param {Object} obj.keynb 				- corresponding number on a piano keyboard
* @param {Object} obj.freq 					- sound frequency, in Hertz
* @param {Object} obj.octave 				- musical octave the note belongs to [1-8]
* @param {Object} obj.name 					- Full name of the note
* @property {number}  pianoKeyNb            - corresponding number on a piano keyboard
* @property {number}  frequency             - sound frequency, in Hertz
* @property {number}  octave                - musical octave the note belongs to [1-8]
* @property {string}  name                  - Full name of the note
* @property {number}  duration              - length of time the sound has to be played, in seconds
* @property {number}  volume                - volume [0-1]
* @property {Object} audioContext           - WebAudio audioContext
* @property {Object} destinationNode        - WebAudio destinationNode
*/
function notePlayer(obj){
	try{
		//properties
	    this.pianoKeyNb = obj.keynb
	    this.frequency = obj.freq
	    this.octave = obj.name.substr(-1,1)
	    this.name = obj.name
	    this.duration = _.random(0.5,3,true)
	    this.volume = 1;

	    //audio API
	    this.audioContext = (obj.audioContext === void 0) ? new (window.AudioContext || window.webkitAudioContext)() : obj.audioContext;
	    this.destinationNode = this.audioContext.destination
	}catch(err){
		console.error(err)
		return null
	}

}

/**
 * @function buildFromName
 * @description builds a notePlayer from a specific musical note name
 * @example buildFromName("C4")
 * @param {string} noteName 		- Concatenation of note + octave [1-8]
 * @param {Object} [audioContext] - The audioContext to render the sound. Created if not provided
 */

notePlayer.buildFromName = function(noteName,audioContext){
	try{
		n = _(this.getNotesInfo()).find(function(e){
			return e.name == noteName
		})
		if ( !n) { throw "Invalid note name: "+noteName}
		else{
			n.audioContext = audioContext
			return new notePlayer(n)
		}
	}catch(e){
		console.error("NOTEPLAYER ERROR: "+e)
		return null
	}
}

/**
 * @function buildFromFrequency
 * @description builds a notePlayer from a specific frequence
 * @example buildFromFrequency(440)
 * @param {number} noteFreq 		- sound frequency, in Hertz
 * @param {Object} [audioContext] - The audioContext to render the sound. Created if not provided
 */
notePlayer.buildFromFrequency = function(noteFreq,audioContext){
	try{
		list = this.getNotesInfo()
		//eliminate junk
		if (noteFreq < list[0].freq || noteFreq > list[list.length-1].freq) {
			throw "Invalid frequency (out of range): "+noteFreq
			return null
		}
		//find closest frequency
		closest = list.reduce(function (prev, curr) {
			return (Math.abs(curr.freq - noteFreq) < Math.abs(prev.freq - noteFreq) ? curr : prev);
		});
		console.log("closest frequency is "+closest.freq+" which is for "+closest.name)
		return this.buildFromName(closest.name,audioContext)
	}catch(e){
		console.error("NOTEPLAYER ERROR: "+e)
		return null
	}
}


/**
 * @function buildFromKeyNb
 * @description builds a notePlayer from a specific piano key number
 * @example buildFromKeyNb(49)
 * @param {number} noteKeyNb 		- corresponding number on a piano keyboard
 * @param {Object} [audioContext] - The audioContext to render the sound. Created if not provided
 */
notePlayer.buildFromKeyNb = function(noteKeyNb,audioContext){
	n = _(this.getNotesInfo()).find(function(e){
		return e.keynb == noteKeyNb
	})
	n.audioContext = audioContext
	return new notePlayer(n)
}

/**
 * @function buildFromKeyNb
 * @description builds a notePlayer from a specific piano key number
 * @example buildFromKeyNb(49)
 * @param {number} noteKeyNb 		- corresponding number on a piano keyboard
 * @param {Object} [audioContext] - The audioContext to render the sound. Created if not provided
 */
notePlayer.getNotesInfo = function(){
	DICT_KEYS = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"]
	DICT_OCTAVES =[0,1,2,3,4,5,6,7,8]
	FREQ = 25.95654359874657 //starting point for G#-1
	KEYNB = 0      //sarting point for A0
	return _(DICT_OCTAVES).map(function(v,k){
		return _(DICT_KEYS).map(function(v2,k2){
			KEYNB++
            FREQ = FREQ * Math.pow(2, 1/12)
            return {
            	  "keynb": KEYNB
                , "freq": FREQ
                , "name": v2+v
            }
		})
		.value()
	})
    .flatten()
    .dropRightWhile(function(e,i){
       return i >= 88
    })
    .value()
}



/**
 * @function play
 * @description plays the note
 * @example play(function(){console.log("end play")})
 * @param {Function} [callback] 		- callback function
 */
notePlayer.prototype.play = function(callback) {
	console.log("Note "+this.name+" will play for a duration of "+this.duration)
	//creating oscillator & gain
	var oscillator = this.audioContext.createOscillator()
    oscillator.frequency.value = this.frequency
	var gainNode = this.audioContext.createGain()
	gainNode.gain.value = this.volume

    //Connections
    oscillator.connect(gainNode)
    gainNode.connect(this.destinationNode)
	//launch play
	oscillator.start()

	//event listeners
	t_np = this
	setTimeout(function(){
		oscillator.stop()
	}, this.duration * 1000); //leaving time for the fadeout

	oscillator.onended = function() {
		console.log('Note has now finished playing');
		if( callback ) { callback() }
	}
};

/**
 * @function setAudioContext
 * @description assigns a specific audiocontext to the note
 * @example setAudioContext(ac)
 * @param {Object} ac 		- Web Audio audioContext
 */
notePlayer.prototype.setAudioContext = function(ac) {
	this.audioContext = (ac == void 0) ? this.audioContext : ac;	
};

/**
 * @function setDestinationNode
 * @description assigns a specific destination node to the note (any connectable audioNode)
 * @example setDestinationNode(audioContext.destination)
 * @param {Object} dn 		- Web Audio destinationNode
 */
notePlayer.prototype.setDestinationNode = function(dn) {
	this.destinationNode = (dn === void 0) ? this.audiocontext.destination : dn;
};

/**
 * @function setDuration
 * @description changes the time the note has to be played for
 * @example setDuration(2.3)
 * @param {Number} d 		- Time to play the note for, in second
 */
notePlayer.prototype.setDuration = function(d) {
	this.duration = (d === void 0) ? this.duration : d;
};

/**
 * @function setVolume
 * @description changes the volume
 * @example setVolume(0.5)
 * @param {Number} v 		- Volume level
 */
notePlayer.prototype.setVolume = function(v) {
	this.volume = (v === void 0) ? this.volume : v;
};



module.exports = notePlayer