// Reference: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._values = new Float32Array(2048);
  }
  process(inputs) {
    const input = inputs[0];
    if (input.length > 0 && input[0].length > 0) {
      const inputData = input[0];
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i];
      }
      const average = sum / inputData.length;
      this.port.postMessage({ average });
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
