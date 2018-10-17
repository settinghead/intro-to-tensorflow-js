import * as React from "react";
import { render } from "react-dom";
import Webcam from "./webcam";
import { throttle } from "./utils";
import { prepareModel } from "./ml-part";

class App extends React.Component<any, any> {
  velem: HTMLVideoElement;
  celem: HTMLCanvasElement;

  state = { label: "", prob: 0 };

  async componentDidMount() {
    const net = await prepareModel();
    const cam = new Webcam(this.velem);
    await cam.setup();
    const _snapAndDrawOneFrame = async () => {
      if (this.celem && this.velem) {
        const ctx = this.celem.getContext("2d") as CanvasRenderingContext2D;
        const vw = this.velem.videoWidth;
        const vh = this.velem.videoHeight;
        const size = vw < vh ? vw : vh;
        const centerw = vw / 2;
        const bw = centerw - size / 2;
        ctx.drawImage(
          this.velem,
          bw,
          0,
          size,
          this.velem.videoHeight,
          0,
          0,
          224,
          224
        );
      }
    };
    const throttledSnapOne = throttle(_snapAndDrawOneFrame, 100);
    const model = {};
    const labels = [];

    const _getNextPrediction = async () => {
      try {
        const img = cam.capture();
        const { prob, label } = await net.predict(img, labels);
        return { prob, label };
      } catch (e) {
        console.error(e);
        return { label: "__error", prob: 0 };
      }
    };

    const throttledGetNextPredict = throttle(_getNextPrediction, 200);

    const predictLoop = async () => {
      while (true) {
        const { prob, label } = await throttledGetNextPredict();
        this.setState({
          label,
          prob
        });
      }
    };

    const drawCamLoop = async () => {
      while (true) {
        await throttledSnapOne();
      }
    };

    predictLoop();
    drawCamLoop();
  }

  render() {
    return (
      <div>
        <video
          ref={(e: HTMLVideoElement) => (this.velem = e)}
          style={{ visibility: "hidden", position: "fixed" }}
          autoPlay
          playsInline
          muted
          id="webcam"
          width="224"
          height="224"
        />
        <canvas
          ref={(e: HTMLCanvasElement) => (this.celem = e)}
          width="224"
          height="224"
          style={{ width: 448 }}
          id="cropped"
        />
        <h3 style={{ color: this.state.prob > 0.9 ? "green" : "#aaa" }}>
          Predicted label: {this.state.label}
          <br />Prob: {this.state.prob}
        </h3>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
