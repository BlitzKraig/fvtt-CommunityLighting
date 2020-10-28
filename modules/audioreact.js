class CLAudioReactor {
    static analyser;
    static sampleBuffer;

    // TODO: Make this extendable. Ok for now
    static soundboardAnalyser;
    static soundboardSampleBuffer;

    static scale = (num, in_min, in_max, out_min, out_max) => {
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    static initAnalyser(){
        CLAudioReactor.analyser = Howler.ctx.createAnalyser();
        CLAudioReactor.analyser.fftSize = 128;
        CLAudioReactor.analyser.maxDecibels = 0;
        Howler.masterGain.connect(CLAudioReactor.analyser);
        CLAudioReactor.sampleBuffer = new Float32Array(CLAudioReactor.analyser.frequencyBinCount);
    }

    static initSoundboardAnalyser(){
        if(Howler.soundboardGain){
            CLAudioReactor.soundboardAnalyser = Howler.ctx.createAnalyser();
            CLAudioReactor.soundboardAnalyser.fftSize = 128;
            CLAudioReactor.soundboardAnalyser.maxDecibels = 0;
            Howler.soundboardGain.connect(CLAudioReactor.soundboardAnalyser);
            CLAudioReactor.soundboardSampleBuffer = new Float32Array(CLAudioReactor.soundboardAnalyser.frequencyBinCount);
        }
    }
    
    static getAudioPeak(pointSource, currentPeak, smoothing = 5, minIncrease = 1, maxDecrease = 0.1, soundBoard = false){
        
        if(soundBoard){
            if(!CLAudioReactor.soundboardAnalyser){
                CLAudioReactor.initSoundboardAnalyser();
            }
        } else {
            if(!CLAudioReactor.analyser){
                CLAudioReactor.initAnalyser();
            }
        }

        var analyser = soundBoard?CLAudioReactor.soundboardAnalyser:CLAudioReactor.analyser;
        var sampleBuffer = soundBoard?CLAudioReactor.soundboardSampleBuffer:CLAudioReactor.sampleBuffer;

        if(!analyser || !sampleBuffer){
            return;
        }
        
        if(!pointSource.maxdb || !pointSource.mindb){
            pointSource.maxdb = analyser.maxDecibels;
            pointSource.mindb = analyser.minDecibels;
        }

        analyser.getFloatTimeDomainData(sampleBuffer);

        smoothing = 11 - smoothing; // 'invert' smoothing
        const finalSmoothing = 0.005 * smoothing;
        

        let peakInstantaneousPower = 0;
        // peakInstantaneousPower = CLAudioReactor.sampleBuffer[0] ** 2;
        // for (let i = Math.floor(CLAudioReactor.sampleBuffer.length/10 * (band-1)); i < Math.floor(CLAudioReactor.sampleBuffer.length/10 * band); i++) {
        for (let i = 0; i < sampleBuffer.length; i++) {
          const power = sampleBuffer[i] ** 2;
          peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
        }
        const avgPowerDecibels = 10 * Math.log10(peakInstantaneousPower);

        if(Number.isFinite(avgPowerDecibels) && avgPowerDecibels > -200){
            if(avgPowerDecibels > pointSource.maxdb){
                pointSource.maxdb = avgPowerDecibels;
            } else if(avgPowerDecibels < pointSource.mindb) {
                pointSource.mindb = avgPowerDecibels;
            } else {
                pointSource.maxdb -= maxDecrease;
                pointSource.mindb += minIncrease;
            }
            var newPeak = CLAudioReactor.scale(avgPowerDecibels, pointSource.mindb, pointSource.maxdb, 0, 1)
        } else {
            var newPeak = 0
        }
        if(newPeak < currentPeak - finalSmoothing){
            newPeak = currentPeak - finalSmoothing;
        } else if (newPeak > currentPeak + finalSmoothing * 5) {
            newPeak = currentPeak + finalSmoothing * 5;
        }

        return newPeak;
    }

    static getAudioFreqPower(pointSource, currentPeak, smoothing = 5, band = [0,63], minIncrease = 1, maxDecrease = 0.1, soundBoard = false){
        if(soundBoard){
            if(!CLAudioReactor.soundboardAnalyser){
                CLAudioReactor.initSoundboardAnalyser();
            }
        } else {
            if(!CLAudioReactor.analyser){
                CLAudioReactor.initAnalyser();
            }
        }

        var analyser = soundBoard?CLAudioReactor.soundboardAnalyser:CLAudioReactor.analyser;
        var sampleBuffer = soundBoard?CLAudioReactor.soundboardSampleBuffer:CLAudioReactor.sampleBuffer;

        if(!analyser || !sampleBuffer){
            return;
        }

        if(!pointSource.maxdb || !pointSource.mindb){
            pointSource.maxdb = analyser.maxDecibels;
            pointSource.mindb = analyser.minDecibels;
        }

        analyser.getFloatFrequencyData(sampleBuffer);

        smoothing = 11 - smoothing; // 'invert' smoothing
        const finalSmoothing = 0.005 * smoothing;

        var analysisBand = sampleBuffer.slice(Math.min(...band), Math.max(...band)+1);
        
        // if(analysisBand.length == CLAudioReactor.sampleBuffer.length){
        //     var avgPowerDecibels = (Math.min(...analysisBand) + Math.max(...analysisBand)) / 2;
        // }else{
            const avgPowerDecibels = Math.max(...analysisBand);
        // }
        

        if(Number.isFinite(avgPowerDecibels) && avgPowerDecibels > -200){
            if(avgPowerDecibels > pointSource.maxdb){
                pointSource.maxdb = avgPowerDecibels;
            } else if(avgPowerDecibels < pointSource.mindb) {
                pointSource.mindb = avgPowerDecibels;
            } else {
                pointSource.maxdb -= maxDecrease;
                pointSource.mindb += minIncrease;
            }
            var newPeak = CLAudioReactor.scale(avgPowerDecibels, pointSource.mindb, pointSource.maxdb, 0, 1)
        } else {
            var newPeak = 0
        }
        if(newPeak < currentPeak - finalSmoothing){
            newPeak = currentPeak - finalSmoothing;
        } else if (newPeak > currentPeak + finalSmoothing * 5) {
            newPeak = currentPeak + finalSmoothing * 5;
        }

        return newPeak;
    }
}