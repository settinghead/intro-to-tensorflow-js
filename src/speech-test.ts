async function speechTest() {
  // When calling `create()`, you must provide the type of the audio input.
  // The two available options are `BROWSER_FFT` and `SOFT_FFT`.
  // - BROWSER_FFT uses the browser's native Fourier transform.
  // - SOFT_FFT uses JavaScript implementations of Fourier transform
  //   (not implemented yet).
  const recognizer = speechCommands.create("BROWSER_FFT");

  // Make sure that the underlying model and metadata are loaded via HTTPS
  // requests.
  await recognizer.ensureModelLoaded();

  // See the array of words that the recognizer is trained to recognize.
  const labels = recognizer.wordLabels();
  console.log("Recognizable words", labels);
  // `startStreaming()` takes two arguments:
  // 1. A callback function that is invoked anytime a word is recognized.
  // 2. A configuration object with adjustable fields such a
  //    - includeSpectrogram
  //    - probabilityThreshold
  console.log("Dictation started.");
  recognizer.startStreaming(
    result => {
      // - result.scores contains the probability scores that correspond to
      //   recognizer.wordLabels().
      // - result.spectrogram contains the spectrogram of the recognized word.
      console.log(
        labels[
          tf
            .tensor1d(result.scores)
            .argMax()
            .dataSync()[0]
        ]
      );
    },
    {
      includeSpectrogram: true,
      probabilityThreshold: 0.97
    }
  );

  // Stop the recognition in 10 seconds.
  // setTimeout(() => recognizer.stopStreaming(), 10e3);
}
