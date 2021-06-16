class CLAudioReactor {
    // 0 = mono, 1 = left, 2 = right
    static analyser = [];
    static sampleBuffer;

    static embigenner;

    static soundboardAnalyser = [];
    static soundboardSampleBuffer;
    
    static freqPowers = [
        [],
        [],
        []
    ];
    static soundboardFreqPowers = [
        [],
        [],
        []
    ];

    // static rollingAverageDecibels = []; // Create a queue


    static startAnalysis() {
        var analysisStartupInterval = setInterval(() => {
            if(game.audio.context){
            if (!CLAudioReactor.soundboardAnalyser[0]) {
                CLAudioReactor.initSoundboardAnalyser();
            }
    
            if (!CLAudioReactor.analyser[0]) {
                CLAudioReactor.initAnalyser();
            }
            clearInterval(analysisStartupInterval)

            let runs = 0;
            canvas.app.ticker.add(() => {
                if(!game.audio.context){
                    CLAudioReactor.initAnalyser();
                    CLAudioReactor.initSoundboardAnalyser();
                    return;
                }
                if(!CLAudioReactor.analyser[0]){
                    return;
                }
                if (!CLAudioReactor.soundboardAnalyser[0]) {
                    CLAudioReactor.initSoundboardAnalyser();
                }
                if(++runs >= 2){
                    runs = 0;
                }
                if(runs == 0){
                // for (let i of [0, 1, 2]){
                for (let i of [0]){
                    CLAudioReactor.analyser[i].getByteFrequencyData(CLAudioReactor.sampleBuffer[i])
                    if(CLAudioReactor.soundboardAnalyser[i]){
                        CLAudioReactor.soundboardAnalyser[i].getByteFrequencyData(CLAudioReactor.soundboardSampleBuffer[i])
                    }
                }
                    CLAudioReactor.calculateFreqPowers();
                }
            })

            }
        }, 1000);
    }

    static calculateFreqPowers() {
        // TODO Implement stereo channels
        // for (let i of [0, 1, 2]) {
        for (let i of [0]){
            CLAudioReactor.freqPowers[i][0] = CLAudioReactor.getEnergy("bass", 0, i);
            CLAudioReactor.freqPowers[i][1] = CLAudioReactor.getEnergy("mid", 0, i);
            CLAudioReactor.freqPowers[i][2] = CLAudioReactor.getEnergy("treble", 0, i);
            if(CLAudioReactor.soundboardAnalyser[i]){
                CLAudioReactor.soundboardFreqPowers[i][0] = CLAudioReactor.getEnergy("bass", 0, i, true);
                CLAudioReactor.soundboardFreqPowers[i][1] = CLAudioReactor.getEnergy("mid", 0, i, true);
                CLAudioReactor.soundboardFreqPowers[i][2] = CLAudioReactor.getEnergy("treble", 0, i, true);
            }
        }
    }

    static _freqToBin(freq, rounding = 'round', soundBoard = false) {
        let analyser = soundBoard?CLAudioReactor.soundboardAnalyser[0]:CLAudioReactor.analyser[0];
        const max = analyser.frequencyBinCount - 1,
            bin = Math[rounding](freq * analyser.fftSize / game.audio.context.sampleRate);

        return bin < max ? bin : max;
    }

    static getEnergy(startFreq, endFreq, channel = 0, soundBoard = false) {

        var freqString = startFreq;
        // if startFreq is a string, check for presets
        if (startFreq != (startFreq | 0)) {
            // if ( startFreq == 'peak' )
            //     return CLAudioReactor._energy.peak;

            const presets = {
                bass: [20, 250],
                lowMid: [250, 500],
                mid: [500, 2e3],
                highMid: [2e3, 4e3],
                treble: [4e3, 16e3]
            }

            if (!presets[startFreq])
                return null;

            [startFreq, endFreq] = presets[startFreq];
        }

        const startBin = CLAudioReactor._freqToBin(startFreq, 'round', soundBoard),
            endBin = endFreq ? CLAudioReactor._freqToBin(endFreq, 'round', soundBoard) : startBin;

        let buffer = soundBoard?CLAudioReactor.soundboardSampleBuffer:CLAudioReactor.sampleBuffer;
        let analysers = soundBoard?CLAudioReactor.soundboardAnalyser:CLAudioReactor.analyser;
        let energy = 0;
        let clipped = false;
        for (let i = startBin; i <= endBin; i++) {
            if(buffer[channel][i] >= 255){
                clipped = true;
            }
            energy += buffer[channel][i];
        }
        if(clipped){
            console.log('CLIP ' + freqString);
            analysers[channel].maxDecibels += 2;
        } else if (analysers[channel].maxDecibels > -80) {
            analysers[channel].maxDecibels -= 0.01;
        }
        return energy / (endBin - startBin + 1) / 255;
    }

    static getEZFreqPower(index, soundBoard = false, channel = 0, special) {
        // if (index == 0 || index == 1) {
        // if(special == 'Boost'){
        //     return Math.pow(CLAudioReactor.freqPowers[channel][index] || 0, 6) * 4;
        // }
        // }
        return soundBoard?CLAudioReactor.soundboardFreqPowers[channel][index] || 0:CLAudioReactor.freqPowers[channel][index] || 0;
    }

    static getAudioFreqPower(pointSource, currentPeak, smoothing = 5, band = [0,63], minIncrease = 1, maxDecrease = 0.1, soundBoard = false){
        console.log("CL: getAudioFreqPower not currently supported. Use getEZFreqPower");
        return;
    }


    static initAnalyser(){
        if(game.audio.context){
            var audioCtx = game.audio.context;

            const splitter = audioCtx.createChannelSplitter(2);
            const merger = audioCtx.createChannelMerger(2);
            CLAudioReactor.embigenner = audioCtx.createGain();

            // for (let i of [0, 1, 2]) {
            for (let i of [0]) {
                CLAudioReactor.analyser[i] = audioCtx.createAnalyser();
                CLAudioReactor.analyser[i].fftSize = 512;
                CLAudioReactor.analyser[i].maxDecibels = -25;
                CLAudioReactor.analyser[i].smoothingTimeConstant = 0.8;
            }
            
            // CLAudioReactor.embigenner.connect(splitter);

            // for (let i of [1, 2]) {
            //     splitter.connect(CLAudioReactor.analyser[i], i - 1);
            //     CLAudioReactor.analyser[i].connect(merger, 0, i - 1);
            // }
            
            // merger.connect(CLAudioReactor.analyser[0]);

            // REMOVE and uncomment above for stereo
            CLAudioReactor.embigenner.connect(CLAudioReactor.analyser[0]);

            CLAudioReactor.sampleBuffer = [new Uint8Array(CLAudioReactor.analyser[0].frequencyBinCount),
            new Uint8Array(CLAudioReactor.analyser[0].frequencyBinCount),
            new Uint8Array(CLAudioReactor.analyser[0].frequencyBinCount)
            ];
            game.audio.playing.forEach((sound)=>{
                CLAudioReactor.attemptEmbiggen(sound);
            })
        }
    }

    static initSoundboardAnalyser(){
        if(game.audio.soundboardGain){
            var audioCtx = game.audio.context;
            // for (let i of [0, 1, 2]) {
            for (let i of [0]) {
                CLAudioReactor.soundboardAnalyser[i] = audioCtx.createAnalyser();
                CLAudioReactor.soundboardAnalyser[i].fftSize = 512;
                CLAudioReactor.soundboardAnalyser[i].maxDecibels = -25;
                CLAudioReactor.soundboardAnalyser[i].smoothingTimeConstant = 0.8;
            }
            game.audio.soundboardGain.connect(CLAudioReactor.soundboardAnalyser[0]);
            CLAudioReactor.soundboardSampleBuffer =[new Uint8Array(CLAudioReactor.soundboardAnalyser[0].frequencyBinCount),
            new Uint8Array(CLAudioReactor.soundboardAnalyser[0].frequencyBinCount),
            new Uint8Array(CLAudioReactor.soundboardAnalyser[0].frequencyBinCount)
            ];
        }
    }

    static attemptEmbiggen = (sound, retryCount = 0)=>{
        if(canvas.sounds.placeables.filter((soundPlaceable)=>{
            return soundPlaceable.sound.id === sound.id;
        }).length > 0){
            // console.log("PLACEABLE");
            return;
        }
        if(sound.identifyingPath){
            // console.log("SoundBoard");
            return;
        }
        if(retryCount >= 50){
            // console.log("Timed out");
            return;
        }
        if(!sound.node || !sound.node.buffer){
            if(sound?.node?._clConnected){
                delete sound.node._clConnected;
                return;
            }
            if(sound.loaded){
                return;
            }
            console.log("Retry: "+sound.src);
            setTimeout(()=>{this.attemptEmbiggen(sound, ++retryCount);}, 500);
            return;
        }
        if (!sound.container.sourceNode._clConnected) {
            sound.container.sourceNode.connect(CLAudioReactor.embigenner)
            sound.container.sourceNode._clConnected = true;
            console.log("CommunityLightingAudio: Connecting EMBIGGENER");
        } else if (sound.container.sourceNode._clConnected !== true) {
            setTimeout(()=>{attemptEmbiggen(sound, ++retryCount);}, 500);
        } 
    }
}