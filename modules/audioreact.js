class CLAudioReactor {
    static analyser;
    static sampleBuffer;

    static scale = (num, in_min, in_max, out_min, out_max) => {
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    static initAnalyser(){
        CLAudioReactor.analyser = Howler.ctx.createAnalyser();
        CLAudioReactor.analyser.fftSize = 2048;
        Howler.masterGain.connect(CLAudioReactor.analyser);
        CLAudioReactor.sampleBuffer = new Float32Array(CLAudioReactor.analyser.fftSize);
        
    }
    static getAudioPower(pointSource, currentPeak, smoothing = 5, band = 5, minIncrease = 1, maxDecrease = 0.1){
        if(!CLAudioReactor.analyser){
            CLAudioReactor.initAnalyser();
        }
        
        if(!pointSource.maxdb || !pointSource.mindb){
            pointSource.maxdb = CLAudioReactor.analyser.maxDecibels;
            pointSource.mindb = CLAudioReactor.analyser.minDecibels;
        }

        CLAudioReactor.analyser.getFloatTimeDomainData(CLAudioReactor.sampleBuffer);

        smoothing = 11 - smoothing; // 'invert' smoothing
        const finalSmoothing = 0.005 * smoothing;
        

        let peakInstantaneousPower = 0;
        for (let i = 0; i < CLAudioReactor.sampleBuffer.length; i++) {
          const power = CLAudioReactor.sampleBuffer[i] ** 2;
          peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
        }
        const avgPowerDecibels = 10 * Math.log10(peakInstantaneousPower);

        if(Number.isFinite(avgPowerDecibels)){
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

        console.log(newPeak);

        return newPeak;
    }
}