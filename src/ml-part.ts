import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

export async function prepareModel() {
  const model = await mobilenet.load();
  //warm up
  const img = tf.ones([1, 224, 224, 3]);
  await model.classify(img);
  return {
    predict: async img => {
      const predictions = await model.classify(img);
      const topPred = predictions[0];
      return {
        label: topPred.className,
        prob: topPred.probability
      };
    }
  };
}
